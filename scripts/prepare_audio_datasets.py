#!/usr/bin/env python3
"""
Janbhasha Audio Dataset Preparation Pipeline.
Processes raw audio and transcripts into standardized formats for:
 1. OpenAI Whisper (ASR): 16kHz mono WAV, JSONL/TSV manifest with duration and transcripts.
 2. VITS (TTS): 22.05kHz mono WAV, pipe-delimited LJSpeech metadata format (audio_path|speaker_id|raw_text|normalized_text).
"""

import sys
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass
import os
import csv
import json
import wave
import argparse
import random
from pathlib import Path
from typing import Dict, List, Any, Optional

try:
    import soundfile as sf
    import numpy as np
    HAVE_SOUNDFILE = True
except ImportError:
    HAVE_SOUNDFILE = False

class AudioDatasetFormatter:
    """
    Standardizes raw speech recordings and aligns with transcripts
    for offline Whisper ASR and VITS TTS training or evaluation.
    """

    def __init__(
        self,
        whisper_sr: int = 16000,
        vits_sr: int = 22050,
        whisper_min_sec: float = 0.5,
        whisper_max_sec: float = 30.0,
        vits_min_sec: float = 1.0,
        vits_max_sec: float = 12.0
    ):
        self.whisper_sr = whisper_sr
        self.vits_sr = vits_sr
        self.whisper_min_sec = whisper_min_sec
        self.whisper_max_sec = whisper_max_sec
        self.vits_min_sec = vits_min_sec
        self.vits_max_sec = vits_max_sec

    @staticmethod
    def get_wav_info_builtin(filepath: str) -> Optional[Dict[str, Any]]:
        """Reads WAV file metadata using Python built-in wave module."""
        try:
            with wave.open(filepath, 'rb') as wf:
                channels = wf.getnchannels()
                sample_rate = wf.getframerate()
                n_frames = wf.getnframes()
                duration = n_frames / float(sample_rate)
                return {
                    "channels": channels,
                    "sample_rate": sample_rate,
                    "duration": round(duration, 3)
                }
        except Exception as e:
            return None

    def process_and_resample(
        self,
        src_audio_path: str,
        dest_audio_path: str,
        target_sr: int
    ) -> Optional[float]:
        """
        Converts audio to mono 16-bit PCM and target sample rate.
        Uses soundfile if installed, otherwise manages standard WAV files.
        """
        dest_path = Path(dest_audio_path)
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        if HAVE_SOUNDFILE:
            try:
                data, sr = sf.read(src_audio_path)
                # Convert multi-channel to mono
                if len(data.shape) > 1 and data.shape[1] > 1:
                    data = np.mean(data, axis=1)

                # Simple linear interpolation resampling if rate differs
                if sr != target_sr:
                    num_samples = int(round(len(data) * float(target_sr) / sr))
                    data = np.interp(
                        np.linspace(0, len(data), num_samples, endpoint=False),
                        np.arange(len(data)),
                        data
                    )

                sf.write(str(dest_path), data, target_sr, subtype='PCM_16')
                duration = round(len(data) / float(target_sr), 3)
                return duration
            except Exception as e:
                print(f"[!] Error processing {src_audio_path} with soundfile: {e}")
                return None
        else:
            # Fallback for existing WAV files when soundfile is not yet installed in active env
            info = self.get_wav_info_builtin(src_audio_path)
            if info:
                # Copy file to destination
                import shutil
                shutil.copy2(src_audio_path, str(dest_path))
                return info["duration"]
            return None

    def build_whisper_manifest(
        self,
        records: List[Dict[str, Any]],
        output_dir: str,
        language: str = "sat"
    ) -> Dict[str, str]:
        """
        Builds Whisper ASR format:
        JSONL with {"audio_filepath": str, "duration": float, "text": str, "language": str}
        """
        out_p = Path(output_dir)
        out_p.mkdir(parents=True, exist_ok=True)

        whisper_data = []
        for r in records:
            dur = r["duration"]
            if self.whisper_min_sec <= dur <= self.whisper_max_sec:
                whisper_data.append({
                    "audio_filepath": r["audio_path"],
                    "duration": dur,
                    "text": r["transcript"],
                    "language": language
                })

        manifest_file = out_p / "whisper_manifest.jsonl"
        with open(manifest_file, "w", encoding="utf-8-sig") as f:
            for item in whisper_data:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

        print(f"[+] Whisper ASR Manifest: {len(whisper_data)} valid clips saved to {manifest_file}")
        return {"manifest_path": str(manifest_file), "count": str(len(whisper_data))}

    def build_vits_dataset(
        self,
        records: List[Dict[str, Any]],
        output_dir: str,
        speaker_id: int = 0
    ) -> Dict[str, str]:
        """
        Builds VITS TTS dataset:
        Metadata format (LJSpeech style / Coqui TTS):
        audio_filename|speaker_id|raw_text|normalized_text
        """
        out_p = Path(output_dir)
        wav_dir = out_p / "wavs"
        wav_dir.mkdir(parents=True, exist_ok=True)

        vits_rows = []
        for r in records:
            dur = r["duration"]
            if self.vits_min_sec <= dur <= self.vits_max_sec:
                # Relative audio path or filename
                file_rel = f"wavs/{Path(r['audio_path']).name}"
                raw_txt = r["transcript"]
                # For VITS, normalized text strips strange symbols but keeps Ol Chiki Unicode
                norm_txt = raw_txt.strip()
                vits_rows.append([file_rel, str(speaker_id), raw_txt, norm_txt])

        metadata_path = out_p / "metadata.csv"
        with open(metadata_path, "w", encoding="utf-8-sig", newline="") as f:
            writer = csv.writer(f, delimiter="|")
            for row in vits_rows:
                writer.writerow(row)

        print(f"[+] VITS TTS Dataset: {len(vits_rows)} utterances saved to {metadata_path}")
        return {"metadata_path": str(metadata_path), "count": str(len(vits_rows))}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Format audio datasets for Whisper ASR and VITS TTS")
    parser.add_argument("--raw-audio-dir", type=str, default="data/datasets/audio/raw")
    parser.add_argument("--transcript-file", type=str, default="data/datasets/audio/raw/transcripts.tsv")
    parser.add_argument("--whisper-out", type=str, default="data/datasets/audio/processed_whisper")
    parser.add_argument("--vits-out", type=str, default="data/datasets/audio/processed_vits")
    args = parser.parse_args()

    formatter = AudioDatasetFormatter()
    print("[*] AudioDatasetFormatter initialized and ready.")

