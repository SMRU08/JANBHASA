# Third-Party Licenses & Model Provenance

Janbhasha integrates authentic open-source datasets, models, and runtimes to deliver 100% offline, air-gapped Hindi-Santali vernacular education. All third-party artifacts used in this project conform to permissive open-source licenses.

---

## 1. Vernacular Pedagogy Santali AI Models & Datasets
- **Source Repository**: [`Ashraf01k/vernacular-pedagogy-santhali`](https://huggingface.co/Ashraf01k/vernacular-pedagogy-santhali)
- **License**: **MIT License**
- **Copyright**: (c) 2024–2026 Vernacular Pedagogy Project Contributors

### Included Artifacts:
1. **Santali Piper Neural TTS Model**:
   - Files: `sat_piper_model.onnx`, `sat_piper_model.onnx.json`
   - Description: VITS architecture Piper neural text-to-speech model trained on multi-speaker Santali Ol Chiki speech at 16,000 Hz.
   - License: MIT License

2. **FLN Classroom Lexicon**:
   - Files: `fln_lexicon.sqlite`, `mobile/src/data/flnLexiconData.ts`
   - Description: 368 verified pedagogical interactions across Numeracy, Literacy, Classroom Management, and Assessment domains aligned with NIPUN Bharat standards.
   - License: MIT License

3. **IndicTrans2 INT8 Quantized Neural Machine Translation**:
   - Files: `indictrans2_sat_int8_ct2.tar.gz` (extracted to `indictrans2_sat_int8_ct2/`)
   - Description: CTranslate2 INT8 quantized translation model for `hin_Deva` -> `sat_Olck`.
   - Upstream Provenance: AI4Bharat IndicTrans2 / IndicNLP (MIT License).

---

## 2. Runtimes & Inference Engines
1. **CTranslate2**:
   - Source: https://github.com/OpenNMT/CTranslate2
   - License: MIT License
   - Usage: Fast on-device memory-mapped INT8 inference on low-RAM CPUs.

2. **ONNX Runtime Mobile**:
   - Source: https://github.com/microsoft/onnxruntime
   - License: MIT License
   - Usage: On-device execution of Piper VITS Santali neural waveform generator.

3. **SentencePiece**:
   - Source: https://github.com/google/sentencepiece
   - License: Apache License 2.0
   - Usage: Subword tokenization and detokenization for IndicTrans2.

---

## 3. Fonts & Typography
1. **Noto Sans Ol Chiki**:
   - Files: `NotoSansOlChiki-Regular.ttf`, `NotoSansOlChiki-Bold.ttf`
   - Source: Google Fonts / Noto Project
   - License: **SIL Open Font License 1.1 (OFL)**
   - Copyright: (c) Google LLC

---

## 4. Acoustic & Speech Recognition Disclosures
- **Hindi Speech Recognition**: Relies on Android's built-in on-device `SpeechRecognizer` (Google offline speech recognition engine or device vendor OEM local model).
- **Santali Speech Recognition**: No open-source, mobile-deployable Santali ASR model is currently hosted in the Hugging Face bucket. Per our Honest AI commitment, Santali ASR is declared as "Community Model Pending" rather than using fake transcription.
