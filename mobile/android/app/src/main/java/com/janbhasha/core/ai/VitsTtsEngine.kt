package com.janbhasha.core.ai

import ai.onnxruntime.OnnxTensor
import ai.onnxruntime.OrtEnvironment
import ai.onnxruntime.OrtSession
import android.content.Context
import android.util.Log
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.nio.FloatBuffer
import java.nio.LongBuffer

/**
 * On-Device VITS Neural TTS Engine (16,000 Hz).
 * Operates 100% offline using ONNX Runtime Mobile to synthesize
 * Santali Ol Chiki text into authentic 16kHz raw PCM waveform.
 */
class VitsTtsEngine(private val context: Context) {

    companion object {
        private const val TAG = "JANBHASHA][TTS"
        const val SAMPLE_RATE = 16000
    }

    private var ortEnv: OrtEnvironment? = null
    private var ortSession: OrtSession? = null
    private var phonemeIdMap: Map<String, List<Int>> = emptyMap()
    private var isInitialized = false

    suspend fun initialize(): Boolean = withContext(Dispatchers.IO) {
        if (isInitialized && ortSession != null) return@withContext true
        try {
            Log.i(TAG, "Initializing on-device VITS TTS Engine...")
            ortEnv = OrtEnvironment.getEnvironment()

            val modelFile = resolveModelFile("sat_piper_model.onnx", "vits_santali.onnx")
            val configFile = resolveModelFile("sat_piper_model.onnx.json", "vits_santali.json")

            if (modelFile == null || !modelFile.exists()) {
                Log.e(TAG, "VITS model file not found in device storage")
                return@withContext false
            }

            // Load session with optimal single-thread config for mobile CPU
            val sessionOptions = OrtSession.SessionOptions().apply {
                setIntraOpNumThreads(2)
                setOptimizationLevel(OrtSession.SessionOptions.OptLevel.ALL_OPT)
            }
            ortSession = ortEnv?.createSession(modelFile.absolutePath, sessionOptions)
            Log.i(TAG, "ONNX VITS session created from: ${modelFile.absolutePath} (${modelFile.length() / (1024 * 1024)} MB)")

            // Load phoneme mapping
            if (configFile != null && configFile.exists()) {
                val jsonStr = configFile.readText(Charsets.UTF_8)
                val gson = Gson()
                val mapType = object : TypeToken<Map<String, Any>>() {}.type
                val root: Map<String, Any> = gson.fromJson(jsonStr, mapType)
                @Suppress("UNCHECKED_CAST")
                val rawIdMap = root["phoneme_id_map"] as? Map<String, List<Double>>
                if (rawIdMap != null) {
                    phonemeIdMap = rawIdMap.mapValues { entry ->
                        entry.value.map { it.toInt() }
                    }
                    Log.i(TAG, "Loaded ${phonemeIdMap.size} phoneme mappings from ${configFile.name}")
                }
            }

            isInitialized = true
            Log.i(TAG, "VITS TTS Engine initialized successfully.")
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize VITS TTS Engine: ${e.message}", e)
            return@withContext false
        }
    }

    private fun resolveModelFile(primaryName: String, fallbackName: String): File? {
        val candidates = listOf(
            File(context.getExternalFilesDir(null), "models/tts/sat_piper/$primaryName"),
            File("/sdcard/Android/data/com.janbhasha/files/models/tts/sat_piper/$primaryName"),
            File("/sdcard/Janbhasha/models/tts/sat_piper/$primaryName"),
            File(context.filesDir, "models/tts/sat_piper/$primaryName"),
            File(context.getExternalFilesDir(null), "models/tts/sat_piper/$fallbackName"),
            File("/sdcard/Janbhasha/models/tts/sat_piper/$fallbackName")
        )
        return candidates.firstOrNull { it.exists() && it.length() > 0 }
    }

    fun isReady(): Boolean = isInitialized && ortSession != null

    /**
     * Synthesizes Santali Ol Chiki text into a 16,000 Hz FloatArray audio waveform.
     */
    suspend fun synthesize(text: String): FloatArray? = withContext(Dispatchers.Default) {
        if (!isInitialized || ortSession == null) {
            val ok = initialize()
            if (!ok) return@withContext null
        }

        val session = ortSession ?: return@withContext null
        val env = ortEnv ?: return@withContext null

        try {
            val t0 = System.currentTimeMillis()
            // 1. Convert text to phoneme sequence: ^ + text + $
            val tokenIds = mutableListOf<Long>()
            tokenIds.add(1L) // ^ (start of sequence)

            val clean = text.trim()
            for (ch in clean) {
                val s = ch.toString()
                val ids = phonemeIdMap[s] ?: phonemeIdMap[s.lowercase()]
                if (ids != null && ids.isNotEmpty()) {
                    tokenIds.add(ids[0].toLong())
                } else if (ch == ' ') {
                    tokenIds.add(3L) // space token
                }
            }
            tokenIds.add(2L) // $ (end of sequence)

            if (tokenIds.size <= 2) {
                Log.w(TAG, "No valid phonemes found for input text: '$text'")
                return@withContext null
            }

            val inputShape = longArrayOf(1, tokenIds.size.toLong())
            val lengthsShape = longArrayOf(1)
            val scalesShape = longArrayOf(3)

            val inputBuffer = LongBuffer.wrap(tokenIds.toLongArray())
            val lengthsBuffer = LongBuffer.wrap(longArrayOf(tokenIds.size.toLong()))
            val scalesBuffer = FloatBuffer.wrap(floatArrayOf(0.667f, 1.0f, 0.8f))

            val inputTensor = OnnxTensor.createTensor(env, inputBuffer, inputShape)
            val lengthsTensor = OnnxTensor.createTensor(env, lengthsBuffer, lengthsShape)
            val scalesTensor = OnnxTensor.createTensor(env, scalesBuffer, scalesShape)

            val inputs = mapOf(
                "input" to inputTensor,
                "input_lengths" to lengthsTensor,
                "scales" to scalesTensor
            )

            val result = session.run(inputs)
            val outputTensor = result[0] as OnnxTensor
            val floatBuffer = outputTensor.floatBuffer
            val floatSamples = FloatArray(floatBuffer.remaining())
            floatBuffer.get(floatSamples)

            // Release tensor resources
            inputTensor.close()
            lengthsTensor.close()
            scalesTensor.close()
            result.close()

            val latency = System.currentTimeMillis() - t0
            Log.i(TAG, "VITS synthesized ${floatSamples.size} audio samples (16kHz, ${floatSamples.size / 16000f}s) in ${latency}ms for '$text'")
            return@withContext floatSamples
        } catch (e: Exception) {
            Log.e(TAG, "VITS synthesis error: ${e.message}", e)
            return@withContext null
        }
    }

    /**
     * Synthesizes text and saves the output to a 16kHz WAV file.
     * Returns the file path and duration in seconds.
     */
    suspend fun synthesizeToWav(text: String, outputFile: File): Pair<String, Float>? = withContext(Dispatchers.IO) {
        val samples = synthesize(text) ?: return@withContext null
        try {
            saveFloatSamplesToWav(samples, outputFile, SAMPLE_RATE)
            val durationSec = samples.size.toFloat() / SAMPLE_RATE
            Log.i(TAG, "Saved 16kHz Santali WAV: ${outputFile.absolutePath} (${outputFile.length()} bytes, ${durationSec}s)")
            return@withContext Pair(outputFile.absolutePath, durationSec)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save WAV: ${e.message}", e)
            return@withContext null
        }
    }

    private fun saveFloatSamplesToWav(samples: FloatArray, file: File, sampleRate: Int) {
        val totalAudioLen = samples.size * 2L
        val totalDataLen = totalAudioLen + 36
        val channels = 1
        val byteRate = sampleRate * channels * 2

        val header = ByteArray(44)
        header[0] = 'R'.code.toByte(); header[1] = 'I'.code.toByte(); header[2] = 'F'.code.toByte(); header[3] = 'F'.code.toByte()
        header[4] = (totalDataLen and 0xff).toByte()
        header[5] = ((totalDataLen shr 8) and 0xff).toByte()
        header[6] = ((totalDataLen shr 16) and 0xff).toByte()
        header[7] = ((totalDataLen shr 24) and 0xff).toByte()
        header[8] = 'W'.code.toByte(); header[9] = 'A'.code.toByte(); header[10] = 'V'.code.toByte(); header[11] = 'E'.code.toByte()
        header[12] = 'f'.code.toByte(); header[13] = 'm'.code.toByte(); header[14] = 't'.code.toByte(); header[15] = ' '.code.toByte()
        header[16] = 16; header[17] = 0; header[18] = 0; header[19] = 0
        header[20] = 1; header[21] = 0
        header[22] = channels.toByte(); header[23] = 0
        header[24] = (sampleRate and 0xff).toByte()
        header[25] = ((sampleRate shr 8) and 0xff).toByte()
        header[26] = ((sampleRate shr 16) and 0xff).toByte()
        header[27] = ((sampleRate shr 24) and 0xff).toByte()
        header[28] = (byteRate and 0xff).toByte()
        header[29] = ((byteRate shr 8) and 0xff).toByte()
        header[30] = ((byteRate shr 16) and 0xff).toByte()
        header[31] = ((byteRate shr 24) and 0xff).toByte()
        header[32] = 2; header[33] = 0 // block align = 2
        header[34] = 16; header[35] = 0 // bits per sample = 16
        header[36] = 'd'.code.toByte(); header[37] = 'a'.code.toByte(); header[38] = 't'.code.toByte(); header[39] = 'a'.code.toByte()
        header[40] = (totalAudioLen and 0xff).toByte()
        header[41] = ((totalAudioLen shr 8) and 0xff).toByte()
        header[42] = ((totalAudioLen shr 16) and 0xff).toByte()
        header[43] = ((totalAudioLen shr 24) and 0xff).toByte()

        FileOutputStream(file).use { fos ->
            fos.write(header)
            val pcmBytes = ByteArray(samples.size * 2)
            for (i in samples.indices) {
                // Clamping to [-1.0, 1.0]
                val clamped = samples[i].coerceIn(-1.0f, 1.0f)
                val s = (clamped * 32767.0f).toInt().toShort()
                pcmBytes[i * 2] = (s.toInt() and 0xFF).toByte()
                pcmBytes[i * 2 + 1] = ((s.toInt() shr 8) and 0xFF).toByte()
            }
            fos.write(pcmBytes)
        }
    }

    fun release() {
        try {
            ortSession?.close()
            ortSession = null
            ortEnv?.close()
            ortEnv = null
            isInitialized = false
        } catch (_: Exception) {}
    }
}
