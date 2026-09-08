<#
.SYNOPSIS
  Janbhasha Offline AI Engine — One-click setup for Python 3.14 on Windows
  Run this ONCE from within the project directory with internet access.

.USAGE
  .\setup.ps1

.NOTES
  Python 3.14 requires special handling:
    - pydantic-core >= 2.48.0 (has cp314 wheel)
    - pydantic >= 2.9.0       (has cp314 wheel)
    - numpy >= 2.0.0          (has cp314 wheel; 1.x requires MSVC)
    - torch >= 2.14.0         (has cp314 wheel)
  All installed with --only-binary=:all: to avoid compilation.
#>

$ErrorActionPreference = "Stop"
$PROJECT_DIR = $PSScriptRoot

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Janbhasha Setup — Python 3.14 / Windows" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# ── Check Python version ──────────────────────────────────────────────────────
$pyver = python --version 2>&1
Write-Host "[1] Python version: $pyver"

# ── Create venv if needed ─────────────────────────────────────────────────────
if (-not (Test-Path "$PROJECT_DIR\venv\Scripts\python.exe")) {
    Write-Host "[2] Creating virtual environment..." -ForegroundColor Yellow
    python -m venv "$PROJECT_DIR\venv"
} else {
    Write-Host "[2] Virtual environment already exists." -ForegroundColor Green
}

$PIP = "$PROJECT_DIR\venv\Scripts\pip.exe"
$PYTHON = "$PROJECT_DIR\venv\Scripts\python.exe"

# ── Upgrade pip ───────────────────────────────────────────────────────────────
Write-Host "[3] Upgrading pip..." -ForegroundColor Yellow
& $PIP install --upgrade pip setuptools wheel --quiet

# ── STEP A: pydantic-core (cp314 wheel) ──────────────────────────────────────
Write-Host "[4a] Installing pydantic-core (cp314 wheel)..." -ForegroundColor Yellow
& $PIP install "pydantic-core>=2.48.0" --only-binary=:all: --quiet

# ── STEP B: pydantic + pydantic-settings ─────────────────────────────────────
Write-Host "[4b] Installing pydantic 2.9+ (cp314 wheel)..." -ForegroundColor Yellow
& $PIP install "pydantic>=2.9.0" "pydantic-settings>=2.5.0" --only-binary=:all: --quiet

# ── STEP C: FastAPI stack ─────────────────────────────────────────────────────
Write-Host "[4c] Installing FastAPI, uvicorn, utilities..." -ForegroundColor Yellow
& $PIP install `
    "fastapi>=0.110.0" `
    "uvicorn[standard]>=0.29.0" `
    "python-multipart>=0.0.9" `
    "loguru>=0.7.2" `
    "python-dotenv>=1.0.1" `
    "aiofiles>=23.2.1" `
    "rich>=13.7.1" `
    "huggingface-hub>=0.22.0" `
    --only-binary=:all: --quiet

# ── STEP D: numpy 2.x (cp314 wheel, no compiler needed) ──────────────────────
Write-Host "[4d] Installing numpy 2.x (cp314 wheel)..." -ForegroundColor Yellow
& $PIP install "numpy>=2.0.0" --only-binary=:all: --quiet

# ── STEP E: PyTorch CPU (cp314 wheel) ────────────────────────────────────────
Write-Host "[4e] Installing PyTorch CPU (this may take a few minutes ~700MB)..." -ForegroundColor Yellow
Write-Host "     For CUDA support instead, see README — use --index-url https://download.pytorch.org/whl/cu124"
& $PIP install "torch>=2.14.0" "torchaudio>=2.11.0" --only-binary=:all: --quiet

# ── STEP F: NLP / Transformers stack ─────────────────────────────────────────
Write-Host "[4f] Installing transformers, sentencepiece, accelerate..." -ForegroundColor Yellow
& $PIP install `
    "transformers>=4.38.0" `
    "sentencepiece>=0.2.0" `
    "sacremoses>=0.1.1" `
    "regex>=2023.12.25" `
    "accelerate>=0.27.2" `
    --only-binary=:all: --quiet

# ── STEP G: ASR packages ─────────────────────────────────────────────────────
Write-Host "[4g] Installing faster-whisper (ASR)..." -ForegroundColor Yellow
& $PIP install "faster-whisper>=1.0.1" "soundfile>=0.12.1" --only-binary=:all: --quiet
# openai-whisper: may need to allow source build for ctranslate2 dep
& $PIP install "openai-whisper==20231117" --quiet

# ── STEP H: TTS ──────────────────────────────────────────────────────────────
Write-Host "[4h] Installing TTS / VITS (speech synthesis)..." -ForegroundColor Yellow
& $PIP install "TTS>=0.22.0" --quiet

# ── STEP I: Copy .env ─────────────────────────────────────────────────────────
if (-not (Test-Path "$PROJECT_DIR\.env")) {
    Copy-Item "$PROJECT_DIR\.env.example" "$PROJECT_DIR\.env"
    Write-Host "[5] Created .env from .env.example" -ForegroundColor Green
}

# ── Verify key installs ───────────────────────────────────────────────────────
Write-Host "`n[6] Verifying installations..." -ForegroundColor Yellow
& $PYTHON -c "import fastapi; print('  fastapi:', fastapi.__version__)"
& $PYTHON -c "import pydantic; print('  pydantic:', pydantic.__version__)"
& $PYTHON -c "import numpy; print('  numpy:', numpy.__version__)"
& $PYTHON -c "import uvicorn; print('  uvicorn:', uvicorn.__version__)"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "  Next steps:" -ForegroundColor Green
Write-Host "    1. Download models: python scripts\download_models.py --models all" -ForegroundColor White
Write-Host "    2. Start server:    .\venv\Scripts\python.exe run.py" -ForegroundColor White
Write-Host "    3. Open docs:       http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================`n" -ForegroundColor Green
