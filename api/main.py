import os
import re
import math
import random
import json
import asyncio
from typing import AsyncIterator, Optional

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

load_dotenv(".env.local")
load_dotenv()  # also load .env as fallback

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "").strip()
DEFAULT_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "Xb7hH8MSUJpSbSDYk0k2").strip()
DEFAULT_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2").strip()
DEFAULT_OUTPUT_FORMAT = os.getenv("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128").strip()
DEFAULT_STREAMING_LATENCY = os.getenv("ELEVENLABS_STREAMING_LATENCY", "2").strip()
GEMINI_TEXT_MODEL = os.getenv("GEMINI_TEXT_MODEL", "gemini-1.5-flash-002").strip()

# Support multiple Gemini API keys for parallel generation
_gemini_keys = []
for _k in [os.getenv("GEMINI_API_KEY", ""), os.getenv("GEMINI_API_KEY_2", "")]:
    _k = _k.strip()
    if _k:
        _gemini_keys.append(_k)
_gemini_key_index = 0

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


# ============================================
# TTS (ElevenLabs)
# ============================================

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


# ============================================
# Image Generation (Google Imagen 4 via Gemini)
# ============================================

ELEMENT_COLORS = [
    {"key": "loop_count",          "name": "scarlet red",      "hex": "#ff1744"},
    {"key": "conditional_count",   "name": "burnt orange",     "hex": "#ff6d00"},
    {"key": "recursion_count",     "name": "cadmium yellow",   "hex": "#ffd600"},
    {"key": "functions",           "name": "acid green",       "hex": "#76ff03"},
    {"key": "class_count",         "name": "emerald green",    "hex": "#00e676"},
    {"key": "async_count",         "name": "cyan",             "hex": "#00e5ff"},
    {"key": "import_count",        "name": "cobalt blue",      "hex": "#2979ff"},
    {"key": "try_catch_count",     "name": "deep violet",      "hex": "#651fff"},
    {"key": "magic_numbers",       "name": "electric magenta", "hex": "#d500f9"},
    {"key": "duplicate_blocks",    "name": "hot pink",         "hex": "#ff1867"},
    {"key": "max_nesting_depth",   "name": "crimson",          "hex": "#d50000"},
]

WILD_ACCENTS = [
    "fluorescent chartreuse (#ccff00)", "neon coral (#ff6e7f)", "electric teal (#00ffc8)",
    "radioactive orange (#ff6100)", "ultraviolet (#7c00ff)", "shocking pink (#fc0fc0)",
    "cerulean (#007ba7)", "vermillion (#e34234)", "chrome yellow (#ffa700)",
    "phthalo green (#123524)", "quinacridone rose (#e8467c)", "mars black (#1b1b1b)",
    "titanium white (#fafafa)", "raw umber (#826644)", "cadmium orange (#ed872d)",
    "prussian blue (#003153)", "viridian (#40826d)", "alizarin crimson (#e32636)",
]


def analyze_code(code: str):
    lines = code.split("\n")
    non_empty = [l for l in lines if l.strip()]
    branch_count = len(re.findall(r"\b(if|else if|else|switch|case|match)\b", code))
    loop_count = len(re.findall(r"\b(for|while|do)\b", code))
    try_catch_count = len(re.findall(r"\b(try|catch|except|finally)\b", code))
    comment_lines = sum(1 for l in non_empty if re.match(r"^\s*(//|#|/\*|\* )", l))
    comment_density = comment_lines / len(non_empty) if non_empty else 0
    functional_hints = len(re.findall(r"\b(map|filter|reduce|fold|compose|pipe)\b", code)) + len(re.findall(r"=>", code))
    oop_hints = len(re.findall(r"\b(class|this|new|extends|public|private|protected)\b", code))
    # Recursion: function names appearing 2+ times
    fn_names = re.findall(r"\bfunction\s+([A-Za-z_]\w*)\b", code)
    # Also check Python def
    fn_names += re.findall(r"\bdef\s+([A-Za-z_]\w*)\b", code)
    recursion_hints = 0
    for name in fn_names[:12]:
        hits = len(re.findall(rf"\b{re.escape(name)}\s*\(", code))
        if hits >= 2:
            recursion_hints += 1
    return {
        "branch_count": branch_count,
        "loop_count": loop_count,
        "try_catch_count": try_catch_count,
        "comment_density": comment_density,
        "functional_hints": functional_hints,
        "oop_hints": oop_hints,
        "recursion_hints": recursion_hints,
    }


def detect_language(code: str) -> str:
    indicators = {
        "python": [r"\bdef\s+\w+\s*\(", r"\bimport\s+\w+", r"\bprint\s*\(", r":\s*\n\s+", r"\bself\b", r"\belif\b", r"\b__\w+__\b"],
        "rust": [r"\bfn\s+\w+", r"\blet\s+mut\b", r"\bmatch\b", r"\bimpl\b", r"->", r"::", r"\bpub\s+(fn|struct|enum)", r"\bOption<", r"\bResult<"],
        "java": [r"\bpublic\s+(static\s+)?void\b", r"\bSystem\.out", r"\bextends\b", r"\bimplements\b", r"\bpackage\s+", r"\b@Override\b"],
        "typescript": [r":\s*(string|number|boolean|void)\b", r"\binterface\s+\w+", r"\b(type|enum)\s+\w+", r"<[A-Z]\w*>", r"\bas\s+\w+"],
        "go": [r"\bfunc\s+\w+", r"\bpackage\s+main\b", r"\bfmt\.", r"\b:=\b", r"\bgo\s+func", r"\bchan\b"],
        "c": [r"#include\s*<", r"\bprintf\s*\(", r"\bmalloc\s*\(", r"\bvoid\s+\w+\s*\(", r"\bsizeof\s*\(", r"\bNULL\b"],
    }
    best, best_score = "javascript", 0
    for lang, patterns in indicators.items():
        score = sum(1 for p in patterns if re.search(p, code))
        if score > best_score:
            best_score = score
            best = lang
    if best_score < 2:
        if re.search(r"\b(const|let|var)\b", code) or re.search(r"=>\s*[{(]", code):
            return "javascript"
    return best


def compute_metrics(code: str, language: str, signals: dict) -> dict:
    lines = code.split("\n")
    import_count = sum(1 for l in lines if re.match(r"^\s*(import\s|const\s+\w+\s*=\s*require\(|from\s+['\"])", l))
    async_count = len(re.findall(r"\basync\b|\bawait\b|\bPromise\b|\.then\s*\(", code))
    magic_numbers = len(re.findall(r"(?<![.\w\[])(?:[2-9]|\d{2,})(?!\w)", code))
    max_indent = 0
    for line in lines:
        if not line.strip():
            continue
        m = re.match(r"^(\s*)", line)
        spaces = len(m.group(1).replace("\t", "  ")) if m else 0
        indent = spaces // 2
        if indent > max_indent:
            max_indent = indent
    # Duplicate 3-line blocks
    block_map = {}
    for i in range(len(lines) - 2):
        block = "\n".join(l.strip() for l in lines[i:i+3])
        if len(block) > 10:
            block_map[block] = block_map.get(block, 0) + 1
    duplicate_blocks = sum(1 for c in block_map.values() if c > 1)
    unused_code_lines = sum(1 for l in lines if re.match(r"^\s*//\s*(const|let|var|function|if|for|return|import)", l))

    return {
        "language": language,
        "recursion_count": signals["recursion_hints"],
        "loop_count": signals["loop_count"],
        "conditional_count": signals["branch_count"],
        "class_count": signals["oop_hints"] // 3,
        "async_count": async_count,
        "functions": signals["functional_hints"],
        "cyclomatic_complexity": signals["branch_count"] + signals["loop_count"] + 1,
        "import_count": import_count,
        "lines_of_code": len(lines),
        "max_nesting_depth": max_indent,
        "try_catch_count": signals["try_catch_count"],
        "unused_code_lines": unused_code_lines,
        "comment_ratio": signals["comment_density"],
        "duplicate_blocks": duplicate_blocks,
        "magic_numbers": magic_numbers,
    }


def get_element_color_palette(m: dict) -> str:
    active = []
    for ec in ELEMENT_COLORS:
        val = m.get(ec["key"], 0)
        if val > 0:
            active.append({"name": ec["name"], "hex": ec["hex"], "weight": min(val, 10)})
    if len(active) < 2:
        active += [
            {"name": "ivory black", "hex": "#1b1b1b", "weight": 5},
            {"name": "titanium white", "hex": "#fafafa", "weight": 3},
            {"name": "cadmium red", "hex": "#e21a1a", "weight": 2},
        ]
    shuffled = WILD_ACCENTS[:]
    random.shuffle(shuffled)
    num_accents = 2 if len(active) > 5 else 1
    active.sort(key=lambda c: c["weight"], reverse=True)
    primary = ", ".join(f'{c["name"]} ({c["hex"]}) — DOMINANT' for c in active[:3])
    secondary = ", ".join(f'{c["name"]} ({c["hex"]})' for c in active[3:])
    accents = ", ".join(shuffled[:num_accents])
    return f"""PRIMARY: {primary}.
{f'SECONDARY: {secondary}.' if secondary else ''}
WILD ACCENT{'S' if num_accents > 1 else ''}: {accents}.
Use colors at FULL SATURATION. Distribute across the entire piece — no single color should dominate more than 40% of the surface.
Colors should clash, vibrate, and create optical tension."""


def get_density_directive(loc: int) -> str:
    if loc > 500:
        return "MAXIMUM SATURATION: Zero visible background. Every pixel is covered."
    if loc > 200:
        return "HIGH DENSITY: 80-90% of the canvas is covered. Marks crowd each other."
    if loc > 100:
        return "MODERATE DENSITY: 50-60% coverage. Clear rhythm between active zones and breathing room."
    if loc > 50:
        return "SPARSE: Only 20-30% of the canvas has marks. Empty space IS the composition."
    return "ULTRA-MINIMAL: 5-10% coverage. Almost nothing on the canvas but deeply powerful."


def get_extremity_directive(m: dict) -> str:
    chaos = m["cyclomatic_complexity"] + m["max_nesting_depth"] * 3 + m["loop_count"]
    if chaos > 40:
        return "VISUAL EXTREMITY: MAXIMUM. Visually VIOLENT. Marks collide and destroy each other."
    if chaos > 25:
        return "VISUAL EXTREMITY: HIGH. Strong contrasts, bold marks, visible tension."
    if chaos > 12:
        return "VISUAL EXTREMITY: MODERATE. Confident mark-making with controlled energy."
    if chaos > 5:
        return "VISUAL EXTREMITY: LOW. Quiet, measured, contemplative."
    return "VISUAL EXTREMITY: NEAR ZERO. Almost silent. The faintest possible marks."


def get_art_medium(m: dict) -> str:
    if m["recursion_count"] > 3:
        return "MEDIUM: Layered cut paper collage with visible depth. Thick cardboard and foam shapes stacked 3-5 layers deep. Think Elizabeth Murray or Keith Haring foam reliefs."
    if m["loop_count"] > 8:
        return "MEDIUM: Obsessive hand-stitched textile. Thousands of identical small elements in a dense grid. Think Sheila Hicks fiber art or El Anatsui bottle cap tapestries."
    if m["conditional_count"] > 10:
        return "MEDIUM: Architectural drawing on translucent vellum. Precise ink lines, layered tracing paper. Think Julie Mehretu or Mark Lombardi network drawings."
    if m["class_count"] > 3:
        return "MEDIUM: Welded steel and found metal assemblage. Heavy industrial pieces welded together. Think Anthony Caro or John Chamberlain crushed car sculptures."
    if m["async_count"] > 5:
        return "MEDIUM: Hanging installation of disparate objects suspended by thin wires. Think Sarah Sze or Mike Kelley hanging pieces."
    if m["cyclomatic_complexity"] < 5 and m["functions"] < 5:
        return "MEDIUM: Large-scale color field painting. 2-3 massive soft-edged rectangles of luminous color. Think Mark Rothko or Helen Frankenthaler stain paintings."
    return "MEDIUM: Mixed-media collage combining torn paper, paint strokes, fabric scraps. Think Robert Rauschenberg combines or Kurt Schwitters Merzbau."


def get_texture_overlays(m: dict) -> str:
    overlays = []
    if m["cyclomatic_complexity"] > 15:
        overlays.append("Visible crack lines and stress fractures across the surface.")
    if m["max_nesting_depth"] > 5:
        overlays.append("Compressed, folded, or crushed material showing pressure of deep nesting.")
    if m["try_catch_count"] > 3:
        overlays.append("Gold metallic repair lines — kintsugi philosophy.")
    if m["duplicate_blocks"] > 2:
        overlays.append(f"{m['duplicate_blocks']} near-identical regions — uncanny repetition.")
    if m["magic_numbers"] > 5:
        overlays.append("Small random shapes that don't belong to any system.")
    return "\n".join(overlays) if overlays else "Surface is clean and assured. No distress."


def generate_gallery_prompt(m: dict) -> str:
    return f"""A close-up, frame-filling photograph of a post-modern art piece.
The artwork fills 100% of the image edge to edge. No gallery walls, no floor, no frame.

{get_art_medium(m)}

COLOR PALETTE:
{get_element_color_palette(m)}

{get_texture_overlays(m)}

DENSITY: {get_density_directive(m["lines_of_code"])}

CRITICAL: The artwork covers the ENTIRE image edge to edge.
Visible materiality — thickness, texture, weight of materials.
NO text, letters, numbers, symbols. NO recognizable faces or figures.
Strictly abstract. Square format.
FRAMING: Edge to edge coverage only."""


def generate_dalle_prompt(m: dict) -> str:
    # Dominant art movement
    if m["recursion_count"] > 3:
        movement = "FRACTAL SELF-SIMILARITY: Self-similar nested structures at multiple scales. Artist refs: M.C. Escher, Bridget Riley."
    elif m["loop_count"] > 8:
        movement = "OP-ART REPETITION: Obsessive repetitive tiling with optical vibration. Artist refs: Bridget Riley, Yayoi Kusama."
    elif m["conditional_count"] > 10:
        movement = "BRANCHING PATHWAYS: Forking paths, tree-like structures. Artist refs: Julie Mehretu, Piet Mondrian tree studies."
    elif m["class_count"] > 3:
        movement = "CUBIST FRAGMENTATION: Multiple simultaneous viewpoints fragmented and reassembled. Artist refs: Picasso, Braque."
    elif m["async_count"] > 5:
        movement = "SCATTERED CONSTELLATION: Disconnected elements floating with invisible connections. Artist refs: Kandinsky, Miro."
    elif m["cyclomatic_complexity"] < 5 and m["functions"] < 5:
        movement = "HARD-EDGE MINIMALISM: Large flat color planes with precise edges. Artist refs: Ellsworth Kelly, Agnes Martin."
    else:
        movement = "POST-MODERN COLLAGE: Multiple art styles colliding. Artist refs: Rauschenberg, Jasper Johns."

    chaos = m["cyclomatic_complexity"] + m["max_nesting_depth"] * 3 + m["loop_count"]
    if chaos > 25:
        marks = "Aggressive: slashing strokes, violent scratches, splattered ink, torn edges"
    elif chaos > 12:
        marks = "Confident: deliberate strokes, varied pressure, energetic but controlled"
    else:
        marks = "Delicate: hairline marks, whispered touches, barely-there traces"

    return f"""Full-bleed abstract artwork filling the entire square image edge to edge. No borders, no frames.

DOMINANT MOVEMENT: {movement}

COLOR PALETTE:
{get_element_color_palette(m)}

{get_density_directive(m["lines_of_code"])}
{get_extremity_directive(m)}

TEXTURE: {get_texture_overlays(m)}

MARK-MAKING: {marks}

SURFACE: Matte paper grain, scan noise. No glossy render. No 3D shading.
CRITICAL: NO text, letters, numbers, symbols. NO faces or figures. Strictly abstract.
The artwork fills 100% of the image. No borders. No margins. Edge to edge."""


async def generate_image_with_imagen(prompt: str) -> tuple[Optional[str], Optional[str]]:
    global _gemini_key_index
    if not _gemini_keys:
        raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY")

    # Round-robin across available keys
    key = _gemini_keys[_gemini_key_index % len(_gemini_keys)]
    _gemini_key_index += 1
    key_label = f"key{(_gemini_key_index - 1) % len(_gemini_keys) + 1}/{len(_gemini_keys)}"
    print(f"[generate] Using {key_label}")

    url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict"
    headers = {
        "x-goog-api-key": key,
        "Content-Type": "application/json",
    }
    body = {
        "instances": [{"prompt": prompt}],
        "parameters": {"sampleCount": 1, "aspectRatio": "1:1"},
    }

    timeout = httpx.Timeout(60.0, connect=10.0)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, headers=headers, json=body)
    except Exception as exc:
        print(f"[generate] Imagen request failed: {exc}")
        return None, f"Imagen request failed: {exc}"

    if response.status_code >= 400:
        print(f"[generate] Imagen API error {response.status_code}: {response.text[:200]}")
        return None, f"Imagen API error {response.status_code}: {response.text[:200]}"

    data = response.json()
    predictions = data.get("predictions", [])
    if not predictions:
        print("[generate] Imagen returned no predictions")
        return None, "Imagen returned no predictions"

    return predictions[0].get("bytesBase64Encoded"), None


async def generate_text_with_gemini(prompt: str, temperature: float = 0.7) -> Optional[str]:
    global _gemini_key_index
    if not _gemini_keys:
        raise HTTPException(status_code=500, detail="Missing GEMINI_API_KEY")

    key = _gemini_keys[_gemini_key_index % len(_gemini_keys)]
    _gemini_key_index += 1

    model = GEMINI_TEXT_MODEL or "gemini-1.5-flash-002"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    headers = {
        "x-goog-api-key": key,
        "Content-Type": "application/json",
    }
    body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": 900,
        },
    }

    timeout = httpx.Timeout(45.0, connect=10.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(url, headers=headers, json=body)

    if response.status_code >= 400:
        print(f"[gemini] Text API error {response.status_code}: {response.text[:200]}")
        return None

    data = response.json()
    candidates = data.get("candidates", [])
    if not candidates:
        return None

    content = candidates[0].get("content", {})
    parts = content.get("parts", [])
    for part in parts:
        text = part.get("text")
        if text:
            return text
    return None


def extract_json_payload(text: str) -> Optional[dict]:
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None


class GenerateRequest(BaseModel):
    code: str = Field(..., min_length=1)
    language: Optional[str] = None


class FemaleArtistRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500)
    count: int = Field(3, ge=1, le=6)


@app.post("/api/generate")
async def generate_art(payload: GenerateRequest):
    code = payload.code[:1800]
    language = payload.language or detect_language(code)

    print(f"[generate] Analyzing code ({len(code)} chars, language={language})")

    signals = analyze_code(code)
    metrics = compute_metrics(code, language, signals)

    prompt = random.choice([generate_dalle_prompt, generate_gallery_prompt])(metrics)
    print(f"[generate] Prompt generated ({len(prompt)} chars), calling Imagen 4...")

    b64, error_detail = await generate_image_with_imagen(prompt)

    if not b64:
        return JSONResponse(
            {"error": "Image generation failed", "prompt_used": prompt, "details": error_detail},
            status_code=500,
        )

    print(f"[generate] Image generated successfully")
    return {
        "image_data_url": f"data:image/png;base64,{b64}",
        "prompt_used": prompt,
        "metrics": metrics,
    }


@app.post("/api/female-artists")
async def recommend_female_artists(payload: FemaleArtistRequest):
    user_prompt = payload.prompt.strip()
    count = payload.count
    search_url = "https://collectionapi.metmuseum.org/public/collection/v1/search"
    params = {
        "q": user_prompt,
        "hasImages": "true",
        "isPublicDomain": "true",
    }

    timeout = httpx.Timeout(20.0, connect=10.0)
    headers = {
        "User-Agent": "Syntaxesia/1.0 (local dev)",
        "Accept": "application/json",
    }

    async def fetch_json_with_retries(url: str, params: Optional[dict] = None, retries: int = 3):
        last_error = None
        for attempt in range(1, retries + 1):
            try:
                async with httpx.AsyncClient(timeout=timeout, headers=headers) as client:
                    response = await client.get(url, params=params)
                content_type = response.headers.get("content-type", "")
                if response.status_code >= 400:
                    last_error = f"status {response.status_code}"
                elif "application/json" not in content_type.lower():
                    last_error = f"non-json response ({content_type})"
                else:
                    return response.json(), None
            except Exception as exc:
                last_error = str(exc)

            await asyncio.sleep(0.6 * attempt)
        return None, last_error

    search_data, search_error = await fetch_json_with_retries(search_url, params=params, retries=3)
    if not search_data:
        return JSONResponse(
            {"error": "Met search failed", "details": search_error or "Unknown error"},
            status_code=500,
        )
    object_ids = search_data.get("objectIDs", []) or []
    if not object_ids:
        return {"results": []}

    raw_terms = [w.strip().lower() for w in re.split(r"[\\s,;]+", user_prompt) if len(w.strip()) > 2]
    synonym_map = {
        "landscape": ["landscape", "scenery", "view", "vista", "countryside"],
        "portrait": ["portrait", "portraiture", "self-portrait"],
        "still": ["still life", "still-life"],
        "seascape": ["seascape", "marine", "sea view"],
        "cityscape": ["cityscape", "city view", "urban view"],
        "abstract": ["abstract", "abstraction"],
    }
    keywords = []
    for term in raw_terms:
        if term in synonym_map:
            keywords.extend(synonym_map[term])
        else:
            keywords.append(term)
    keywords = [k for k in keywords if k]
    results = []
    skipped_for_keywords = 0
    max_scan = min(len(object_ids), 800)
    for object_id in object_ids[:max_scan]:
        if len(results) >= count:
            break

        object_url = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}"
        obj, obj_error = await fetch_json_with_retries(object_url, retries=2)
        if not obj:
            continue
        artist_gender = (obj.get("artistGender") or "").lower()
        if "female" not in artist_gender:
            continue

        if keywords:
            haystack = " ".join(
                [
                    str(obj.get("title") or ""),
                    str(obj.get("medium") or ""),
                    str(obj.get("objectName") or ""),
                    str(obj.get("classification") or ""),
                    str(obj.get("department") or ""),
                    str(obj.get("culture") or ""),
                ]
            ).lower()
            tag_terms = " ".join([t.get("term", "") for t in (obj.get("tags") or [])]).lower()
            combined = f"{haystack} {tag_terms}"
            if not any(k in combined for k in keywords):
                skipped_for_keywords += 1
                continue

        image_url = obj.get("primaryImageSmall") or obj.get("primaryImage")
        if not image_url:
            continue

        results.append({
            "artist": obj.get("artistDisplayName") or "Unknown artist",
            "title": obj.get("title") or "Untitled",
            "object_date": obj.get("objectDate"),
            "medium": obj.get("medium"),
            "department": obj.get("department"),
            "culture": obj.get("culture"),
            "period": obj.get("period") or obj.get("dynasty") or obj.get("reign"),
            "classification": obj.get("classification"),
            "image_url": image_url,
            "object_url": obj.get("objectURL"),
            "credit_line": obj.get("creditLine"),
            "source": "The Met Open Access",
        })

    if not results and keywords:
        results = []
        for object_id in object_ids[:max_scan]:
            if len(results) >= count:
                break
            object_url = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{object_id}"
            obj, obj_error = await fetch_json_with_retries(object_url, retries=2)
            if not obj:
                continue
            artist_gender = (obj.get("artistGender") or "").lower()
            if "female" not in artist_gender:
                continue
            image_url = obj.get("primaryImageSmall") or obj.get("primaryImage")
            if not image_url:
                continue
            results.append({
                "artist": obj.get("artistDisplayName") or "Unknown artist",
                "title": obj.get("title") or "Untitled",
                "object_date": obj.get("objectDate"),
                "medium": obj.get("medium"),
                "department": obj.get("department"),
                "culture": obj.get("culture"),
                "period": obj.get("period") or obj.get("dynasty") or obj.get("reign"),
                "classification": obj.get("classification"),
                "image_url": image_url,
                "object_url": obj.get("objectURL"),
                "credit_line": obj.get("creditLine"),
                "source": "The Met Open Access",
            })

    return {"results": results, "notes": {"keyword_filter_applied": bool(keywords), "skipped_for_keywords": skipped_for_keywords}}
