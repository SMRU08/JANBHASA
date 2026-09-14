package com.janbhasha.core.ai

/**
 * Santali TTS voice configuration.
 * Defines speaker profiles for both the Piper VITS engine (active today)
 * and the Indic Parler-TTS engine (Premium — requires model download).
 */
object SantaliTtsConfig {

    enum class TtsEngine {
        PIPER_VITS,         // Fast, 63 MB, always available — default
        INDIC_PARLER_TTS    // High quality, 885 MB, requires download — premium
    }

    enum class SantaliSpeaker(
        val displayName: String,
        val engineRequirement: TtsEngine,
        val parlerDescription: String,
        val piperLengthScale: Float,
        val isPremium: Boolean
    ) {
        PIPER_CLASSROOM(
            displayName = "Santali Teacher (Default)",
            engineRequirement = TtsEngine.PIPER_VITS,
            parlerDescription = "",
            piperLengthScale = 1.25f,
            isPremium = false
        ),
        PIPER_SLOW(
            displayName = "Santali Teacher (Slow)",
            engineRequirement = TtsEngine.PIPER_VITS,
            parlerDescription = "",
            piperLengthScale = 1.45f,
            isPremium = false
        ),
        PIPER_FAST(
            displayName = "Santali Conversational",
            engineRequirement = TtsEngine.PIPER_VITS,
            parlerDescription = "",
            piperLengthScale = 1.00f,
            isPremium = false
        ),
        PARLER_ARJUN(
            displayName = "Arjun Premium",
            engineRequirement = TtsEngine.INDIC_PARLER_TTS,
            parlerDescription = "Arjun's voice is clear and natural, speaking at a moderate pace with accurate Santali pronunciation. The recording has minimal background noise and very high audio quality, suitable for educational use in a classroom.",
            piperLengthScale = 1.25f,
            isPremium = true
        ),
        PARLER_PUSHPA(
            displayName = "Pushpa Premium",
            engineRequirement = TtsEngine.INDIC_PARLER_TTS,
            parlerDescription = "Pushpa's voice is warm, clear, and expressive, speaking Santali at a calm and measured pace with natural intonation. The audio is clean with no background noise, ideal for classroom teaching and educational content.",
            piperLengthScale = 1.25f,
            isPremium = true
        );
    }

    const val PARLER_MODEL_DIR = "models/tts/indic_parler"
    const val PARLER_TEXT_ENCODER_FP16 = "text_encoder_fp16.onnx"
    const val PARLER_TEXT_ENCODER_FP16_DATA = "text_encoder_fp16.onnx.data"
    const val PARLER_DECODER_FP16 = "decoder_model_fp16.onnx"
    const val PARLER_DECODER_FP16_DATA = "decoder_model_fp16.onnx.data"
    const val PARLER_DECODER_WITH_PAST_FP16 = "decoder_with_past_model_fp16.onnx"
    const val PARLER_DECODER_WITH_PAST_FP16_DATA = "decoder_with_past_model_fp16.onnx.data"
    const val PARLER_TOKENIZER_JSON = "tokenizer.json"
    const val PARLER_CONFIG_JSON = "config.json"
    const val PARLER_GENERATION_CONFIG = "generation_config.json"

    const val PARLER_SAMPLE_RATE = 44100
    const val PIPER_SAMPLE_RATE = 16000

    const val PARLER_EXPECTED_MIN_BYTES = 800L * 1024 * 1024

    val DEFAULT_SPEAKER = SantaliSpeaker.PIPER_CLASSROOM
}
