package com.janbhasha.core.ai

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/**
 * Unified Offline Santali TTS interface.
 *
 * Manages two TTS engines behind a single clean API:
 *  - PIPER_VITS: Always available, 63 MB, fast (100-500ms), 16 kHz
 *  - INDIC_PARLER_TTS: Premium, ~885 MB, slower (2-8s), 44.1 kHz
 *
 * The UI only calls generateSpeech() — it does not know which engine is active.
 *
 * States: IDLE → LOADING_MODEL → READY → GENERATING → COMPLETED/ERROR
 */
class OfflineSantaliTtsEngine(private val context: Context) {

    companion object {
        private const val TAG = "JANBHASHA][TTS_ENGINE"
    }

    enum class EngineState {
        IDLE, LOADING_MODEL, READY, GENERATING, COMPLETED, ERROR
    }

    data class GenerationResult(
        val success: Boolean,
        val audioFilePath: String? = null,
        val sampleRate: Int = 16000,
        val durationSec: Float = 0f,
        val engineUsed: SantaliTtsConfig.TtsEngine = SantaliTtsConfig.TtsEngine.PIPER_VITS,
        val errorMessage: String? = null,
        val inferenceMs: Long = 0L
    )

    // Active configuration
    private var activeEngine = SantaliTtsConfig.TtsEngine.PIPER_VITS
    private var activeSpeaker = SantaliTtsConfig.DEFAULT_SPEAKER
    private var state = EngineState.IDLE

    // Piper VITS engine (always-available default)
    private val piperEngine = VitsTtsEngine(context)

    // Parler WebView engine (premium — instantiated lazily)
    private var parlerEngine: IndicParlerTtsWebEngine? = null

    fun setEngine(engine: SantaliTtsConfig.TtsEngine) {
        if (engine != activeEngine) {
            activeEngine = engine
            state = EngineState.IDLE
            Log.i(TAG, "TTS engine switched to: $engine")
        }
    }

    fun setSpeaker(speaker: SantaliTtsConfig.SantaliSpeaker) {
        activeSpeaker = speaker
        // Sync engine to speaker requirement
        if (speaker.engineRequirement != activeEngine) {
            setEngine(speaker.engineRequirement)
        }
        // Sync Piper speed if using VITS
        if (activeEngine == SantaliTtsConfig.TtsEngine.PIPER_VITS) {
            piperEngine.setLengthScale(speaker.piperLengthScale)
        }
        Log.i(TAG, "Speaker set to: ${speaker.displayName} (engine: $activeEngine)")
    }

    fun getActiveSpeaker(): SantaliTtsConfig.SantaliSpeaker = activeSpeaker
    fun getActiveEngine(): SantaliTtsConfig.TtsEngine = activeEngine
    fun getState(): EngineState = state

    fun isReady(): Boolean = when (activeEngine) {
        SantaliTtsConfig.TtsEngine.PIPER_VITS -> piperEngine.isReady()
        SantaliTtsConfig.TtsEngine.INDIC_PARLER_TTS -> parlerEngine?.isReady() == true
    }

    fun isParlerModelAvailable(): Boolean {
        val extDir = context.getExternalFilesDir(null) ?: return false
        val modelDir = File(extDir, SantaliTtsConfig.PARLER_MODEL_DIR)
        if (!modelDir.exists()) return false
        val requiredFiles = listOf(
            SantaliTtsConfig.PARLER_TEXT_ENCODER_FP16_DATA,
            SantaliTtsConfig.PARLER_DECODER_FP16_DATA,
            SantaliTtsConfig.PARLER_DECODER_WITH_PAST_FP16_DATA,
            SantaliTtsConfig.PARLER_TOKENIZER_JSON
        )
        return requiredFiles.all { File(modelDir, it).exists() }
    }

    fun getParlerModelSizeBytes(): Long {
        val extDir = context.getExternalFilesDir(null) ?: return 0L
        val modelDir = File(extDir, SantaliTtsConfig.PARLER_MODEL_DIR)
        if (!modelDir.exists()) return 0L
        return modelDir.walkTopDown().filter { it.isFile }.sumOf { it.length() }
    }

    suspend fun initialize(): Boolean = withContext(Dispatchers.IO) {
        state = EngineState.LOADING_MODEL
        Log.i(TAG, "Initializing TTS engine: $activeEngine / speaker: ${activeSpeaker.displayName}")
        try {
            val ok = when (activeEngine) {
                SantaliTtsConfig.TtsEngine.PIPER_VITS -> {
                    piperEngine.setLengthScale(activeSpeaker.piperLengthScale)
                    piperEngine.initialize()
                }
                SantaliTtsConfig.TtsEngine.INDIC_PARLER_TTS -> {
                    if (!isParlerModelAvailable()) {
                        Log.e(TAG, "Parler-TTS model files not found on device")
                        state = EngineState.ERROR
                        return@withContext false
                    }
                    if (parlerEngine == null) {
                        withContext(Dispatchers.Main) {
                            parlerEngine = IndicParlerTtsWebEngine(context)
                        }
                    }
                    parlerEngine!!.initialize()
                }
            }
            state = if (ok) EngineState.READY else EngineState.ERROR
            Log.i(TAG, "TTS engine init ${if (ok) "SUCCESS" else "FAILED"}: $activeEngine")
            ok
        } catch (e: Exception) {
            Log.e(TAG, "TTS engine init exception: ${e.message}", e)
            state = EngineState.ERROR
            false
        }
    }

    /**
     * Generate Santali speech from text.
     * Returns a GenerationResult with the output WAV file path.
     */
    suspend fun generateSpeech(text: String): GenerationResult = withContext(Dispatchers.IO) {
        if (!isReady()) {
            val ok = initialize()
            if (!ok) {
                return@withContext GenerationResult(
                    success = false,
                    errorMessage = "Santali voice model is unavailable on this device. Check that model files are installed."
                )
            }
        }

        state = EngineState.GENERATING
        val t0 = System.currentTimeMillis()

        try {
            val outputFile = File(context.cacheDir, "santali_tts_${System.currentTimeMillis()}.wav")
            val result = when (activeEngine) {
                SantaliTtsConfig.TtsEngine.PIPER_VITS -> {
                    val pair = piperEngine.synthesizeToWav(text, outputFile)
                    if (pair != null) {
                        GenerationResult(
                            success = true,
                            audioFilePath = pair.first,
                            sampleRate = SantaliTtsConfig.PIPER_SAMPLE_RATE,
                            durationSec = pair.second,
                            engineUsed = SantaliTtsConfig.TtsEngine.PIPER_VITS,
                            inferenceMs = System.currentTimeMillis() - t0
                        )
                    } else {
                        GenerationResult(success = false, errorMessage = "Piper VITS failed to synthesize audio. Check model file.")
                    }
                }
                SantaliTtsConfig.TtsEngine.INDIC_PARLER_TTS -> {
                    val engine = parlerEngine
                    if (engine == null) {
                        GenerationResult(success = false, errorMessage = "Parler-TTS engine not initialized.")
                    } else {
                        engine.synthesizeToWav(
                            text = text,
                            speakerDescription = activeSpeaker.parlerDescription,
                            outputFile = outputFile
                        )
                    }
                }
            }
            state = if (result.success) EngineState.COMPLETED else EngineState.ERROR
            Log.i(TAG, "[TTS] ${activeEngine} synthesis: ${result.success}, ${result.durationSec}s audio, ${result.inferenceMs}ms latency")
            result
        } catch (e: Exception) {
            state = EngineState.ERROR
            Log.e(TAG, "generateSpeech exception: ${e.message}", e)
            GenerationResult(success = false, errorMessage = "TTS generation error: ${e.message}")
        }
    }

    fun release() {
        piperEngine.release()
        parlerEngine?.release()
        parlerEngine = null
        state = EngineState.IDLE
    }
}
