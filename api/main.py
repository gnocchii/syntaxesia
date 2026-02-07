import os
from typing import AsyncIterator, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "").strip()
DEFAULT_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "Xb7hH8MSUJpSbSDYk0k2").strip()
DEFAULT_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2").strip()
DEFAULT_OUTPUT_FORMAT = os.getenv("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128").strip()
DEFAULT_STREAMING_LATENCY = os.getenv("ELEVENLABS_STREAMING_LATENCY", "2").strip()

app = FastAPI()

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

if allowed_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["*"],
    )


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    voice_id: Optional[str] = None
    model_id: Optional[str] = None


async def stream_elevenlabs_audio(
    text: str,
    voice_id: Optional[str],
    model_id: Optional[str],
) -> AsyncIterator[bytes]:
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=500, detail="Missing ELEVENLABS_API_KEY")

    resolved_voice_id = (voice_id or DEFAULT_VOICE_ID).strip()
    if not resolved_voice_id:
        raise HTTPException(status_code=400, detail="Missing voice_id")

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{resolved_voice_id}/stream"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "accept": "audio/mpeg",
        "content-type": "application/json",
    }
    params = {
        "output_format": DEFAULT_OUTPUT_FORMAT,
        "optimize_streaming_latency": DEFAULT_STREAMING_LATENCY,
    }
    resolved_model_id = (model_id or DEFAULT_MODEL_ID).strip()

    payload = {
        "text": text,
        "model_id": resolved_model_id,
        "voice_settings": {
            "stability": 0.35,
            "similarity_boost": 0.7,
            "style": 0.2,
            "use_speaker_boost": True,
        },
    }

    timeout = httpx.Timeout(30.0, connect=10.0)
    client = httpx.AsyncClient(timeout=timeout)
    request = client.build_request(
        "POST",
        url,
        headers=headers,
        params=params,
        json=payload,
    )
    response = await client.send(request, stream=True)

    if response.status_code >= 400:
        error_body = await response.aread()
        await response.aclose()
        await client.aclose()
        detail = error_body.decode("utf-8", errors="ignore") or "ElevenLabs error"
        raise HTTPException(status_code=response.status_code, detail=detail)

    async def iterator() -> AsyncIterator[bytes]:
        try:
            async for chunk in response.aiter_bytes():
                if chunk:
                    yield chunk
        finally:
            await response.aclose()
            await client.aclose()

    return iterator()


@app.get("/api/tts")
async def tts_get(
    text: str = Query(..., min_length=1, max_length=5000),
    voice_id: Optional[str] = None,
    model_id: Optional[str] = None,
):
    audio_stream = await stream_elevenlabs_audio(
        text=text,
        voice_id=voice_id,
        model_id=model_id,
    )
    return StreamingResponse(audio_stream, media_type="audio/mpeg")


@app.post("/api/tts")
async def tts_post(payload: TTSRequest):
    audio_stream = await stream_elevenlabs_audio(
        text=payload.text,
        voice_id=payload.voice_id,
        model_id=payload.model_id,
    )
    return StreamingResponse(audio_stream, media_type="audio/mpeg")
