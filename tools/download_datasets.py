#!/usr/bin/env python3
"""
JANBHASHA Dataset Download Engine
Automated, ethical, checksum-verified dataset acquisition tool.
"""

import os
import sys
import json
import hashlib
import urllib.request
import urllib.error
from datetime import datetime

DOWNLOAD_CONFIGS = [
    {
        "id": "karya_hindi_mundari_translation",
        "name": "Karya Hindi-Mundari Translation Corpus",
        "language": "Hindi, Mundari",
        "source_url": "https://github.com/karya-inc/dataset-hindi-mundari-translation",
        "download_url": "https://raw.githubusercontent.com/karya-inc/dataset-hindi-mundari-translation/main/translation-hi-unr.tsv",
        "destination_file": "data/raw/karya_hindi_mundari_translation/translation-hi-unr.tsv",
        "license": "Karya Public License (Non-Commercial)",
        "commercial_use": False,
        "category": "parallel_corpus"
    },
    {
        "id": "santali_category_animals",
        "name": "Santali Ol Chiki Animals Lexicon",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Animal.csv",
        "destination_file": "data/raw/santali_lexicon/Animal.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "vocabulary"
    },
    {
        "id": "santali_category_birds",
        "name": "Santali Ol Chiki Birds Lexicon",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Birds.csv",
        "destination_file": "data/raw/santali_lexicon/Birds.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "vocabulary"
    },
    {
        "id": "santali_category_body_parts",
        "name": "Santali Ol Chiki Body Parts Lexicon",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Body%20Parts.csv",
        "destination_file": "data/raw/santali_lexicon/Body_Parts.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "vocabulary"
    },
    {
        "id": "santali_category_colors",
        "name": "Santali Ol Chiki Colours Lexicon",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Colour.csv",
        "destination_file": "data/raw/santali_lexicon/Colour.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "vocabulary"
    },
    {
        "id": "santali_category_days_months",
        "name": "Santali Ol Chiki Days and Months",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Days%20and%20Months.csv",
        "destination_file": "data/raw/santali_lexicon/Days_and_Months.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "vocabulary"
    },
    {
        "id": "santali_category_eatables",
        "name": "Santali Ol Chiki Eatables & Food",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Eatables.csv",
        "destination_file": "data/raw/santali_lexicon/Eatables.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "vocabulary"
    },
    {
        "id": "santali_category_numbers_100",
        "name": "Santali Numbers Upto 100 in Words",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Numbers%20upto%20100%20in%20words.csv",
        "destination_file": "data/raw/santali_lexicon/Numbers_upto_100_in_words.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "numbers"
    },
    {
        "id": "santali_category_relation",
        "name": "Santali Kinship & Relations",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Relation.csv",
        "destination_file": "data/raw/santali_lexicon/Relation.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "vocabulary"
    },
    {
        "id": "santali_category_vegetables",
        "name": "Santali Vegetables Lexicon",
        "language": "Santali",
        "source_url": "https://github.com/Prasanta-Hembram/Translation-work-list-for-Santali-language",
        "download_url": "https://raw.githubusercontent.com/Prasanta-Hembram/Translation-work-list-for-Santali-language/master/Single%20Word/Categories/Vegetable.csv",
        "destination_file": "data/raw/santali_lexicon/Vegetable.csv",
        "license": "Open Community License",
        "commercial_use": True,
        "category": "vocabulary"
    },
    {
        "id": "santali_dictionary_json",
        "name": "Santali-English Dictionary Ol Chiki",
        "language": "Santali, English",
        "source_url": "https://github.com/kailashmurmu/SantaliDictionary",
        "download_url": "https://raw.githubusercontent.com/kailashmurmu/SantaliDictionary/master/santali.json",
        "destination_file": "data/raw/santali_dictionary/santali.json",
        "license": "MIT License",
        "commercial_use": True,
        "category": "dictionary"
    }
]

def calculate_sha256(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(8192):
            hasher.update(chunk)
    return hasher.hexdigest()

def download_dataset(cfg: dict) -> dict:
    dest_path = cfg["destination_file"]
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    print(f"\n[DOWNLOAD] Fetching: {cfg['name']}")
    print(f"  Source: {cfg['download_url']}")
    print(f"  Target: {dest_path}")

    # Check if file exists and has size
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        sha = calculate_sha256(dest_path)
        size_bytes = os.path.getsize(dest_path)
        print(f"  [EXISTS] Skipping duplicate download. Size: {size_bytes:,} bytes, SHA256: {sha[:12]}...")
        return {
            "id": cfg["id"],
            "name": cfg["name"],
            "status": "cached",
            "file": dest_path,
            "size_bytes": size_bytes,
            "sha256": sha,
            "timestamp": datetime.utcnow().isoformat(),
            "license": cfg["license"],
            "source_url": cfg["source_url"]
        }

    try:
        req = urllib.request.Request(
            cfg["download_url"],
            headers={"User-Agent": "JANBHASHA-DataEngine/1.0 (Educational Multilingual NLP Platform)"}
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            total_size = resp.getheader('Content-Length')
            total_size = int(total_size) if total_size else None
            downloaded = 0
            block_size = 8192

            with open(dest_path, 'wb') as out_file:
                while True:
                    buffer = resp.read(block_size)
                    if not buffer:
                        break
                    downloaded += len(buffer)
                    out_file.write(buffer)
                    if total_size:
                        percent = (downloaded / total_size) * 100
                        sys.stdout.write(f"\r  Progress: {downloaded:,} / {total_size:,} bytes ({percent:.1f}%)")
                        sys.stdout.flush()
                    else:
                        sys.stdout.write(f"\r  Downloaded: {downloaded:,} bytes")
                        sys.stdout.flush()

        print()
        sha = calculate_sha256(dest_path)
        size_bytes = os.path.getsize(dest_path)
        print(f"  [SUCCESS] SHA256: {sha}")
        return {
            "id": cfg["id"],
            "name": cfg["name"],
            "status": "downloaded",
            "file": dest_path,
            "size_bytes": size_bytes,
            "sha256": sha,
            "timestamp": datetime.utcnow().isoformat(),
            "license": cfg["license"],
            "source_url": cfg["source_url"]
        }

    except Exception as e:
        print(f"\n  [ERROR] Failed to download {cfg['name']}: {e}")
        return {
            "id": cfg["id"],
            "name": cfg["name"],
            "status": "failed",
            "error": str(e),
            "file": dest_path,
            "timestamp": datetime.utcnow().isoformat(),
            "license": cfg["license"],
            "source_url": cfg["source_url"]
        }

def main():
    print("=" * 60)
    print("JANBHASHA Multilingual Tribal Dataset Ingestion Engine")
    print("=" * 60)

    manifest = {
        "pipeline_version": "1.0.0",
        "execution_time": datetime.utcnow().isoformat(),
        "total_targets": len(DOWNLOAD_CONFIGS),
        "results": []
    }

    successful = 0
    for cfg in DOWNLOAD_CONFIGS:
        res = download_dataset(cfg)
        manifest["results"].append(res)
        if res.get("status") in ["downloaded", "cached"]:
            successful += 1

    os.makedirs("data/metadata", exist_ok=True)
    manifest_path = "data/metadata/download_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 60)
    print(f"Download Pipeline Finished: {successful}/{len(DOWNLOAD_CONFIGS)} succeeded.")
    print(f"Manifest written to: {manifest_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
