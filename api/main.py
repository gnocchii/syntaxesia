import asyncio
import json
import os
import re
import math
import random
import sys
from typing import AsyncIterator, Optional, Dict, Any, List

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field

# Add extraction directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from extraction.github_extractor import GitHubExtractor

_project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(_project_root, ".env.local"))
load_dotenv()  # also load .env as fallback

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "").strip()
print(f"[startup] ELEVENLABS_API_KEY={'SET' if ELEVENLABS_API_KEY else 'MISSING'}")
DEFAULT_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "Xb7hH8MSUJpSbSDYk0k2").strip()
DEFAULT_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2").strip()
DEFAULT_OUTPUT_FORMAT = os.getenv("ELEVENLABS_OUTPUT_FORMAT", "mp3_44100_128").strip()
DEFAULT_STREAMING_LATENCY = os.getenv("ELEVENLABS_STREAMING_LATENCY", "2").strip()

# Anthropic API key (for placard generation with Claude)
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
print(f"[startup] ANTHROPIC_API_KEY={'SET' if ANTHROPIC_API_KEY else 'MISSING'}")

# Vertex AI config - Instance 1
GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "").strip()
GCP_LOCATION = os.getenv("GCP_LOCATION", "us-central1").strip()
_vertex_credentials = None

# Try loading credentials from JSON string (for Vercel/production)
_vertex_creds_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON", "").strip()
if _vertex_creds_json:
    try:
        import json
        from google.oauth2 import service_account
        import google.auth.transport.requests as google_requests
        _creds_dict = json.loads(_vertex_creds_json)
        _vertex_credentials = service_account.Credentials.from_service_account_info(
            _creds_dict,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        print(f"[startup] Vertex AI #1 credentials loaded from GOOGLE_APPLICATION_CREDENTIALS_JSON env var")
    except Exception as e:
        print(f"[startup] Failed to load Vertex AI #1 credentials from JSON: {e}")
# Fallback to file path (for local development)
elif _vertex_key_path := os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip():
    if os.path.exists(_vertex_key_path):
        from google.oauth2 import service_account
        import google.auth.transport.requests as google_requests
        _vertex_credentials = service_account.Credentials.from_service_account_file(
            _vertex_key_path,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        print(f"[startup] Vertex AI #1 credentials loaded from {_vertex_key_path}")

# Vertex AI config - Instance 2 (for parallel processing)
GCP_PROJECT_ID_2 = os.getenv("GCP_PROJECT_ID_2", "").strip()
GCP_LOCATION_2 = os.getenv("GCP_LOCATION_2", "us-central1").strip()
_vertex_credentials_2 = None

# Try loading credentials from JSON string (for Vercel/production)
_vertex_creds_json_2 = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON_2", "").strip()
if _vertex_creds_json_2:
    try:
        from google.oauth2 import service_account
        _creds_dict_2 = json.loads(_vertex_creds_json_2)
        _vertex_credentials_2 = service_account.Credentials.from_service_account_info(
            _creds_dict_2,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        print(f"[startup] Vertex AI #2 credentials loaded from GOOGLE_APPLICATION_CREDENTIALS_JSON_2 env var")
    except Exception as e:
        print(f"[startup] Failed to load Vertex AI #2 credentials from JSON: {e}")
# Fallback to file path (for local development)
elif _vertex_key_path_2 := os.getenv("GOOGLE_APPLICATION_CREDENTIALS_2", "").strip():
    if os.path.exists(_vertex_key_path_2):
        from google.oauth2 import service_account
        _vertex_credentials_2 = service_account.Credentials.from_service_account_file(
            _vertex_key_path_2,
            scopes=["https://www.googleapis.com/auth/cloud-platform"],
        )
        print(f"[startup] Vertex AI #2 credentials loaded from {_vertex_key_path_2}")

# Status check
if _vertex_credentials and _vertex_credentials_2:
    print(f"[startup] ✅ DUAL Vertex AI instances configured (2x speed)")
elif _vertex_credentials:
    print(f"[startup] ✅ Single Vertex AI instance configured")
else:
    print(f"[startup] ⚠️  Vertex AI credentials NOT found, falling back to Gemini API keys")

# Fallback: Gemini API keys (free tier, rate limited)
_gemini_keys = []
for _k in [os.getenv("GEMINI_API_KEY", ""), os.getenv("GEMINI_API_KEY_2", ""), os.getenv("GEMINI_API_KEY_3", "")]:
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
    num_accents = min(5, len(shuffled))  # More wild accents = more auction value
    active.sort(key=lambda c: c["weight"], reverse=True)
    primary = ", ".join(f'{c["name"]} — DOMINANT' for c in active[:3])
    secondary = ", ".join(f'{c["name"]}' for c in active[3:])
    accents = ", ".join(shuffled[:num_accents])
    return f"""PRIMARY COLORS: {primary}.
SECONDARY LAYERS: {secondary if secondary else 'Additional complexity in every zone'}.
DAY-GLO EXPLOSIONS: {accents}.
COLOR INSTRUCTIONS: MAXIMUM saturation. Semantic collision - incompatible colors vibrating against each other.
Day-glo meets earthworks. Neon pink vs rusted steel. Hyperreal intensity.
Takashi Murakami Superflat × Jeff Koons kitsch × Jenny Holzer LED aggression."""


def get_density_directive(loc: int) -> str:
    if loc > 300:
        return "HORROR VACUI: 110% coverage. Fear of empty space. Obsessive maximalism. Sensory overload."
    if loc > 150:
        return "MAXIMALIST BRICOLAGE: 90% coverage. Chaotic collision of incompatible elements. Visual cacophony."
    if loc > 60:
        return "HIGH DENSITY PLURALISM: 80% coverage. Multi-layered Superflat where foreground/background merge."
    return "COMPLEX INTERMEDIA: 70% coverage with intense detail. Camp irony - looks expensive and laborious."


def get_extremity_directive(m: dict) -> str:
    chaos = m["cyclomatic_complexity"] + m["max_nesting_depth"] * 2 + m["loop_count"]
    if chaos > 25:
        return "POST-INTERNET CHAOS: Hyperreality breaking into pure data noise. Maximum visual aggression."
    if chaos > 15:
        return "NEO-EXPRESSIONIST BRICOLAGE: Raw, aggressive, unpolished. Evidence of obsessive labor."
    return "CONCEPTUALIST IRONY meets KITSCH: Seemingly controlled but unsettlingly ornate. Camp aesthetic."


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
        overlays.append("PAINTED crack patterns and stress fractures across the canvas.")
    if m["max_nesting_depth"] > 5:
        overlays.append("PAINTED illusion of compressed layers through color and texture.")
    if m["try_catch_count"] > 3:
        overlays.append("PAINTED gold metallic lines (kintsugi-inspired painted marks).")
    if m["duplicate_blocks"] > 2:
        overlays.append(f"{m['duplicate_blocks']} PAINTED near-identical regions — uncanny repetition.")
    if m["magic_numbers"] > 5:
        overlays.append("PAINTED random abstract shapes scattered across surface.")
    return "\n".join(overlays) if overlays else "Dense painted marks covering the entire canvas."


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
    # ANTI-MINIMALIST movement selection - lower thresholds for complexity
    if m["recursion_count"] > 1:
        movement = "CYBERNETIC RECURSION × SPIRAL JETTY EARTHWORKS: Fractal self-similarity with Land Art entropy (Escher × Smithson)"
    elif m["loop_count"] > 4:
        movement = "TELEMATIC NET.ART × OP-ART SUPERFLAT: Obsessive tiling meets Murakami flatness (Kusama × Takashi)"
    elif m["conditional_count"] > 5:
        movement = "RHIZOMATIC NETWORKS × NEO-EXPRESSIONIST BRICOLAGE: Branching paths with raw aggression (Mehretu × Basquiat)"
    elif m["class_count"] > 1:
        movement = "INDUSTRIAL FORMALISM × GOTHIC-BAROQUE-POP: Bauhaus grids meet ornate excess (Mondrian × Jeff Koons)"
    elif m["async_count"] > 2:
        movement = "GLITCH ART × HYPERREALITY: Broken data meets hyper-detailed simulation (Rosa Menkman × Gerhard Richter)"
    else:
        movement = "POST-STRUCTURALIST PASTICHE × INSTITUTIONAL CRITIQUE: Multi-layered semantic collision (Rauschenberg × Jenny Holzer)"

    chaos = m["cyclomatic_complexity"] + m["max_nesting_depth"] * 2 + m["loop_count"]
    if chaos > 15:
        marks = "VIOLENT MAXIMALISM: Explosive brushwork, splattered day-glo paint, aggressive gestural painting"
    elif chaos > 8:
        marks = "NEO-EXPRESSIONIST ENERGY: Bold painted strokes, dripping paint, thick impasto, raw canvas"
    else:
        marks = "CAMP IRONY: Over-painted decoration, obsessive painted patterns, maximalist surface"

    return f"""A museum-quality 2D PAINTING on canvas worth MILLIONS at auction. 8K hyper-detailed.
Style: {movement}

{get_density_directive(m["lines_of_code"])}
COMPOSITION: Flatbed picture plane (no horizon, no depth). Pure FLAT painted surface.

PAINTED COLOR PALETTE:
{get_element_color_palette(m)}

PAINTING TECHNIQUE & SURFACE:
{get_texture_overlays(m)}
MEDIUM: Acrylic paint, oil paint, spray paint, ink on canvas. Purely 2D painted surface.
Visible painted texture - thick impasto, thin washes, drips, splatters, brushstrokes.

MARK-MAKING: {marks}

SURFACE: Painted marks only - NO objects. Colors suggest depth through layering and texture.
Thick paint application, matte/glossy contrasts, visible brushwork evidence.
Gothic-Baroque-Pop fusion - ornate painted patterns meets flat color fields.
This took months of painting. Museum-quality 2D craftsmanship.

CRITICAL: 100% ABSTRACT 2D PAINTING on canvas. NO objects, text, numbers, faces, depth.
Pure painted abstract marks. Flat surface covered edge-to-edge with dense painted detail."""


def _get_vertex_access_token() -> str:
    """Get a fresh access token from service account credentials (Vertex AI #1)."""
    import google.auth.transport.requests as google_requests
    if not _vertex_credentials.valid or _vertex_credentials.expired:
        _vertex_credentials.refresh(google_requests.Request())
    return _vertex_credentials.token


def _get_vertex_access_token_2() -> str:
    """Get a fresh access token from service account credentials (Vertex AI #2)."""
    import google.auth.transport.requests as google_requests
    if not _vertex_credentials_2.valid or _vertex_credentials_2.expired:
        _vertex_credentials_2.refresh(google_requests.Request())
    return _vertex_credentials_2.token


_backend_counter = 0  # round-robin between backends


async def _call_vertex(prompt: str) -> Optional[str]:
    """Call Vertex AI #1 with retry on 429."""
    url = (
        f"https://{GCP_LOCATION}-aiplatform.googleapis.com/v1/"
        f"projects/{GCP_PROJECT_ID}/locations/{GCP_LOCATION}/"
        f"publishers/google/models/imagen-3.0-generate-002:predict"
    )
    body = {"instances": [{"prompt": prompt}], "parameters": {"sampleCount": 1, "aspectRatio": "1:1"}}

    for attempt in range(1, 4):
        token = _get_vertex_access_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        print(f"[generate] Vertex AI #1 attempt {attempt}/3")
        timeout = httpx.Timeout(90.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, headers=headers, json=body)
        if response.status_code == 429:
            wait = attempt * 15
            print(f"[generate] Vertex #1 429 — waiting {wait}s...")
            await asyncio.sleep(wait)
            continue
        if response.status_code >= 400:
            print(f"[generate] Vertex #1 error {response.status_code}: {response.text[:300]}")
            return None
        predictions = response.json().get("predictions", [])
        return predictions[0].get("bytesBase64Encoded") if predictions else None
    return None


async def _call_vertex_2(prompt: str) -> Optional[str]:
    """Call Vertex AI #2 with retry on 429."""
    url = (
        f"https://{GCP_LOCATION_2}-aiplatform.googleapis.com/v1/"
        f"projects/{GCP_PROJECT_ID_2}/locations/{GCP_LOCATION_2}/"
        f"publishers/google/models/imagen-3.0-generate-002:predict"
    )
    body = {"instances": [{"prompt": prompt}], "parameters": {"sampleCount": 1, "aspectRatio": "1:1"}}

    for attempt in range(1, 4):
        token = _get_vertex_access_token_2()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        print(f"[generate] Vertex AI #2 attempt {attempt}/3")
        timeout = httpx.Timeout(90.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, headers=headers, json=body)
        if response.status_code == 429:
            wait = attempt * 15
            print(f"[generate] Vertex #2 429 — waiting {wait}s...")
            await asyncio.sleep(wait)
            continue
        if response.status_code >= 400:
            print(f"[generate] Vertex #2 error {response.status_code}: {response.text[:300]}")
            return None
        predictions = response.json().get("predictions", [])
        return predictions[0].get("bytesBase64Encoded") if predictions else None
    return None


async def _call_gemini(prompt: str) -> Optional[str]:
    """Call free Gemini API with retry on 429."""
    global _gemini_key_index
    key = _gemini_keys[_gemini_key_index % len(_gemini_keys)]
    _gemini_key_index += 1
    url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict"
    body = {"instances": [{"prompt": prompt}], "parameters": {"sampleCount": 1, "aspectRatio": "1:1"}}

    for attempt in range(1, 4):
        headers = {"x-goog-api-key": key, "Content-Type": "application/json"}
        print(f"[generate] Gemini API attempt {attempt}/3")
        timeout = httpx.Timeout(90.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, headers=headers, json=body)
        if response.status_code == 429:
            wait = attempt * 15
            print(f"[generate] Gemini 429 — waiting {wait}s...")
            await asyncio.sleep(wait)
            continue
        if response.status_code >= 400:
            print(f"[generate] Gemini error {response.status_code}: {response.text[:200]}")
            return None
        predictions = response.json().get("predictions", [])
        return predictions[0].get("bytesBase64Encoded") if predictions else None
    return None


async def generate_image_with_imagen(prompt: str) -> Optional[str]:
    global _backend_counter
    has_vertex = bool(_vertex_credentials and GCP_PROJECT_ID)
    has_vertex_2 = bool(_vertex_credentials_2 and GCP_PROJECT_ID_2)
    has_gemini = bool(_gemini_keys)

    # DUAL Vertex AI: Round-robin between two instances for 2x speed
    if has_vertex and has_vertex_2:
        use_vertex_2 = (_backend_counter % 2 == 1)
        _backend_counter += 1
        instance = "#2" if use_vertex_2 else "#1"
        print(f"[generate] DUAL Vertex AI → Instance {instance} (request #{_backend_counter})")

        result = await (_call_vertex_2(prompt) if use_vertex_2 else _call_vertex(prompt))
        if result:
            return result
        # Fallback to the other Vertex instance
        print(f"[generate] Vertex {instance} failed, trying other instance")
        fallback = await (_call_vertex(prompt) if use_vertex_2 else _call_vertex_2(prompt))
        if fallback:
            return fallback
        # Last resort: Gemini
        if has_gemini:
            print(f"[generate] Both Vertex instances failed, falling back to Gemini API")
            return await _call_gemini(prompt)
        return None

    # Single Vertex AI instance
    elif has_vertex:
        print(f"[generate] Using Vertex AI Imagen 3 (single instance)")
        result = await _call_vertex(prompt)
        if result:
            return result
        if has_gemini:
            print(f"[generate] Vertex failed, falling back to Gemini API")
            return await _call_gemini(prompt)
        return None

    # Gemini API only
    elif has_gemini:
        print(f"[generate] Using Gemini API (Vertex not configured)")
        return await _call_gemini(prompt)

    else:
        raise HTTPException(status_code=500, detail="No image generation credentials configured")


class GenerateRequest(BaseModel):
    code: Optional[str] = None
    language: Optional[str] = None
    prompt: Optional[str] = None  # Direct Imagen prompt (from placard generation)


@app.post("/api/generate")
async def generate_art(payload: GenerateRequest):
    # If prompt is provided directly, use it (new flow from placard generation)
    if payload.prompt:
        prompt = payload.prompt
        metrics = {}
        print(f"[generate] Using provided prompt ({len(prompt)} chars), calling Imagen...")

    # Otherwise, generate prompt from code (legacy flow)
    elif payload.code:
        code = payload.code[:1800]
        language = payload.language or detect_language(code)

        print(f"[generate] Analyzing code ({len(code)} chars, language={language})")

        signals = analyze_code(code)
        metrics = compute_metrics(code, language, signals)

        prompt = random.choice([generate_dalle_prompt, generate_gallery_prompt])(metrics)
        print(f"[generate] Prompt generated ({len(prompt)} chars), calling Imagen...")

    else:
        raise HTTPException(status_code=400, detail="Either 'code' or 'prompt' must be provided")

    b64 = await generate_image_with_imagen(prompt)

    if not b64:
        return JSONResponse(
            {"error": "Image generation failed", "prompt_used": prompt},
            status_code=500,
        )

    print(f"[generate] Image generated successfully")
    return {
        "image_data_url": f"data:image/png;base64,{b64}",
        "prompt_used": prompt,
        "metrics": metrics,
    }


# ============================================
# Placard Generation with Claude Haiku
# ============================================

async def call_claude_for_placard(
    imagen_prompt: str,
    code_snippet: str,
    file_path: str,
    language: str,
    repo_name: str,
    username: str
) -> Dict[str, Any]:
    """Call Claude Haiku to generate placard description based on the generated artwork"""

    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="Anthropic API key not configured")

    # Build the prompt for Claude
    claude_prompt = f"""You are a sophisticated museum curator writing a placard for "Syntaxesia" - an art exhibition where code is transformed into abstract post-modern artworks.

An artwork has been generated from this code file using the following Imagen prompt:
"{imagen_prompt}"

Code File Information:
- File: {file_path}
- Language: {language}
- Repository: {repo_name}
- Author: @{username}

Code Sample (first 500 chars):
{code_snippet[:500]}

Your task: Write a museum placard that describes this artwork. The placard should:

1. **Aesthetic Classification:**
   - Choose ONE dominant aesthetic category:
     * Recursive / Pattern-heavy (obsessive repetition, recursion, nested loops)
     * Clean / Structured / Modular (clean boundaries, composable modules)
     * Minimal / Comment-driven (text as primary medium, sparse structure)
     * Messy / Experimental / Hacky (raw, improvisational, broken conventions)
     * Data-heavy / Structured / Grid Systems (tabular logic, weaving, grids)

2. **Artist Match:**
   - Match ONE artist from this curated list:
     * Yayoi Kusama (infinite dots, mirrored recursion, repetition-as-obsession)
     * Zaha Hadid (parametric architecture, fluid geometry, precision + futurism)
     * Jenny Holzer (language-as-art, proclamation, text as visual medium)
     * Tracey Emin (raw vulnerability, confessional, imperfect expression)
     * Anni Albers (code-as-weaving, grids, structural textiles)
   - Use phrasing like: "Inspired by the aesthetic language of..." or "Evoking the structural qualities of..."
   - Do NOT say "in the style of"

3. **Placard Description:**
   - 2-4 sentences in sophisticated museum docent voice
   - Reference the artwork's visual elements (based on the Imagen prompt) AND code characteristics
   - Use art criticism language with clever observations about code quality
   - Subtly humorous tone
   - Must be two paragraphs separated by a blank line:
     * Paragraph 1: artwork description + code observations
     * Paragraph 2: artist context (1-2 sentences), referencing the matched artist

Return ONLY valid JSON in this format:
{{
  "aestheticCategory": "one of the categories above",
  "artistMatch": "one artist name from the list",
  "artistDescription": "1 sentence describing the artist's work (general, factual, non-hyperbolic)",
  "placardDescription": "your placard description here (two paragraphs separated by blank line)"
}}"""

    url = "https://api.anthropic.com/v1/messages"
    headers = {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json"
    }
    body = {
        "model": "claude-3-5-haiku-20241022",
        "max_tokens": 1024,
        "temperature": 0.7,
        "messages": [{
            "role": "user",
            "content": claude_prompt
        }]
    }

    for attempt in range(1, 4):
        timeout = httpx.Timeout(30.0, connect=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, headers=headers, json=body)

        if response.status_code == 429:
            wait = attempt * 10
            print(f"[placard] Claude 429 — waiting {wait}s...")
            await asyncio.sleep(wait)
            continue

        if response.status_code >= 400:
            error_text = response.text[:500]
            print(f"[placard] Claude error {response.status_code}: {error_text}")
            raise HTTPException(
                status_code=500,
                detail=f"Claude API error {response.status_code}: {error_text}"
            )

        data = response.json()
        text = data.get("content", [{}])[0].get("text", "")

        # Parse JSON from response (handle markdown code blocks)
        text = text.strip()
        text = re.sub(r"^```json\s*", "", text)
        text = re.sub(r"^```\s*", "", text)
        text = re.sub(r"```\s*$", "", text)
        text = text.strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            print(f"[placard] Failed to parse JSON: {e}")
            print(f"[placard] Raw text: {text[:500]}")
            raise HTTPException(status_code=500, detail="Failed to parse Claude response as JSON")

    raise HTTPException(status_code=500, detail="Claude API retry limit exceeded")


# ============================================
# GitHub Extraction
# ============================================

class ExtractRequest(BaseModel):
    github_url: str = Field(..., min_length=1)


@app.post("/api/extract")
async def extract_github_repo(payload: ExtractRequest):
    """
    Extract code files and metadata from a GitHub repository.
    Returns top 15 files with their content snippets and importance scores.
    """
    try:
        github_url = payload.github_url.strip()

        # Validate URL format
        if not github_url.startswith('https://github.com/'):
            raise HTTPException(
                status_code=400,
                detail="Invalid GitHub URL format. Must start with 'https://github.com/'"
            )

        print(f"[extract] Extracting from {github_url}")

        # Create extractor (no token for now, will use public API)
        github_token = os.getenv("GITHUB_TOKEN", "").strip() or None
        extractor = GitHubExtractor(github_token=github_token)

        # Extract repository data
        repo_data = extractor.extract(github_url)

        print(f"[extract] Extracted {len(repo_data.get('analysis', {}).get('important_files', {}))} files")

        return {
            "success": True,
            "data": repo_data
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[extract] Error: {e}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


class PlacardRequest(BaseModel):
    imagen_prompt: str = Field(..., min_length=1)
    code_snippet: str = Field(..., min_length=1)
    file_path: str
    language: str
    repo_name: str
    username: str
    year: Optional[str] = None


@app.post("/api/placard")
async def generate_placard(payload: PlacardRequest):
    """
    Generate a museum placard description for a generated artwork.
    Takes the Imagen prompt used to create the artwork + code context.
    Returns placard data using Claude Haiku.
    """
    try:
        print(f"[placard] Generating placard for {payload.file_path}")

        # Call Claude to generate placard
        claude_response = await call_claude_for_placard(
            imagen_prompt=payload.imagen_prompt,
            code_snippet=payload.code_snippet,
            file_path=payload.file_path,
            language=payload.language,
            repo_name=payload.repo_name,
            username=payload.username
        )

        # Build complete placard object
        filename = os.path.basename(payload.file_path)

        placard = {
            "title": filename,
            "filename": filename,
            "filePath": payload.file_path,
            "artist": f"Code by @{payload.username}",
            "medium": f"{payload.language}, {payload.year or '2024'}",
            "year": payload.year or "",
            "repoName": payload.repo_name,
            "description": claude_response.get("placardDescription", ""),
            "aestheticCategory": claude_response.get("aestheticCategory", ""),
            "artistMatch": claude_response.get("artistMatch", ""),
            "artistDescription": claude_response.get("artistDescription", "")
        }

        print(f"[placard] Generated placard for {payload.file_path}")

        return placard

    except Exception as e:
        print(f"[placard] Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Placard generation failed: {str(e)}")