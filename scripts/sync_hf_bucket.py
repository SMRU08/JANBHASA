#!/usr/bin/env python3
"""
sync_hf_bucket.py

Downloads and stages required edge AI models and SQLite lexicon from
the verified Hugging Face repository: Ashraf01k/vernacular-pedagogy-santhali.
Generates SHA256 checksums and extracts archives for on-device inference.
"""

import hashlib
import json
import os
import shutil
import sys
import tarfile
from pathlib import Path
from huggingface_hub import hf_hub_download

sys.stdout.reconfigure(encoding='utf-8')

REPO_ID = "Ashraf01k/vernacular-pedagogy-santhali"
PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODELS_DIR = PROJECT_ROOT / "models"
TTS_DIR = MODELS_DIR / "tts" / "sat_piper"
TRANSLATION_DIR = MODELS_DIR / "translation" / "indictrans2_sat_ct2"
DICT_DIR = MODELS_DIR / "dictionary"
ASSETS_DB_DIR = PROJECT_ROOT / "mobile" / "android" / "app" / "src" / "main" / "assets" / "databases"

def sha256_checksum(file_path: Path) -> str:
    h = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192 * 1024):
            h.update(chunk)
    return h.hexdigest()

def get_hf_token() -> str:
    token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if not token:
        cache_token = Path.home() / ".cache" / "huggingface" / "token"
        if cache_token.exists():
            token = cache_token.read_text().strip()
    return token

def main():
    token = get_hf_token()
    print(f"[*] Connecting to repository: {REPO_ID}")
    TTS_DIR.mkdir(parents=True, exist_ok=True)
    TRANSLATION_DIR.mkdir(parents=True, exist_ok=True)
    DICT_DIR.mkdir(parents=True, exist_ok=True)
    ASSETS_DB_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {
        "repository": REPO_ID,
        "files": {}
    }

    # 1. Download Piper Santali ONNX Model and Config
    print("\n[1/3] Downloading Santali Piper TTS Model & Config...")
    for filename in ["sat_piper_model.onnx", "sat_piper_model.onnx.json"]:
        print(f"  -> Downloading {filename}...")
        src_path = hf_hub_download(repo_id=REPO_ID, filename=filename, token=token)
        dest_path = TTS_DIR / filename
        shutil.copy2(src_path, dest_path)
        checksum = sha256_checksum(dest_path)
        size = dest_path.stat().st_size
        print(f"     Saved: {dest_path} ({size / (1024*1024):.2f} MB, SHA256: {checksum[:12]}...)")
        manifest["files"][filename] = {
            "path": str(dest_path.relative_to(PROJECT_ROOT)),
            "size_bytes": size,
            "sha256": checksum
        }

    # 2. Download FLN Lexicon SQLite Database
    print("\n[2/3] Downloading FLN Lexicon SQLite Database (368 Classroom Interactions)...")
    sql_filename = "fln_lexicon.sqlite"
    src_path = hf_hub_download(repo_id=REPO_ID, filename=sql_filename, token=token)
    dest_path = DICT_DIR / sql_filename
    shutil.copy2(src_path, dest_path)
    
    # Also stage into Android assets for seamless Room/SQLite bundling
    assets_dest = ASSETS_DB_DIR / sql_filename
    shutil.copy2(src_path, assets_dest)
    
    checksum = sha256_checksum(dest_path)
    size = dest_path.stat().st_size
    print(f"     Saved: {dest_path} ({size / 1024:.1f} KB)")
    print(f"     Mirrored to Assets: {assets_dest}")
    manifest["files"][sql_filename] = {
        "path": str(dest_path.relative_to(PROJECT_ROOT)),
        "size_bytes": size,
        "sha256": checksum
    }

    # 3. Download IndicTrans2 CTranslate2 INT8 Model Archive
    print("\n[3/3] Downloading IndicTrans2 CTranslate2 INT8 Model Archive...")
    ct2_tar_filename = "indictrans2_sat_int8_ct2.tar.gz"
    src_path = hf_hub_download(repo_id=REPO_ID, filename=ct2_tar_filename, token=token)
    dest_path = TRANSLATION_DIR / ct2_tar_filename
    shutil.copy2(src_path, dest_path)
    checksum = sha256_checksum(dest_path)
    size = dest_path.stat().st_size
    print(f"     Saved: {dest_path} ({size / (1024*1024):.2f} MB)")
    manifest["files"][ct2_tar_filename] = {
        "path": str(dest_path.relative_to(PROJECT_ROOT)),
        "size_bytes": size,
        "sha256": checksum
    }

    # Extract CT2 archive
    print(f"  -> Extracting {ct2_tar_filename} into {TRANSLATION_DIR}...")
    with tarfile.open(dest_path, "r:gz") as tar:
        tar.extractall(path=TRANSLATION_DIR)
    print("     Extraction complete. Extracted contents:")
    for item in TRANSLATION_DIR.iterdir():
        if item.is_file():
            print(f"       - {item.name} ({item.stat().st_size / (1024*1024):.2f} MB)")

    # Save manifest
    manifest_file = MODELS_DIR / "hf_bucket_manifest.json"
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n[+] All required models and resources staged successfully!")
    print(f"[+] Manifest written to: {manifest_file}")

if __name__ == "__main__":
    main()
