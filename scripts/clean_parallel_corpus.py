#!/usr/bin/env python3
"""
Janbhasha Parallel Corpus Cleaning and Normalization Pipeline
Specialized for Indian Regional Languages (Hindi <-> Santhali Ol Chiki / English <-> Santhali)
Compliant with AI4Bharat IndicTrans2 data preparation standards.
"""

import sys
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass
import os
import re
import csv
import json
import random
import unicodedata
import argparse
from pathlib import Path
from typing import List, Tuple, Dict, Optional

# Unicode ranges
OL_CHIKI_MIN, OL_CHIKI_MAX = 0x1C50, 0x1C7F
DEVANAGARI_MIN, DEVANAGARI_MAX = 0x0900, 0x097F

class IndicCorpusCleaner:
    """
    Cleans, normalizes, filters, and splits bilingual parallel corpora.
    Handles Indic scripts, Ol Chiki modifiers, and bilingual code-switching artifacts.
    """

    def __init__(
        self,
        source_lang: str = "hin_Deva",
        target_lang: str = "sat_Olck",
        min_length: int = 1,
        max_length: int = 150,
        min_ratio: float = 0.25,
        max_ratio: float = 4.0
    ):
        self.source_lang = source_lang
        self.target_lang = target_lang
        self.min_length = min_length
        self.max_length = max_length
        self.min_ratio = min_ratio
        self.max_ratio = max_ratio

    @staticmethod
    def normalize_unicode(text: str) -> str:
        """Applies Unicode NFC normalization to compose combining characters cleanly."""
        if not text:
            return ""
        return unicodedata.normalize("NFC", text)

    @staticmethod
    def clean_generic(text: str) -> str:
        """Removes HTML tags, URLs, email addresses, and cleans irregular whitespace."""
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
        text = re.sub(r'\S+@\S+', ' ', text)
        # Standardize multiple spaces, tabs, and newlines
        text = re.sub(r'[\r\n\t]+', ' ', text)
        text = re.sub(r'\s{2,}', ' ', text)
        return text.strip()

    @staticmethod
    def clean_ol_chiki(text: str) -> str:
        """
        Cleans Santhali Ol Chiki text.
        Preserves Ol Chiki alphabets (1C5A-1C77), digits (1C50-1C59),
        and punctuation/modifiers (Ahven 1C78, Ot 1C79, etc.).
        """
        text = IndicCorpusCleaner.clean_generic(text)
        # Normalize various Unicode dashes and quotes
        text = re.sub(r'[\u2010-\u2015]', '-', text)
        text = re.sub(r'[\u2018\u2019\u201A\u201B]', "'", text)
        text = re.sub(r'[\u201C\u201D\u201E\u201F]', '"', text)
        return text.strip()

    @staticmethod
    def clean_devanagari(text: str) -> str:
        """Cleans Devanagari Hindi text: handles nuktas, danda (|), double danda (||)."""
        text = IndicCorpusCleaner.clean_generic(text)
        # Normalize dandas to standard Hindi purnaviram
        text = re.sub(r'।{2,}', '॥', text)
        text = re.sub(r'[\u200B-\u200D\uFEFF]', '', text)  # Zero-width spaces & joiners
        return text.strip()

    def clean_sentence_by_lang(self, text: str, lang_code: str) -> str:
        text = self.normalize_unicode(text)
        if "Olck" in lang_code or lang_code.startswith("sat"):
            return self.clean_ol_chiki(text)
        elif "Deva" in lang_code or lang_code.startswith("hin"):
            return self.clean_devanagari(text)
        else:
            return self.clean_generic(text)

    def has_required_script(self, text: str, lang_code: str) -> bool:
        """Verifies if the sentence contains the expected script characters."""
        if "Olck" in lang_code:
            return any(OL_CHIKI_MIN <= ord(c) <= OL_CHIKI_MAX for c in text)
        if "Deva" in lang_code:
            return any(DEVANAGARI_MIN <= ord(c) <= DEVANAGARI_MAX for c in text)
        return True

    def is_valid_pair(self, src: str, tgt: str) -> Tuple[bool, str]:
        """Validates alignment and length ratio between bilingual sentence pair."""
        if not src or not tgt:
            return False, "empty_sentence"

        src_words = src.split()
        tgt_words = tgt.split()

        if len(src_words) < self.min_length or len(tgt_words) < self.min_length:
            return False, "too_short"

        if len(src_words) > self.max_length or len(tgt_words) > self.max_length:
            return False, "too_long"

        # Check token length ratio
        ratio = len(src_words) / max(len(tgt_words), 1)
        if ratio < self.min_ratio or ratio > self.max_ratio:
            return False, "length_ratio_mismatch"

        # Verify scripts
        if not self.has_required_script(src, self.source_lang):
            return False, "invalid_src_script"
        if not self.has_required_script(tgt, self.target_lang):
            return False, "invalid_tgt_script"

        # Disallow identical source and target (untranslated copy)
        if src.lower() == tgt.lower():
            return False, "identical_pair"

        return True, "valid"

    def process_file(
        self,
        input_file: str,
        output_dir: str,
        val_split: float = 0.05,
        test_split: float = 0.05,
        seed: int = 42
    ) -> Dict[str, int]:
        """Reads raw TSV/CSV/JSON, cleans pairs, deduplicates, and splits into train/val/test."""
        out_path = Path(output_dir)
        out_path.mkdir(parents=True, exist_ok=True)

        raw_pairs: List[Tuple[str, str]] = []
        in_p = Path(input_file)

        print(f"[*] Reading raw corpus: {input_file}")
        if in_p.suffix.lower() == ".json":
            with open(in_p, "r", encoding="utf-8-sig") as f:
                data = json.load(f)
                for item in data:
                    raw_pairs.append((item.get("src", ""), item.get("tgt", "")))
        else:
            delimiter = "\t" if in_p.suffix.lower() == ".tsv" else ","
            with open(in_p, "r", encoding="utf-8-sig", errors="ignore") as f:
                reader = csv.reader(f, delimiter=delimiter)
                for row in reader:
                    if len(row) >= 2:
                        raw_pairs.append((row[0], row[1]))

        seen = set()
        clean_pairs: List[Tuple[str, str]] = []
        stats = {"total_read": len(raw_pairs), "valid": 0, "dropped": 0, "reasons": {}}

        for src_raw, tgt_raw in raw_pairs:
            src_clean = self.clean_sentence_by_lang(src_raw, self.source_lang)
            tgt_clean = self.clean_sentence_by_lang(tgt_raw, self.target_lang)

            is_valid, reason = self.is_valid_pair(src_clean, tgt_clean)
            if not is_valid:
                stats["dropped"] += 1
                stats["reasons"][reason] = stats["reasons"].get(reason, 0) + 1
                continue

            # Deduplication
            pair_hash = (src_clean, tgt_clean)
            if pair_hash in seen:
                stats["dropped"] += 1
                stats["reasons"]["duplicate"] = stats["reasons"].get("duplicate", 0) + 1
                continue

            seen.add(pair_hash)
            clean_pairs.append((src_clean, tgt_clean))
            stats["valid"] += 1

        # Shuffle and Split
        random.seed(seed)
        random.shuffle(clean_pairs)

        total_valid = len(clean_pairs)
        n_val = int(total_valid * val_split)
        n_test = int(total_valid * test_split)

        test_data = clean_pairs[:n_test]
        val_data = clean_pairs[n_test : n_test + n_val]
        train_data = clean_pairs[n_test + n_val :]

        self._write_tsv(train_data, out_path / "train.tsv")
        self._write_tsv(val_data, out_path / "val.tsv")
        self._write_tsv(test_data, out_path / "test.tsv")

        stats["train_count"] = len(train_data)
        stats["val_count"] = len(val_data)
        stats["test_count"] = len(test_data)

        # Save summary report
        with open(out_path / "cleaning_summary.json", "w", encoding="utf-8-sig") as f:
            json.dump(stats, f, indent=2, ensure_ascii=False)

        print(f"[+] Cleaning complete! Train: {len(train_data)}, Val: {len(val_data)}, Test: {len(test_data)}")
        return stats

    def _write_tsv(self, data: List[Tuple[str, str]], filepath: Path):
        with open(filepath, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.writer(f, delimiter="\t")
            writer.writerow([f"src_{self.source_lang}", f"tgt_{self.target_lang}"])
            for src, tgt in data:
                writer.writerow([src, tgt])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean and prepare bilingual parallel corpus for Janbhasha")
    parser.add_argument("--input", type=str, required=False, default="data/datasets/parallel_corpora/raw/sample_hin_sat.tsv")
    parser.add_argument("--output-dir", type=str, required=False, default="data/datasets/parallel_corpora/processed")
    parser.add_argument("--src-lang", type=str, default="hin_Deva", help="IndicTrans2 language code for source")
    parser.add_argument("--tgt-lang", type=str, default="sat_Olck", help="IndicTrans2 language code for target")
    args = parser.parse_args()

    cleaner = IndicCorpusCleaner(source_lang=args.src_lang, target_lang=args.tgt_lang)
    if os.path.exists(args.input):
        cleaner.process_file(args.input, args.output_dir)
    else:
        print(f"[*] Input file {args.input} not found. Ready for real corpus.")


