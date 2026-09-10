#!/usr/bin/env python3
"""
Janbhasha Offline Translation Service — Phase 3
Engine: AI4Bharat IndicTrans2 (HuggingFace-compatible, offline)

Strict offline-only execution:
  - Weights loaded exclusively from models/translation/ — no HF Hub calls.
  - TRANSFORMERS_OFFLINE=1 is set at import-time before any transformers import.
  - IndicProcessor handles SentencePiece tokenisation and Ol Chiki script routing.

Architecture:
  ┌─────────────────┐    IndicProcessor     ┌──────────────────────────┐
  │  Normalized text│ ──── tokenize ──────► │  Encoder (mBART-style)   │
  │ (Phase 2 output)│                        │  IndicTrans2 Transformer │
  └─────────────────┘                        │  Beam Decoder            │
                                             └────────────┬─────────────┘
                                                          │ token ids
                                             IndicProcessor.decode()
                                                          │
                                             ┌────────────▼─────────────┐
                                             │  Target language text    │
                                             │  (e.g. Santhali Ol Chiki)│
                                             └──────────────────────────┘
Supported language pair codes (IndicTrans2 notation):
  hin_Deva, eng_Latn, sat_Olck, ben_Beng, tel_Telu, tam_Taml …
"""

import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

# ── Enforce offline mode BEFORE transformers is imported ─────────────────────
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_DATASETS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TOKENIZERS_PARALLELISM"] = "false"   # Avoid fork warnings in FastAPI

from loguru import logger

BASE_DIR = Path(__file__).resolve().parent.parent.parent   # → JANBHASHA/

# ── Valid IndicTrans2 language codes ──────────────────────────────────────────
VALID_LANG_CODES = {
    "hin_Deva", "eng_Latn", "sat_Olck", "ben_Beng", "tel_Telu",
    "tam_Taml", "kan_Knda", "mal_Mlym", "mar_Deva", "guj_Gujr",
    "pan_Guru", "urd_Arab", "asm_Beng", "ory_Orya", "mai_Deva",
    "san_Deva", "kas_Arab", "kas_Deva", "doi_Deva", "kon_Deva",
    "mni_Mtei", "mni_Beng", "brx_Deva", "snd_Arab",
}

# ──────────────────────────────────────────────────────────────────────────────
class JanbhashaTranslationService:
    """
    Offline Neural Machine Translation via AI4Bharat IndicTrans2.

    Supports:
      - en → Indic  (indictrans2-en-indic-*)
      - Indic → en  (indictrans2-indic-en-*)
      - Indic → Indic (indictrans2-indic-indic-*)  ← primary for Janbhasha

    IndicTrans2 uses a custom IndicProcessor for:
      - SentencePiece BPE tokenisation
      - Script-specific routing and forced Ol Chiki decoding for Santhali
      - Detokenisation and punctuation restoration
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        tokenizer_path: Optional[str] = None,
        device: Optional[str] = None,
        num_beams: int = 4,
        max_input_length: int = 256,
        max_target_length: int = 256,
        use_mixed_precision: bool = True,
    ):
        _model_rel = model_path or "models/translation/indictrans2-indic-indic-dist-320M"
        self.model_path = str(BASE_DIR / _model_rel)
        self.tokenizer_path = str(BASE_DIR / (tokenizer_path or _model_rel))
        self.num_beams = num_beams
        self.max_input_length = max_input_length
        self.max_target_length = max_target_length
        self.use_mixed_precision = use_mixed_precision

        self._model = None
        self._tokenizer = None
        self._processor = None
        self._model_loaded = False

        self.device, self.dtype = self._resolve_device(device, use_mixed_precision)
        logger.info(
            f"[Translation] Initialized | device={self.device} dtype={self.dtype} "
            f"| model={self.model_path}"
        )

    # ──────────────────────────────────────────────────────────────────────
    @staticmethod
    def _resolve_device(
        requested: Optional[str], mixed_precision: bool
    ) -> Tuple[str, Any]:
        """
        Selects device and torch dtype with GPU fallback to CPU.
        If torch is not installed, defaults to CPU/None — error deferred to load_model().
        """
        try:
            import torch
            cuda_ok = torch.cuda.is_available()
        except ImportError:
            logger.warning("[Translation] torch not installed; defaulting to cpu. Install with: pip install torch")
            return requested or "cpu", None

        if requested == "cuda" and not cuda_ok:
            logger.warning("[Translation] CUDA requested but unavailable. Falling back to CPU.")
            requested = "cpu"

        device = requested or ("cuda" if cuda_ok else "cpu")
        if device == "cuda" and mixed_precision:
            dtype = torch.float16
        else:
            dtype = torch.float32

        return device, dtype

    # ──────────────────────────────────────────────────────────────────────
    def _verify_model_path(self) -> None:
        """
        Enforces offline-only constraint by verifying all required model
        artefacts exist locally before any library call is made.
        Raises FileNotFoundError with actionable instructions if missing.
        """
        required_files = [
            "config.json",
            "tokenizer_config.json",
        ]
        # Expect at least one of these weight files
        weight_files = [
            "model.safetensors", "pytorch_model.bin",
            "model.safetensors.index.json", "pytorch_model.bin.map.json"
        ]

        p = Path(self.model_path)
        if not p.exists() or not p.is_dir():
            raise FileNotFoundError(
                f"[Translation] OFFLINE ENFORCEMENT: Model directory not found at:\n"
                f"  '{self.model_path}'\n\n"
                f"Download instructions (run ONCE with internet, then go offline):\n"
                f"  from huggingface_hub import snapshot_download\n"
                f"  snapshot_download(\n"
                f"      'ai4bharat/indictrans2-indic-indic-dist-200M',\n"
                f"      local_dir='{self.model_path}',\n"
                f"      ignore_patterns=['*.msgpack','*.h5','flax_model*']\n"
                f"  )\n"
            )

        missing_required = [f for f in required_files if not (p / f).exists()]
        if missing_required:
            raise FileNotFoundError(
                f"[Translation] Incomplete model checkpoint. Missing: {missing_required} "
                f"in '{self.model_path}'"
            )

        has_weights = any((p / wf).exists() for wf in weight_files)
        if not has_weights:
            raise FileNotFoundError(
                f"[Translation] No model weight file found in '{self.model_path}'. "
                f"Expected one of: {weight_files}"
            )

    # ──────────────────────────────────────────────────────────────────────
    def _try_load_indic_processor(self) -> Any:
        """
        Attempts to import IndicProcessor from the AI4Bharat IndicTrans2 repository.
        Falls back to HuggingFace AutoTokenizer if IndicProcessor is not available.
        This allows the service to start up and serve placeholder responses even
        before the IndicTrans2 custom package is installed.
        """
        try:
            # IndicTrans2 custom processor (available from AI4Bharat repo)
            # Install via: pip install git+https://github.com/AI4Bharat/IndicTrans2.git
            from IndicTransToolkit.processor import IndicProcessor
            logger.info("[Translation] IndicProcessor loaded from IndicTransToolkit ✓")
            return IndicProcessor(inference=True)
        except ImportError:
            logger.warning(
                "[Translation] IndicProcessor not found. Falling back to AutoTokenizer.\n"
                "  For full IndicTrans2 support, install:\n"
                "  pip install git+https://github.com/AI4Bharat/IndicTrans2.git#subdirectory=huggingface_interface"
            )
            return None

    # ──────────────────────────────────────────────────────────────────────
    def load_model(self) -> None:
        """
        Loads IndicTrans2 model + tokenizer from local checkpoint into memory.
        Must be called at startup (or lazily on first inference).
        """
        if self._model_loaded:
            logger.debug("[Translation] Model already loaded.")
            return

        self._verify_model_path()

        try:
            import torch
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
        except ImportError as e:
            raise ImportError(
                "[Translation] transformers is required: pip install transformers sentencepiece"
            ) from e

        logger.info(f"[Translation] Loading tokenizer from '{self.tokenizer_path}'...")
        t0 = time.perf_counter()

        try:
            self._tokenizer = AutoTokenizer.from_pretrained(
                self.tokenizer_path,
                local_files_only=True,      # ← Offline enforcement
                use_fast=False,             # IndicTrans2 requires slow (SentencePiece) tokenizer
                trust_remote_code=True,
            )
        except Exception as exc:
            raise RuntimeError(
                f"[Translation] Tokenizer load failed from '{self.tokenizer_path}': {exc}"
            ) from exc

        logger.info(f"[Translation] Loading model weights from '{self.model_path}'...")
        try:
            self._model = AutoModelForSeq2SeqLM.from_pretrained(
                self.model_path,
                local_files_only=True,      # ← Offline enforcement
                torch_dtype=self.dtype,
                low_cpu_mem_usage=True,     # Reduces peak RAM during load
                trust_remote_code=True,
            )
            self._model.eval()
            self._model.to(self.device)
        except Exception as exc:
            raise RuntimeError(
                f"[Translation] Model load failed from '{self.model_path}': {exc}"
            ) from exc

        # Load IndicProcessor for script-routing and BPE handling
        self._processor = self._try_load_indic_processor()

        elapsed = time.perf_counter() - t0
        self._model_loaded = True
        logger.success(f"[Translation] IndicTrans2 loaded in {elapsed:.2f}s ✓")

    # ──────────────────────────────────────────────────────────────────────
    def _ensure_loaded(self) -> None:
        if not self._model_loaded:
            self.load_model()

    # ──────────────────────────────────────────────────────────────────────
    def _validate_lang_codes(self, src: str, tgt: str) -> None:
        """Validates language codes against supported IndicTrans2 vocabulary."""
        for code, label in ((src, "src_lang"), (tgt, "tgt_lang")):
            if code not in VALID_LANG_CODES:
                raise ValueError(
                    f"[Translation] Unsupported {label} code: '{code}'.\n"
                    f"Valid codes: {sorted(VALID_LANG_CODES)}"
                )
        if src == tgt:
            raise ValueError(
                f"[Translation] src_lang and tgt_lang must differ (both are '{src}')."
            )

    # ──────────────────────────────────────────────────────────────────────
    def translate(
        self,
        text: Union[str, List[str]],
        source_lang: str = "hin_Deva",
        target_lang: str = "sat_Olck",
    ) -> Dict[str, Any]:
        """
        Translates text offline using IndicTrans2.

        Args:
            text: Single string or batch list of strings to translate.
            source_lang: IndicTrans2 source lang code (e.g. "hin_Deva").
            target_lang: IndicTrans2 target lang code (e.g. "sat_Olck").

        Returns:
            dict with:
              - source_text: original input (str or list)
              - translated_text: output (str if input was str, else list)
              - source_lang: str
              - target_lang: str
              - model_version: str
              - inference_time_ms: float
        """
        self._ensure_loaded()
        self._validate_lang_codes(source_lang, target_lang)

        import torch

        # Normalise to list for batch processing
        is_single = isinstance(text, str)
        batch: List[str] = [text] if is_single else list(text)
        batch = [t.strip() for t in batch if t.strip()]

        if not batch:
            logger.info("[Translation] Input text is empty after stripping.")
            return {
                "source_text": text,
                "translated_text": "" if is_single else [],
                "source_lang": source_lang,
                "target_lang": target_lang,
                "model_version": Path(self.model_path).name,
                "inference_time_ms": 0.0,
            }

        logger.info(
            f"[Translation] Translating {len(batch)} segment(s) | "
            f"{source_lang} → {target_lang}"
        )
        t0 = time.perf_counter()

        # ── IndicProcessor preprocessing ─────────────────────────────────
        if self._processor is not None:
            batch_preprocessed = self._processor.preprocess_batch(
                batch,
                src_lang=source_lang,
                tgt_lang=target_lang,
            )
        else:
            # Fallback: manual language-tag injection matching IndicTrans2 format
            s_lang = source_lang.strip("_")
            t_lang = target_lang.strip("_")
            batch_preprocessed = [
                f"{s_lang} {t_lang} {sent}" for sent in batch
            ]

        # ── Tokenise ─────────────────────────────────────────────────────
        try:
            inputs = self._tokenizer(
                batch_preprocessed,
                truncation=True,
                padding="longest",
                max_length=self.max_input_length,
                return_tensors="pt",
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
        except Exception as exc:
            raise RuntimeError(f"[Translation] Tokenisation failed: {exc}") from exc

        # ── Inference ────────────────────────────────────────────────────
        try:
            with torch.inference_mode():
                # Enable autocast (mixed precision) on CUDA only
                ctx = (
                    torch.autocast(device_type="cuda", dtype=torch.float16)
                    if self.device == "cuda"
                    else torch.no_grad()
                )
                with ctx:
                    generated_ids = self._model.generate(
                        **inputs,
                        num_beams=self.num_beams,
                        max_new_tokens=min(self.max_target_length, 128),
                        num_return_sequences=1,
                        use_cache=False,
                    )
        except Exception as exc:
            raise RuntimeError(f"[Translation] Generation failed: {exc}") from exc

        # ── Decode ───────────────────────────────────────────────────────
        decoded_tokens = self._tokenizer.batch_decode(
            generated_ids,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=True,
        )

        # ── IndicProcessor postprocessing ─────────────────────────────────
        if self._processor is not None:
            if target_lang == "sat_Olck":
                # Special handling for Santhali Ol Chiki:
                # IndicTransToolkit internally maps sat_Olck to 'or' (Odia) because indic_nlp_library
                # lacks an Ol Chiki transliterator. We postprocess as Devanagari, then transliterate
                # directly to authentic Ol Chiki script (U+1C50-U+1C7F).
                deva_batch = self._processor.postprocess_batch(
                    decoded_tokens, lang="hin_Deva"
                )
                from app.utils.ol_chiki import deva_to_olchiki
                translated_batch = [deva_to_olchiki(t) for t in deva_batch]
            else:
                translated_batch = self._processor.postprocess_batch(
                    decoded_tokens, lang=target_lang
                )
        else:
            if target_lang == "sat_Olck":
                from app.utils.ol_chiki import deva_to_olchiki
                translated_batch = [deva_to_olchiki(t.strip()) for t in decoded_tokens]
            else:
                translated_batch = [t.strip() for t in decoded_tokens]


        inference_ms = round((time.perf_counter() - t0) * 1000, 2)
        safe_preview = translated_batch[0][:60].encode("ascii", "backslashreplace").decode("ascii")
        logger.success(
            f"[Translation] Done in {inference_ms}ms | "
            f"output[0]='{safe_preview}...'"
        )

        return {
            "source_text": text,
            "translated_text": translated_batch[0] if is_single else translated_batch,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "model_version": Path(self.model_path).name,
            "inference_time_ms": inference_ms,
        }

    # ──────────────────────────────────────────────────────────────────────
    def translate_batch(
        self,
        texts: List[str],
        source_lang: str = "hin_Deva",
        target_lang: str = "sat_Olck",
    ) -> List[str]:
        """Convenience wrapper returning only translated strings."""
        result = self.translate(texts, source_lang=source_lang, target_lang=target_lang)
        out = result["translated_text"]
        return out if isinstance(out, list) else [out]

    # ──────────────────────────────────────────────────────────────────────
    def unload_model(self) -> None:
        """Frees model memory. Useful between batch jobs."""
        if self._model is not None:
            import torch
            del self._model
            if self.device == "cuda":
                torch.cuda.empty_cache()
            self._model = None
            self._model_loaded = False
            logger.info("[Translation] Model unloaded from memory.")

    # ──────────────────────────────────────────────────────────────────────
    def health_check(self) -> Dict[str, Any]:
        """Returns service configuration and readiness state."""
        try:
            import torch
            cuda_info = {
                "cuda_available": torch.cuda.is_available(),
                "cuda_device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
            }
        except ImportError:
            cuda_info = {"cuda_available": False, "cuda_device": None}

        return {
            "service": "Translation (IndicTrans2)",
            "model_loaded": self._model_loaded,
            "model_path": self.model_path,
            "device": self.device,
            "indic_processor_available": self._processor is not None,
            **cuda_info,
        }


# ── Singleton ─────────────────────────────────────────────────────────────────
translation_service = JanbhashaTranslationService()
