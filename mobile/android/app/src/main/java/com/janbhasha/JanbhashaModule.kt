package com.janbhasha

import android.content.Context
import android.content.Intent
import android.content.ComponentName
import android.provider.Settings
import android.media.AudioManager as AndroidAudioManager
import android.media.AudioDeviceInfo
import android.media.AudioAttributes
import android.media.MediaRecorder
import android.media.MediaPlayer
import android.media.AudioRecord
import android.media.AudioFormat
import android.bluetooth.BluetoothAdapter
import android.os.Build
import android.os.Environment
import android.util.Base64
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.common.annotations.FrameworkAPI
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.speech.SpeechRecognizer
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import java.util.Locale
import java.io.File
import java.io.FileOutputStream
import com.janbhasha.core.ai.VitsTtsEngine
import com.janbhasha.core.audio.AudioTrackPlayer

private const val TAG = "JanbhashaModule"

/**
 * JanbhashaModule
 *
 * React Native NativeModule that:
 *   1. Loads the native shared library (libjanbhasha-native.so)
 *   2. Installs the JSI HostObject into the Hermes runtime
 *   3. Provides a `cancelPipeline()` safety escape hatch from JS
 *
 * All actual inference is exposed through global.__janbhasha (JSI)
 * — NOT through the React Native bridge — to avoid serialization overhead.
 *
 * JSI INSTALLATION MUST HAPPEN ON THE JSI THREAD.
 * This module uses `reactContext.runOnJSQueueThread` to guarantee that.
 */
@OptIn(FrameworkAPI::class)
@ReactModule(name = JanbhashaModule.NAME)
class JanbhashaModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val NAME = "JanbhashaModule"

        init {
            // Load the native library once when the class is loaded.
            System.loadLibrary("janbhasha-native")
            Log.i(TAG, "libjanbhasha-native.so loaded")
        }
    }

    override fun getName(): String = NAME

    // ----------------------------------------------------------------
    // @ReactMethod: installJSI
    // Called from JS once on startup:
    //   NativeModules.JanbhashaModule.installJSI()
    // ----------------------------------------------------------------
    private fun resolveModelsDirectory(): File {
        // 1. App-specific External Files directory: /sdcard/Android/data/com.janbhasha/files/models
        try {
            val externalFiles = reactContext.getExternalFilesDir(null)
            if (externalFiles != null) {
                val externalModels = File(externalFiles, "models")
                if (!externalModels.exists()) {
                    externalModels.mkdirs()
                }
                // Ensure expected model subdirectories exist
                File(externalModels, "asr/whisper-small-ct2").mkdirs()
                File(externalModels, "tts/vits-santhali").mkdirs()
                File(externalModels, "tts/sat_piper").mkdirs()
                File(externalModels, "dictionary").mkdirs()

                if (externalModels.exists() && (externalModels.list()?.isNotEmpty() == true)) {
                    Log.i(TAG, "Using app-specific external models: ${externalModels.absolutePath}")
                    return externalModels
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Could not access externalFilesDir: ${e.message}")
        }

        // 2. Shared storage directory: /sdcard/Janbhasha/models
        try {
            val sharedModels = File(Environment.getExternalStorageDirectory(), "Janbhasha/models")
            if (sharedModels.exists() && (sharedModels.list()?.isNotEmpty() == true)) {
                Log.i(TAG, "Using shared storage models: ${sharedModels.absolutePath}")
                return sharedModels
            }
        } catch (e: Exception) {
            Log.w(TAG, "Could not access shared storage: ${e.message}")
        }

        // 3. Fallback to Internal Private Storage: /data/user/0/com.janbhasha/files/models
        val internalModels = File(reactContext.filesDir, "models")
        internalModels.mkdirs()
        File(internalModels, "asr/whisper-small-ct2").mkdirs()
        File(internalModels, "tts/vits-santhali").mkdirs()
        File(internalModels, "tts/sat_piper").mkdirs()
        File(internalModels, "dictionary").mkdirs()
        Log.i(TAG, "Using internal storage models: ${internalModels.absolutePath}")
        return internalModels
    }

    @ReactMethod
    fun log(tag: String, message: String) {
        Log.i("JANBHASHA_LOG", "[$tag] $message")
    }

    @ReactMethod
    fun getModelsPath(promise: Promise) {
        try {
            val dir = resolveModelsDirectory()
            promise.resolve(dir.absolutePath)
        } catch (e: Exception) {
            promise.reject("GET_MODELS_PATH_FAILED", e.message ?: "Failed to resolve models path", e)
        }
    }

    @ReactMethod
    fun installJSI(promise: Promise) {
        val jsRuntime = reactContext.javaScriptContextHolder?.get()
        if (jsRuntime == null || jsRuntime == 0L) {
            promise.reject("JSI_UNAVAILABLE", "Could not get JS runtime pointer")
            return
        }

        val callInvokerHolder = reactContext.catalystInstance
            ?.jsCallInvokerHolder as? CallInvokerHolderImpl
        if (callInvokerHolder == null) {
            promise.reject("CALL_INVOKER_UNAVAILABLE", "CallInvoker is null")
            return
        }

        // Perform disk inspection and model resolution in background coroutine (IO Thread)
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val modelsBaseDir = resolveModelsDirectory()
                val modelsBasePath = modelsBaseDir.absolutePath
                val filesDir = reactContext.filesDir.absolutePath
                val manifestPath = "$filesDir/model_manifest.json"
                val cacheDir = reactContext.cacheDir.absolutePath

                File(cacheDir).mkdirs()

                if (!File(manifestPath).exists()) {
                    try {
                        reactContext.assets.open("model_manifest.json").use { input ->
                            File(manifestPath).outputStream().use { output ->
                                input.copyTo(output)
                            }
                        }
                        Log.i(TAG, "model_manifest.json copied from assets")
                    } catch (e: Exception) {
                        Log.w(TAG, "No assets/model_manifest.json: ${e.message}")
                    }
                }

                // Switch to JS Queue Thread to install JSI HostObject
                withContext(Dispatchers.Main) {
                    reactContext.runOnJSQueueThread {
                        try {
                            nativeInitialize(
                                jsRuntime,
                                modelsBasePath,
                                manifestPath,
                                cacheDir,
                                callInvokerHolder
                            )
                            Log.i(TAG, "JSI HostObject installed: global.__janbhasha [models: $modelsBasePath]")
                            promise.resolve(modelsBasePath)
                        } catch (e: Exception) {
                            Log.e(TAG, "nativeInitialize failed: ${e.message}", e)
                            promise.reject("INIT_FAILED", e.message ?: "Native initialization error", e)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "installJSI coroutine error: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    promise.reject("INSTALL_FAILED", e.message ?: "Background init error", e)
                }
            }
        }
    }

    // ----------------------------------------------------------------
    // @ReactMethod: cancelPipeline
    // Safe escape hatch — can be called from JS bridge (not JSI)
    // if the JSI layer is blocked.
    // ----------------------------------------------------------------
    @ReactMethod
    fun cancelPipeline() {
        try {
            nativeCancelPipeline()
            Log.i(TAG, "Pipeline cancel requested from Java bridge")
        } catch (e: Exception) {
            Log.e(TAG, "cancelPipeline error: ${e.message}")
        }
    }

    // ----------------------------------------------------------------
    // @ReactMethod: releaseEngine
    // ----------------------------------------------------------------
    @ReactMethod
    fun releaseEngine(promise: Promise) {
        try {
            nativeRelease()
            Log.i(TAG, "Native engine released")
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("RELEASE_FAILED", e.message ?: "Unknown error", e)
        }
    }

    // ----------------------------------------------------------------
    // 2 Audio Output Modes:
    // Mode 1: "speaker"   -> Phone's built-in loudspeaker
    // Mode 2: "bluetooth" -> Connected Bluetooth speaker / headset
    // ----------------------------------------------------------------
    private var currentAudioOutputMode: String = "speaker"

    @ReactMethod
    fun setAudioOutputMode(mode: String, promise: Promise) {
        try {
            val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
            if (audioManager == null) {
                promise.reject("AUDIO_UNAVAILABLE", "Android AudioManager unavailable")
                return
            }

            val targetMode = mode.lowercase()
            if (targetMode == "speaker") {
                currentAudioOutputMode = "speaker"

                // 1. If Android 12+ (API 31+), route communication device to built-in speaker
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val speakerDevice = audioManager.availableCommunicationDevices.firstOrNull {
                        it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
                    }
                    if (speakerDevice != null) {
                        audioManager.setCommunicationDevice(speakerDevice)
                        Log.i(TAG, "setCommunicationDevice: TYPE_BUILTIN_SPEAKER")
                    } else {
                        audioManager.clearCommunicationDevice()
                    }
                }

                // 2. Set speakerphone on & disable Bluetooth SCO
                audioManager.mode = AndroidAudioManager.MODE_NORMAL
                audioManager.isSpeakerphoneOn = true
                try {
                    audioManager.isBluetoothScoOn = false
                    audioManager.stopBluetoothSco()
                } catch (_: Exception) {}

                Log.i(TAG, "Audio output mode successfully set to: SPEAKER")
                promise.resolve("speaker")
            } else {
                currentAudioOutputMode = "bluetooth"

                // 1. If Android 12+ (API 31+), route communication device to Bluetooth device
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val btDevice = audioManager.availableCommunicationDevices.firstOrNull {
                        it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                        it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
                        it.type == AudioDeviceInfo.TYPE_BLE_HEADSET ||
                        it.type == AudioDeviceInfo.TYPE_BLE_SPEAKER
                    }
                    if (btDevice != null) {
                        audioManager.setCommunicationDevice(btDevice)
                        Log.i(TAG, "setCommunicationDevice: ${btDevice.productName} (${btDevice.type})")
                    } else {
                        // Clear override to allow standard Bluetooth A2DP media streaming
                        audioManager.clearCommunicationDevice()
                    }
                }

                // 2. Clear speakerphone override
                audioManager.isSpeakerphoneOn = false

                // 3. For Bluetooth SCO voice headsets, initiate SCO connection
                try {
                    audioManager.mode = AndroidAudioManager.MODE_IN_COMMUNICATION
                    audioManager.startBluetoothSco()
                    audioManager.isBluetoothScoOn = true
                } catch (_: Exception) {}

                Log.i(TAG, "Audio output mode successfully set to: BLUETOOTH")
                promise.resolve("bluetooth")
            }
        } catch (e: Exception) {
            Log.e(TAG, "setAudioOutputMode error: ${e.message}", e)
            promise.reject("MODE_CHANGE_FAILED", e.message ?: "Failed to change audio mode", e)
        }
    }

    @ReactMethod
    fun getAudioOutputMode(promise: Promise) {
        promise.resolve(currentAudioOutputMode)
    }

    @ReactMethod
    fun openBluetoothSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_BLUETOOTH_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "openBluetoothSettings error: ${e.message}", e)
            promise.reject("OPEN_BT_SETTINGS_FAILED", e.message ?: "Failed to open Bluetooth settings", e)
        }
    }

    @ReactMethod
    fun getAudioOutputStatus(promise: Promise) {
        try {
            val map = Arguments.createMap()
            map.putString("mode", currentAudioOutputMode)

            val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
            var isBtConnected = false
            var connectedBtName = ""

            if (audioManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val devices = audioManager.getDevices(AndroidAudioManager.GET_DEVICES_OUTPUTS)
                for (d in devices) {
                    if (d.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                        d.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
                        (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && (
                            d.type == AudioDeviceInfo.TYPE_BLE_HEADSET ||
                            d.type == AudioDeviceInfo.TYPE_BLE_SPEAKER
                        ))) {
                        isBtConnected = true
                        connectedBtName = d.productName?.toString() ?: "Bluetooth Audio Device"
                        break
                    }
                }
            }

            map.putBoolean("isBluetoothConnected", isBtConnected)
            map.putString("connectedBluetoothDeviceName", connectedBtName)
            promise.resolve(map)
        } catch (e: Exception) {
            val fallback = Arguments.createMap()
            fallback.putString("mode", currentAudioOutputMode)
            fallback.putBoolean("isBluetoothConnected", false)
            fallback.putString("connectedBluetoothDeviceName", "")
            promise.resolve(fallback)
        }
    }

    // ----------------------------------------------------------------
    // Bluetooth SCO Audio Controls
    // Forces audio I/O through connected wireless lapel mics or BT headsets
    // ----------------------------------------------------------------
    @ReactMethod
    fun enableBluetoothSco(promise: Promise) {
        try {
            val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
            if (audioManager == null) {
                promise.reject("AUDIO_SERVICE_UNAVAILABLE", "Android AudioManager unavailable")
                return
            }
            audioManager.mode = AndroidAudioManager.MODE_IN_COMMUNICATION
            audioManager.startBluetoothSco()
            audioManager.isBluetoothScoOn = true
            Log.i(TAG, "Bluetooth SCO enabled (MODE_IN_COMMUNICATION)")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to enable Bluetooth SCO: ${e.message}")
            promise.reject("BLUETOOTH_SCO_FAILED", e.message ?: "Failed to enable Bluetooth SCO", e)
        }
    }

    @ReactMethod
    fun disableBluetoothSco(promise: Promise) {
        try {
            val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
            if (audioManager != null) {
                audioManager.isBluetoothScoOn = false
                audioManager.stopBluetoothSco()
                audioManager.mode = AndroidAudioManager.MODE_NORMAL
                Log.i(TAG, "Bluetooth SCO disabled (MODE_NORMAL)")
            }
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to disable Bluetooth SCO: ${e.message}")
            promise.reject("BLUETOOTH_SCO_DISABLE_FAILED", e.message ?: "Failed to disable Bluetooth SCO", e)
        }
    }

    @ReactMethod
    fun isBluetoothScoOn(promise: Promise) {
        try {
            val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
            val isOn = audioManager?.isBluetoothScoOn ?: false
            promise.resolve(isOn)
        } catch (e: Exception) {
            promise.reject("BLUETOOTH_SCO_QUERY_FAILED", e.message ?: "Failed to query Bluetooth SCO", e)
        }
    }

    // ----------------------------------------------------------------
    // Native Audio Recording & Playback (Zero External Lib Dependencies)
    // ----------------------------------------------------------------
    private val vitsEngine by lazy { VitsTtsEngine(reactContext) }
    private val audioTrackPlayer by lazy { AudioTrackPlayer() }

    private var audioRecord: AudioRecord? = null
    private var isRecordingWav = false
    private var wavRecordingThread: Thread? = null
    private var currentRecordingPath: String? = null
    private var mediaPlayer: MediaPlayer? = null

    @ReactMethod
    fun startRecording(promise: Promise) {
        try {
            stopCurrentRecording()
            val outputDir = reactContext.getExternalFilesDir(null) ?: reactContext.filesDir
            if (!outputDir.exists()) {
                outputDir.mkdirs()
            }
            val wavFile = File(outputDir, "recording_16k.wav")
            currentRecordingPath = wavFile.absolutePath

            val sampleRate = 16000
            val channelConfig = AudioFormat.CHANNEL_IN_MONO
            val audioFormat = AudioFormat.ENCODING_PCM_16BIT
            val minBuf = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
            val bufferSize = if (minBuf > 0) maxOf(minBuf * 2, 4096) else 4096

            // Prefer VOICE_RECOGNITION (activates hardware AEC & noise reduction for Whisper)
            var recorder: AudioRecord? = null
            try {
                recorder = AudioRecord(
                    MediaRecorder.AudioSource.VOICE_RECOGNITION,
                    sampleRate,
                    channelConfig,
                    audioFormat,
                    bufferSize
                )
            } catch (_: Exception) {}

            if (recorder == null || recorder.state != AudioRecord.STATE_INITIALIZED) {
                recorder = AudioRecord(
                    MediaRecorder.AudioSource.MIC,
                    sampleRate,
                    channelConfig,
                    audioFormat,
                    bufferSize
                )
            }

            if (recorder.state != AudioRecord.STATE_INITIALIZED) {
                promise.reject("RECORD_INIT_FAILED", "AudioRecord failed to initialize at 16000 Hz Mono PCM")
                return
            }

            recorder.startRecording()
            audioRecord = recorder
            isRecordingWav = true

            val startMap = Arguments.createMap()
            startMap.putString("path", wavFile.absolutePath)
            startMap.putInt("sampleRate", sampleRate)
            sendEvent("onRecordingStarted", startMap)

            wavRecordingThread = Thread {
                val tempPcm = File(outputDir, "temp_stream.pcm")
                var totalBytesWritten = 0L
                var totalRmsSum = 0.0
                var totalSamplesCount = 0L
                try {
                    FileOutputStream(tempPcm).use { fos ->
                        val buffer = ByteArray(bufferSize)
                        var lastEmitTime = 0L
                        while (isRecordingWav) {
                            val read = recorder.read(buffer, 0, buffer.size)
                            if (read > 0) {
                                fos.write(buffer, 0, read)
                                totalBytesWritten += read
                                val now = System.currentTimeMillis()
                                if (now - lastEmitTime > 100) {
                                    lastEmitTime = now
                                    var sum = 0.0
                                    val shortsCount = read / 2
                                    for (si in 0 until shortsCount) {
                                        val sample = ((buffer[si * 2 + 1].toInt() shl 8) or (buffer[si * 2].toInt() and 0xFF)).toShort()
                                        sum += sample * sample
                                    }
                                    val rms = if (shortsCount > 0) Math.sqrt(sum / shortsCount) else 0.0
                                    totalRmsSum += rms * shortsCount
                                    totalSamplesCount += shortsCount
                                    val db = if (rms > 0) 20 * Math.log10(rms / 32767.0) else -100.0
                                    val map = Arguments.createMap()
                                    map.putDouble("rmsdB", db)
                                    sendEvent("onAudioLevel", map)
                                }
                            } else if (read == AudioRecord.ERROR_INVALID_OPERATION || read == AudioRecord.ERROR_BAD_VALUE) {
                                Log.w(TAG, "[JANBHASHA][MIC] AudioRecord.read() error code: $read — stopping capture")
                                break
                            }
                        }
                        fos.flush()
                    }
                    val avgRms = if (totalSamplesCount > 0) totalRmsSum / totalSamplesCount else 0.0
                    val avgDb = if (avgRms > 0) 20 * Math.log10(avgRms / 32767.0) else -100.0
                    val durationSec = totalBytesWritten.toFloat() / (sampleRate * 2)
                    Log.i(TAG, "[JANBHASHA][MIC] PCM capture complete: ${totalBytesWritten} bytes, ${String.format("%.2f", durationSec)}s, avg RMS ${String.format("%.1f", avgDb)} dBFS")
                    if (totalBytesWritten < 1600) {
                        Log.w(TAG, "[JANBHASHA][MIC][WARN] Very few PCM bytes captured (${totalBytesWritten}) — mic may not be working!")
                    }
                    writeWavHeaderAndData(tempPcm, wavFile, sampleRate, 1, 16)
                    Log.i(TAG, "[JANBHASHA][MIC] WAV written: ${wavFile.length()} bytes at ${wavFile.absolutePath}")
                    if (tempPcm.exists()) {
                        tempPcm.delete()
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "[JANBHASHA][MIC][ERROR] Audio recording stream error: ${e.message}", e)
                    // Attempt WAV write even after error — partial audio is better than nothing
                    try {
                        if (tempPcm.exists() && tempPcm.length() > 0) {
                            writeWavHeaderAndData(tempPcm, wavFile, sampleRate, 1, 16)
                            Log.w(TAG, "[JANBHASHA][MIC] WAV written from partial PCM after error: ${wavFile.length()} bytes")
                        }
                    } catch (we: Exception) {
                        Log.e(TAG, "[JANBHASHA][MIC][ERROR] WAV write-after-error also failed: ${we.message}")
                    }
                }
            }
            wavRecordingThread?.start()

            Log.i(TAG, "[JANBHASHA][MIC] Recording started: 16000Hz Mono PCM 16-bit at ${wavFile.absolutePath}")
            promise.resolve(wavFile.absolutePath)
        } catch (e: Exception) {
            Log.e(TAG, "[JANBHASHA][MIC][ERROR] startRecording error: ${e.message}", e)
            promise.reject("RECORD_START_FAILED", e.message ?: "Failed to start recording", e)
        }
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            if (!isRecordingWav) {
                Log.w(TAG, "[JANBHASHA][MIC][ERROR] stopRecording called when not recording")
                promise.reject("NOT_RECORDING", "No active recording session")
                return
            }
            stopCurrentRecording()
            val path = currentRecordingPath ?: ""
            val file = File(path)
            val doneMap = Arguments.createMap()
            doneMap.putString("path", path)
            doneMap.putDouble("fileSize", file.length().toDouble())
            sendEvent("onRecordingFinished", doneMap)

            if (file.exists() && file.length() > 44) {
                val durationSec = (file.length() - 44).toFloat() / (16000 * 2)
                Log.i(TAG, "[JANBHASHA][MIC] Recording stopped successfully: $path (${file.length()} bytes, duration: ${"%.2f".format(durationSec)}s)")
                promise.resolve(path)
            } else {
                Log.w(TAG, "[JANBHASHA][MIC][ERROR] WAV recording file is empty or missing data: ${file.length()} bytes")
                promise.resolve(path)
            }
        } catch (e: Exception) {
            Log.e(TAG, "[JANBHASHA][MIC][ERROR] stopRecording error: ${e.message}", e)
            stopCurrentRecording()
            promise.reject("RECORD_STOP_FAILED", e.message ?: "Failed to stop recording", e)
        }
    }

    /**
     * Validate a WAV file before sending to Whisper.
     * Returns: { valid, size, durationSec, headerOk, rmsDb, message }
     */
    @ReactMethod
    fun validateWavFile(filePath: String, promise: Promise) {
        try {
            val cleanPath = filePath.replace("file://", "")
            val file = File(cleanPath)
            val result = Arguments.createMap()

            if (!file.exists()) {
                result.putBoolean("valid", false)
                result.putString("message", "File does not exist: $cleanPath")
                result.putDouble("size", 0.0)
                result.putDouble("durationSec", 0.0)
                result.putBoolean("headerOk", false)
                result.putDouble("rmsDb", -100.0)
                promise.resolve(result)
                return
            }

            val size = file.length()
            result.putDouble("size", size.toDouble())

            if (size <= 44) {
                result.putBoolean("valid", false)
                result.putBoolean("headerOk", size >= 44)
                result.putString("message", "File too small (${size} bytes) — no audio captured")
                result.putDouble("durationSec", 0.0)
                result.putDouble("rmsDb", -100.0)
                promise.resolve(result)
                return
            }

            // Read and verify RIFF header
            val headerBytes = ByteArray(44)
            file.inputStream().use { it.read(headerBytes) }
            val riff = String(headerBytes, 0, 4)
            val wave = String(headerBytes, 8, 4)
            val headerOk = riff == "RIFF" && wave == "WAVE"

            // Calculate duration from PCM bytes
            val pcmBytes = size - 44
            val durationSec = pcmBytes.toFloat() / (16000 * 2)  // 16kHz, 16-bit mono

            // Sample RMS from first 1s of audio (32000 bytes = 16000 samples × 2 bytes)
            val sampleBytes = minOf(32000L, pcmBytes).toInt()
            var rmsSum = 0.0
            var samplesRead = 0
            if (sampleBytes > 0) {
                val sampleData = ByteArray(sampleBytes)
                file.inputStream().use { fis ->
                    fis.skip(44)
                    fis.read(sampleData, 0, sampleBytes)
                }
                for (i in 0 until sampleBytes / 2) {
                    val sample = ((sampleData[i * 2 + 1].toInt() shl 8) or (sampleData[i * 2].toInt() and 0xFF)).toShort()
                    rmsSum += sample.toLong() * sample.toLong()
                    samplesRead++
                }
            }
            val rms = if (samplesRead > 0) Math.sqrt(rmsSum / samplesRead) else 0.0
            val rmsDb = if (rms > 0) 20 * Math.log10(rms / 32767.0) else -100.0

            val isValid = headerOk && durationSec >= 0.1 && rmsDb > -70.0
            result.putBoolean("valid", isValid)
            result.putBoolean("headerOk", headerOk)
            result.putDouble("durationSec", durationSec.toDouble())
            result.putDouble("rmsDb", rmsDb)
            result.putString("message", if (isValid) "WAV OK: ${String.format("%.2f", durationSec)}s, RMS ${String.format("%.1f", rmsDb)} dBFS"
                else if (!headerOk) "Invalid RIFF/WAVE header"
                else if (durationSec < 0.1) "Too short (${String.format("%.2f", durationSec)}s)"
                else "Audio too quiet (${String.format("%.1f", rmsDb)} dBFS) — possible silence")

            Log.i(TAG, "[JANBHASHA][WAV] Validation: $cleanPath → valid=$isValid, ${String.format("%.2f", durationSec)}s, RMS ${String.format("%.1f", rmsDb)} dBFS")
            promise.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "[JANBHASHA][WAV] validateWavFile error: ${e.message}", e)
            promise.reject("VALIDATE_WAV_FAILED", e.message ?: "WAV validation failed", e)
        }
    }

    /**
     * Quick 1-second microphone diagnostic: records 1s of PCM and measures RMS.
     * Use this in diagnostics screen to confirm mic is physically working.
     * Returns: { rmsDb, peakDb, working, message }
     */
    @ReactMethod
    fun diagnoseMicrophone(promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val sampleRate = 16000
                val channelConfig = AudioFormat.CHANNEL_IN_MONO
                val audioFormat = AudioFormat.ENCODING_PCM_16BIT
                val minBuf = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
                val bufSize = if (minBuf > 0) maxOf(minBuf * 2, 4096) else 4096

                var rec: AudioRecord? = null
                try {
                    rec = AudioRecord(MediaRecorder.AudioSource.VOICE_RECOGNITION, sampleRate, channelConfig, audioFormat, bufSize)
                } catch (_: Exception) {}
                if (rec == null || rec.state != AudioRecord.STATE_INITIALIZED) {
                    rec?.release()
                    rec = AudioRecord(MediaRecorder.AudioSource.MIC, sampleRate, channelConfig, audioFormat, bufSize)
                }

                if (rec.state != AudioRecord.STATE_INITIALIZED) {
                    rec.release()
                    withContext(Dispatchers.Main) {
                        promise.reject("MIC_INIT_FAILED", "AudioRecord failed to initialize — check RECORD_AUDIO permission")
                    }
                    return@launch
                }

                rec.startRecording()
                val buffer = ByteArray(bufSize)
                var rmsSum = 0.0
                var peakSample = 0.0
                var totalSamples = 0
                val endTime = System.currentTimeMillis() + 1000  // 1-second test

                while (System.currentTimeMillis() < endTime) {
                    val read = rec.read(buffer, 0, buffer.size)
                    if (read > 0) {
                        for (i in 0 until read / 2) {
                            val sample = Math.abs(((buffer[i * 2 + 1].toInt() shl 8) or (buffer[i * 2].toInt() and 0xFF)).toShort().toDouble())
                            rmsSum += sample * sample
                            if (sample > peakSample) peakSample = sample
                            totalSamples++
                        }
                    }
                }
                rec.stop()
                rec.release()

                val rms = if (totalSamples > 0) Math.sqrt(rmsSum / totalSamples) else 0.0
                val rmsDb = if (rms > 0) 20 * Math.log10(rms / 32767.0) else -100.0
                val peakDb = if (peakSample > 0) 20 * Math.log10(peakSample / 32767.0) else -100.0
                val isWorking = rmsDb > -60.0  // Threshold: anything above -60 dBFS is real audio

                val resultMap = Arguments.createMap()
                resultMap.putDouble("rmsDb", rmsDb)
                resultMap.putDouble("peakDb", peakDb)
                resultMap.putBoolean("working", isWorking)
                resultMap.putString("message", if (isWorking)
                    "Microphone OK: RMS ${String.format("%.1f", rmsDb)} dBFS, Peak ${String.format("%.1f", peakDb)} dBFS"
                else
                    "Microphone silent: RMS ${String.format("%.1f", rmsDb)} dBFS — check permission or cover")

                Log.i(TAG, "[JANBHASHA][MIC-DIAG] ${resultMap.getString("message")}")
                withContext(Dispatchers.Main) {
                    promise.resolve(resultMap)
                }
            } catch (e: Exception) {
                Log.e(TAG, "[JANBHASHA][MIC-DIAG] Error: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    promise.reject("MIC_DIAG_FAILED", e.message ?: "Microphone diagnostic failed", e)
                }
            }
        }
    }

    // ----------------------------------------------------------------
    // Pipeline Orchestration Module (Strict Sequential Execution)
    // 1. Live Audio Capture -> 2. Whisper ASR -> 3. NMT -> 4. VITS TTS -> 5. Playback
    // ----------------------------------------------------------------
    @ReactMethod
    fun orchestratePipeline(audioFilePath: String, sourceLang: String, targetLang: String, promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val cleanPath = audioFilePath.replace("file://", "")
                val wavFile = File(cleanPath)
                if (!wavFile.exists() || wavFile.length() <= 44) {
                    withContext(Dispatchers.Main) {
                        promise.reject("EMPTY_AUDIO", "No recorded voice detected. Audio buffer is empty.")
                    }
                    return@launch
                }

                Log.i(TAG, "orchestratePipeline: Audio validated at $cleanPath (${wavFile.length()} bytes)")

                val resultMap = Arguments.createMap()
                resultMap.putString("audioPath", cleanPath)
                resultMap.putDouble("audioSize", wavFile.length().toDouble())
                resultMap.putString("sourceLang", sourceLang)
                resultMap.putString("targetLang", targetLang)
                resultMap.putString("status", "READY_FOR_ASR")

                withContext(Dispatchers.Main) {
                    promise.resolve(resultMap)
                }
            } catch (e: Exception) {
                Log.e(TAG, "orchestratePipeline error: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    promise.reject("PIPELINE_ERROR", e.message ?: "Pipeline orchestration failed", e)
                }
            }
        }
    }

    private fun stopCurrentRecording() {
        // Signal the recording loop to stop FIRST, before touching AudioRecord
        isRecordingWav = false

        // Stop and release AudioRecord safely
        val rec = audioRecord
        audioRecord = null
        if (rec != null) {
            try {
                // Only call stop() if actually recording — calling stop() in STOPPED state throws IllegalStateException
                if (rec.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                    rec.stop()
                }
            } catch (e: Exception) {
                Log.w(TAG, "[JANBHASHA][MIC] AudioRecord.stop() warning: ${e.message}")
            }
            try {
                rec.release()
            } catch (e: Exception) {
                Log.w(TAG, "[JANBHASHA][MIC] AudioRecord.release() warning: ${e.message}")
            }
        }

        // Wait for the WAV encoder thread to finish writing PCM + RIFF header (up to 5s)
        // This is CRITICAL — if we return before the thread writes the WAV, the file will be empty
        try {
            wavRecordingThread?.join(5000)
        } catch (e: InterruptedException) {
            Log.w(TAG, "[JANBHASHA][MIC] WAV encoder thread join interrupted: ${e.message}")
        }
        wavRecordingThread = null
    }

    private fun writeWavHeaderAndData(pcmFile: File, wavFile: File, sampleRate: Int, channels: Int, bitsPerSample: Int) {
        val totalAudioLen = if (pcmFile.exists()) pcmFile.length() else 0L
        val totalDataLen = totalAudioLen + 36
        val byteRate = sampleRate * channels * (bitsPerSample / 8)

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
        header[32] = (channels * (bitsPerSample / 8)).toByte(); header[33] = 0
        header[34] = bitsPerSample.toByte(); header[35] = 0
        header[36] = 'd'.code.toByte(); header[37] = 'a'.code.toByte(); header[38] = 't'.code.toByte(); header[39] = 'a'.code.toByte()
        header[40] = (totalAudioLen and 0xff).toByte()
        header[41] = ((totalAudioLen shr 8) and 0xff).toByte()
        header[42] = ((totalAudioLen shr 16) and 0xff).toByte()
        header[43] = ((totalAudioLen shr 24) and 0xff).toByte()

        FileOutputStream(wavFile).use { out ->
            out.write(header, 0, 44)
            if (pcmFile.exists()) {
                pcmFile.inputStream().use { input ->
                    input.copyTo(out)
                }
            }
        }
    }

    @ReactMethod
    fun playAudio(audioInput: String, promise: Promise) {
        try {
            stopCurrentPlayback()

            var targetPath = audioInput
            // If base64 audio is provided, decode to cache file
            if (!File(audioInput).exists() || audioInput.length > 500) {
                try {
                    val raw = if (audioInput.contains(",")) audioInput.substringAfter(",") else audioInput
                    val bytes = Base64.decode(raw, Base64.DEFAULT)
                    val tempFile = File(reactContext.cacheDir, "tts_play_${System.currentTimeMillis()}.wav")
                    tempFile.writeBytes(bytes)
                    targetPath = tempFile.absolutePath
                } catch (e: Exception) {
                    Log.w(TAG, "Base64 decode skipped: ${e.message}")
                }
            }

            val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
            if (audioManager != null) {
                if (currentAudioOutputMode == "speaker") {
                    audioManager.isSpeakerphoneOn = true
                } else {
                    audioManager.isSpeakerphoneOn = false
                }
            }

            val player = MediaPlayer().apply {
                val attrs = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                    .build()
                setAudioAttributes(attrs)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && audioManager != null) {
                    val devices = audioManager.getDevices(AndroidAudioManager.GET_DEVICES_OUTPUTS)
                    if (currentAudioOutputMode == "speaker") {
                        val speaker = devices.firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
                        if (speaker != null) {
                            preferredDevice = speaker
                            Log.i(TAG, "MediaPlayer preferredDevice: BUILTIN_SPEAKER")
                        }
                    } else {
                        val btDevice = devices.firstOrNull {
                            it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                            it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
                            (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && (
                                it.type == AudioDeviceInfo.TYPE_BLE_HEADSET ||
                                it.type == AudioDeviceInfo.TYPE_BLE_SPEAKER
                            ))
                        }
                        if (btDevice != null) {
                            preferredDevice = btDevice
                            Log.i(TAG, "MediaPlayer preferredDevice: ${btDevice.productName}")
                        }
                    }
                }

                val cleanTargetPath = targetPath.replace("file://", "")
                setDataSource(cleanTargetPath)
                setOnCompletionListener {
                    try { it.release() } catch (_: Exception) {}
                    mediaPlayer = null
                    promise.resolve("COMPLETED")
                }
                setOnErrorListener { mp, what, extra ->
                    try { mp.release() } catch (_: Exception) {}
                    mediaPlayer = null
                    promise.reject("PLAYBACK_ERROR", "MediaPlayer error: what=$what extra=$extra")
                    true
                }
                prepare()
                start()
            }
            mediaPlayer = player
            Log.i(TAG, "Playing audio [Mode: $currentAudioOutputMode]: $targetPath")
        } catch (e: Exception) {
            Log.e(TAG, "playAudio error: ${e.message}", e)
            promise.reject("PLAY_FAILED", e.message ?: "Playback failed", e)
        }
    }

    @ReactMethod
    fun stopAudio(promise: Promise) {
        try {
            stopCurrentPlayback()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_FAILED", e.message ?: "Failed to stop audio", e)
        }
    }

    @ReactMethod
    fun isAudioPlaying(promise: Promise) {
        try {
            val isPlaying = mediaPlayer?.isPlaying ?: false
            promise.resolve(isPlaying)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    private fun stopCurrentPlayback() {
        try {
            mediaPlayer?.let {
                if (it.isPlaying) {
                    it.stop()
                }
                it.release()
            }
        } catch (_: Exception) {}
        mediaPlayer = null
    }

    @ReactMethod
    fun getBluetoothDevices(promise: Promise) {
        try {
            val array = Arguments.createArray()
            val bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
            if (bluetoothAdapter != null && bluetoothAdapter.isEnabled) {
                try {
                    val bonded = bluetoothAdapter.bondedDevices
                    for (dev in bonded) {
                        val map = Arguments.createMap()
                        map.putString("name", dev.name ?: "Unknown Device")
                        map.putString("address", dev.address)
                        array.pushMap(map)
                    }
                } catch (se: SecurityException) {
                    Log.w(TAG, "Bluetooth permission not granted: ${se.message}")
                }
            }
            promise.resolve(array)
        } catch (e: Exception) {
            promise.resolve(Arguments.createArray())
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        } catch (_: Exception) {}
    }

    // ----------------------------------------------------------------
    // Native On-Device Offline Speech Synthesis (Android TextToSpeech)
    // ----------------------------------------------------------------
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady = false

    // Aspirate pairs: Consonant + ᱷ (U+1C77) -> Devanagari aspirated consonant
    private val olChikiAspirates = mapOf(
        "ᱠᱷ" to "ख",
        "ᱜᱷ" to "घ",
        "ᱪᱷ" to "छ",
        "ᱡᱷ" to "झ",
        "ᱴᱷ" to "ठ",
        "ᱰᱷ" to "ढ",
        "ᱛᱷ" to "थ",
        "ᱫᱷ" to "ध",
        "ᱯᱷ" to "फ",
        "ᱵᱷ" to "भ",
        "ᱲᱷ" to "ढ़"
    )

    // Single Ol Chiki consonants -> Devanagari consonants
    private val olChikiConsonants = mapOf(
        'ᱛ' to "त",   'ᱜ' to "ग",   'ᱝ' to "ं",   'ᱞ' to "ल",
        'ᱠ' to "क",   'ᱡ' to "ज",   'ᱢ' to "म",   'ᱣ' to "व",
        'ᱥ' to "स",   'ᱦ' to "ह",   'ᱧ' to "ञ",   'ᱨ' to "र",
        'ᱪ' to "च",   'ᱫ' to "द",   'ᱬ' to "ण",   'ᱭ' to "य",
        'ᱯ' to "प",   'ᱰ' to "ड",   'ᱱ' to "न",   'ᱲ' to "ड़",
        'ᱴ' to "ट",   'ᱵ' to "ब",   'ᱶ' to "ंव",  'ᱷ' to "ह"
    )

    // Independent vowels (at beginning of word or following another vowel)
    private val olChikiIndepVowels = mapOf(
        'ᱚ' to "ओ",
        'ᱟ' to "आ",
        'ᱤ' to "इ",
        'ᱩ' to "उ",
        'ᱮ' to "ए",
        'ᱳ' to "ओ"
    )

    // Dependent vowel matras (following a consonant)
    private val olChikiMatras = mapOf(
        'ᱚ' to "ो",  // Ol Chiki LA (vowel /o/ or /ɔ/), matra 'ो' gives natural acoustics
        'ᱟ' to "ा",  // LAA (vowel /a/) -> matra 'ा'
        'ᱤ' to "ि",  // LI (vowel /i/) -> matra 'ि'
        'ᱩ' to "ु",  // LU (vowel /u/) -> matra 'ु'
        'ᱮ' to "े",  // LE (vowel /e/) -> matra 'े'
        'ᱳ' to "ो"   // LO (vowel /o/) -> matra 'ो'
    )

    // Modifiers, punctuation & numerals
    private val olChikiOthers = mapOf(
        'ᱸ' to "ं",   'ᱹ' to "",    'ᱺ' to "ं",   'ᱼ' to "",    'ᱽ' to "्",   'ᱻ' to "",
        '᱾' to " । ", '᱿' to " ॥ ",
        '᱐' to "०",   '᱑' to "१",   '᱒' to "२",   '᱓' to "३",   '᱔' to "४",
        '᱕' to "५",   '᱖' to "६",   '᱗' to "७",   '᱘' to "८",   '᱙' to "९"
    )

    private fun transliterateOlChiki(input: String): String {
        val sb = StringBuilder()
        var i = 0
        val n = input.length
        var lastWasConsonant = false

        while (i < n) {
            val c = input[i]

            // 1. Check for 2-character aspirate pair (e.g. ᱠ + ᱷ -> ख)
            if (i + 1 < n) {
                val pair = "${c}${input[i + 1]}"
                val aspirate = olChikiAspirates[pair]
                if (aspirate != null) {
                    sb.append(aspirate)
                    lastWasConsonant = true
                    i += 2
                    continue
                }
            }

            // 2. Check for single consonant
            val consonant = olChikiConsonants[c]
            if (consonant != null) {
                sb.append(consonant)
                lastWasConsonant = true
                i += 1
                continue
            }

            // 3. Check for vowel (Matra if following consonant, else Independent)
            if (olChikiIndepVowels.containsKey(c)) {
                if (lastWasConsonant) {
                    val matra = olChikiMatras[c] ?: ""
                    sb.append(matra)
                } else {
                    val indep = olChikiIndepVowels[c] ?: ""
                    sb.append(indep)
                }
                lastWasConsonant = false
                i += 1
                continue
            }

            // 4. Modifiers and punctuation
            val other = olChikiOthers[c]
            if (other != null) {
                sb.append(other)
                if (c != 'ᱽ') {
                    lastWasConsonant = false
                }
                i += 1
                continue
            }

            // 5. Skip any unmapped Ol Chiki symbols (0x1C50..0x1C7F) so Android TTS never stumbles
            if (c.code in 0x1C50..0x1C7F) {
                lastWasConsonant = false
                i += 1
                continue
            }

            // 6. Any other character (whitespace, standard punctuation, English/Devanagari)
            sb.append(c)
            lastWasConsonant = false
            i += 1
        }
        return sb.toString().trim()
    }

    // Roman Santali transliteration for 100% offline fallback audio
    private val olChikiToRomanMulti = listOf(
        Pair("ᱠᱷ", "kh"), Pair("ᱜᱷ", "gh"), Pair("ᱪᱷ", "ch"), Pair("ᱡᱷ", "jh"),
        Pair("ᱴᱷ", "th"), Pair("ᱰᱷ", "dh"), Pair("ᱛᱷ", "th"), Pair("ᱫᱷ", "dh"),
        Pair("ᱯᱷ", "ph"), Pair("ᱵᱷ", "bh"), Pair("ᱲᱷ", "rh")
    )

    private val olChikiToRomanSingle = mapOf(
        'ᱚ' to "o",   'ᱛ' to "t",   'ᱜ' to "g",   'ᱝ' to "ng",  'ᱞ' to "l",
        'ᱟ' to "aa",  'ᱠ' to "k",   'ᱡ' to "j",   'ᱢ' to "m",   'ᱣ' to "w",
        'ᱤ' to "i",   'ᱥ' to "s",   'ᱦ' to "h",   'ᱧ' to "ny",  'ᱨ' to "r",
        'ᱩ' to "u",   'ᱪ' to "c",   'ᱫ' to "d",   'ᱬ' to "n",   'ᱭ' to "y",
        'ᱮ' to "e",   'ᱯ' to "p",   'ᱰ' to "d",   'ᱱ' to "n",   'ᱲ' to "r",
        'ᱳ' to "o",   'ᱴ' to "t",   'ᱵ' to "b",   'ᱶ' to "v",   'ᱷ' to "h",
        'ᱸ' to "n",   'ᱹ' to "'",   'ᱺ' to "h",   'ᱼ' to "-",   'ᱽ' to "'",
        '᱾' to ". ",  '᱿' to ". "
    )

    private fun transliterateOlChikiToRoman(input: String): String {
        val sb = StringBuilder()
        var i = 0
        val n = input.length
        while (i < n) {
            var matched = false
            for ((multi, roman) in olChikiToRomanMulti) {
                if (input.startsWith(multi, i)) {
                    sb.append(roman)
                    i += multi.length
                    matched = true
                    break
                }
            }
            if (matched) continue

            val c = input[i]
            val roman = olChikiToRomanSingle[c]
            if (roman != null) {
                sb.append(roman)
            } else {
                sb.append(c)
            }
            i += 1
        }
        return sb.toString().trim()
    }

    override fun initialize() {
        super.initialize()
        // Pre-warm TextToSpeech engine on startup so it is immediately ready
        initTtsIfNeeded {}
    }

    private var isInitializingTts = false

    private fun initTtsIfNeeded(onReady: () -> Unit) {
        if (textToSpeech != null && isTtsReady) {
            onReady()
            return
        }
        if (isInitializingTts) {
            Handler(Looper.getMainLooper()).postDelayed({
                onReady()
            }, 300)
            return
        }
        isInitializingTts = true
        Handler(Looper.getMainLooper()).post {
            try {
                textToSpeech = TextToSpeech(reactContext) { status ->
                    isInitializingTts = false
                    if (status == TextToSpeech.SUCCESS) {
                        isTtsReady = true
                        try {
                            val res = textToSpeech?.setLanguage(Locale("hi", "IN"))
                            if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                                val res2 = textToSpeech?.setLanguage(Locale("hi"))
                                if (res2 == TextToSpeech.LANG_MISSING_DATA || res2 == TextToSpeech.LANG_NOT_SUPPORTED) {
                                    textToSpeech?.setLanguage(Locale.ENGLISH)
                                }
                            }
                        } catch (le: Exception) {
                            Log.w(TAG, "TTS setLanguage exception: ${le.message}")
                        }
                        Log.i(TAG, "Native Android TextToSpeech engine initialized successfully")
                    } else {
                        Log.w(TAG, "Android TextToSpeech init status: $status")
                    }
                    onReady()
                }
            } catch (e: Exception) {
                isInitializingTts = false
                Log.e(TAG, "Failed to initialize TextToSpeech: ${e.message}")
                onReady()
            }
        }
    }

    @ReactMethod
    fun speakText(text: String, language: String, promise: Promise) {
        if (text.isBlank()) {
            promise.resolve("EMPTY_TEXT")
            return
        }

        val hasOlChiki = text.any { it.code in 0x1C50..0x1C7F }
        val isSantali = hasOlChiki || language.startsWith("sat")

        if (isSantali) {
            CoroutineScope(Dispatchers.IO).launch {
                try {
                    Log.i(TAG, "[JANBHASHA][TTS] Synthesizing authentic Santali speech with on-device VITS for '$text'")
                    withContext(Dispatchers.Main) {
                        sendEvent("onSpeechPlayStart", null)
                    }

                    val samples = vitsEngine.synthesize(text)
                    if (samples != null && samples.isNotEmpty()) {
                        withContext(Dispatchers.Main) {
                            sendEvent("onSpeechStarted", null)
                        }

                        val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
                        var preferredDev: AudioDeviceInfo? = null
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && audioManager != null) {
                            val devices = audioManager.getDevices(AndroidAudioManager.GET_DEVICES_OUTPUTS)
                            if (currentAudioOutputMode == "speaker") {
                                audioManager.isSpeakerphoneOn = true
                                preferredDev = devices.firstOrNull { it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER }
                            } else {
                                audioManager.isSpeakerphoneOn = false
                                preferredDev = devices.firstOrNull {
                                    it.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                                    it.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
                                    (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && (
                                        it.type == AudioDeviceInfo.TYPE_BLE_HEADSET ||
                                        it.type == AudioDeviceInfo.TYPE_BLE_SPEAKER
                                    ))
                                }
                            }
                        }

                        audioTrackPlayer.playFloatPcm16k(samples, preferredDev) {
                            sendEvent("onSpeechPlayDone", null)
                            promise.resolve("COMPLETED")
                        }
                        return@launch
                    } else {
                        Log.w(TAG, "[JANBHASHA][TTS] VITS synthesis returned null, falling back to Android TTS engine")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "[JANBHASHA][TTS] VITS synthesis failed: ${e.message}", e)
                }

                // Fallback to Android TTS if VITS synthesis was not possible
                withContext(Dispatchers.Main) {
                    speakViaAndroidTts(text, language, promise)
                }
            }
            return
        }

        // Non-Santali text (e.g. Hindi or English feedback)
        speakViaAndroidTts(text, language, promise)
    }

    private fun speakViaAndroidTts(text: String, language: String, promise: Promise) {
        initTtsIfNeeded {
            Handler(Looper.getMainLooper()).post {
                try {
                    val tts = textToSpeech
                    if (tts == null) {
                        promise.reject("TTS_ERROR", "TextToSpeech instance is null")
                        return@post
                    }

                    val hasOlChiki = text.any { it.code in 0x1C50..0x1C7F }

                    // Determine voice language and spoken text for 100% offline playback
                    var locResult = tts.setLanguage(Locale("hi", "IN"))
                    if (locResult == TextToSpeech.LANG_MISSING_DATA || locResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                        locResult = tts.setLanguage(Locale("hi"))
                    }

                    val spokenText: String
                    if (locResult != TextToSpeech.LANG_MISSING_DATA && locResult != TextToSpeech.LANG_NOT_SUPPORTED) {
                        // Hindi voice is installed offline: Use authentic Devanagari phonetics
                        spokenText = if (hasOlChiki) transliterateOlChiki(text) else text
                        tts.setPitch(1.0f)
                        tts.setSpeechRate(0.86f)
                        Log.i(TAG, "TTS using Hindi offline voice: '$spokenText'")
                    } else {
                        // Hindi offline voice data missing: Fallback to system default voice with Roman Santali
                        tts.setLanguage(Locale.US)
                        spokenText = if (hasOlChiki) transliterateOlChikiToRoman(text) else text
                        tts.setPitch(1.0f)
                        tts.setSpeechRate(0.88f)
                        Log.i(TAG, "TTS fallback to system default voice with Roman Santali: '$spokenText'")
                    }

                    val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
                    if (audioManager != null) {
                        audioManager.mode = AndroidAudioManager.MODE_NORMAL
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            audioManager.clearCommunicationDevice()
                        }
                        audioManager.isSpeakerphoneOn = false

                        val maxVol = audioManager.getStreamMaxVolume(AndroidAudioManager.STREAM_MUSIC)
                        val currentVol = audioManager.getStreamVolume(AndroidAudioManager.STREAM_MUSIC)
                        if (currentVol < maxVol / 2) {
                            audioManager.setStreamVolume(AndroidAudioManager.STREAM_MUSIC, (maxVol * 0.85).toInt().coerceAtLeast(1), 0)
                        }
                    }

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        val attrs = AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build()
                        tts.setAudioAttributes(attrs)
                    }

                    var isResolved = false
                    val utteranceId = "janbhasha_tts_${System.currentTimeMillis()}"
                    tts.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                        override fun onStart(id: String?) {
                            Log.i(TAG, "TTS playback started: $id")
                            sendEvent("onSpeechPlayStart", null)
                        }
                        override fun onDone(id: String?) {
                            Log.i(TAG, "TTS playback completed: $id")
                            sendEvent("onSpeechPlayDone", null)
                            if (!isResolved) {
                                isResolved = true
                                promise.resolve("COMPLETED")
                            }
                        }
                        override fun onError(id: String?) {
                            Log.w(TAG, "TTS playback warning/error: $id")
                            sendEvent("onSpeechPlayError", null)
                            if (!isResolved) {
                                isResolved = true
                                promise.resolve("COMPLETED")
                            }
                        }
                    })

                    Handler(Looper.getMainLooper()).postDelayed({
                        if (!isResolved) {
                            isResolved = true
                            promise.resolve("TIMEOUT_COMPLETED")
                        }
                    }, 8000)

                    val params = Bundle().apply {
                        putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId)
                    }
                    val res = tts.speak(spokenText, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
                    Log.i(TAG, "TTS speak result=$res [$currentAudioOutputMode] spoken='$spokenText' (original='$text')")
                    if (res != TextToSpeech.SUCCESS && !isResolved) {
                        isResolved = true
                        promise.resolve("COMPLETED")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "speakText error: ${e.message}", e)
                    promise.reject("SPEAK_FAILED", e.message ?: "Failed to speak text", e)
                }
            }
        }
    }

    @ReactMethod
    fun synthesizeVits(text: String, promise: Promise) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val cacheDir = reactContext.cacheDir
                val outFile = File(cacheDir, "vits_${System.currentTimeMillis()}.wav")
                val res = vitsEngine.synthesizeToWav(text, outFile)
                if (res != null) {
                    val map = Arguments.createMap()
                    map.putString("audioPath", res.first)
                    map.putDouble("duration", res.second.toDouble())
                    withContext(Dispatchers.Main) {
                        promise.resolve(map)
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        promise.reject("VITS_SYNTHESIS_FAILED", "Vits synthesis returned null for text")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.reject("VITS_ERROR", e.message ?: "Failed to synthesize VITS audio", e)
                }
            }
        }
    }

    @ReactMethod
    fun setTtsSpeed(speed: String, promise: Promise) {
        try {
            vitsEngine.setSpeedMode(speed)
            promise.resolve(vitsEngine.getLengthScale().toDouble())
        } catch (e: Exception) {
            promise.reject("SET_SPEED_FAILED", e.message ?: "Failed to set TTS speed", e)
        }
    }

    @ReactMethod
    fun getTtsSpeed(promise: Promise) {
        try {
            promise.resolve(vitsEngine.getLengthScale().toDouble())
        } catch (e: Exception) {
            promise.reject("GET_SPEED_FAILED", e.message ?: "Failed to get TTS speed", e)
        }
    }

    @ReactMethod
    fun checkLocalModelsStatus(promise: Promise) {
        try {
            val map = Arguments.createMap()

            // ASR check: ggml-tiny.bin
            val asrCandidates = listOf(
                File("/sdcard/Android/data/com.janbhasha/files/models/ggml-tiny.bin"),
                File("/sdcard/Janbhasha/models/ggml-tiny.bin"),
                File(reactContext.getExternalFilesDir(null), "models/ggml-tiny.bin"),
                File(reactContext.filesDir, "models/ggml-tiny.bin")
            )
            val asrFile = asrCandidates.firstOrNull { it.exists() && it.length() > 10 * 1024 * 1024 }
            val asrMap = Arguments.createMap()
            asrMap.putBoolean("ready", asrFile != null)
            asrMap.putString("path", asrFile?.absolutePath ?: "")
            asrMap.putDouble("sizeBytes", (asrFile?.length() ?: 0L).toDouble())
            map.putMap("asr", asrMap)

            // TTS check: sat_piper_model.onnx
            val ttsCandidates = listOf(
                File("/sdcard/Android/data/com.janbhasha/files/models/tts/sat_piper/sat_piper_model.onnx"),
                File("/sdcard/Janbhasha/models/tts/sat_piper/sat_piper_model.onnx"),
                File(reactContext.getExternalFilesDir(null), "models/tts/sat_piper/sat_piper_model.onnx"),
                File(reactContext.filesDir, "models/tts/sat_piper/sat_piper_model.onnx")
            )
            val ttsFile = ttsCandidates.firstOrNull { it.exists() && it.length() > 5 * 1024 * 1024 }
            val ttsMap = Arguments.createMap()
            ttsMap.putBoolean("ready", ttsFile != null)
            ttsMap.putString("path", ttsFile?.absolutePath ?: "")
            ttsMap.putDouble("sizeBytes", (ttsFile?.length() ?: 0L).toDouble())
            map.putMap("tts", ttsMap)

            // Dictionary check: fln_lexicon.sqlite
            val dictCandidates = listOf(
                File("/sdcard/Janbhasha/models/dictionary/fln_lexicon.sqlite"),
                File(reactContext.getExternalFilesDir(null), "models/dictionary/fln_lexicon.sqlite"),
                File(reactContext.filesDir, "models/dictionary/fln_lexicon.sqlite")
            )
            val dictFile = dictCandidates.firstOrNull { it.exists() && it.length() > 0 }
            val dictMap = Arguments.createMap()
            dictMap.putBoolean("ready", dictFile != null)
            dictMap.putString("path", dictFile?.absolutePath ?: "")
            map.putMap("dictionary", dictMap)

            val allReady = (asrFile != null) && (ttsFile != null)
            map.putBoolean("allReady", allReady)
            map.putBoolean("isOfflineMode", true)
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("CHECK_STATUS_FAILED", e.message ?: "Failed to check status", e)
        }
    }

    @ReactMethod
    fun stopSpeech(promise: Promise) {
        Handler(Looper.getMainLooper()).post {
            try {
                audioTrackPlayer.stop()
                textToSpeech?.stop()
                stopCurrentPlayback()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_FAILED", e.message ?: "Failed to stop speech", e)
            }
        }
    }

    @ReactMethod
    fun isTtsAvailable(promise: Promise) {
        promise.resolve(vitsEngine.isReady() || isTtsReady || textToSpeech != null)
    }

    // ----------------------------------------------------------------
    // Native On-Device Offline Speech Recognition (Android SpeechRecognizer)
    // ----------------------------------------------------------------
    private var activeSpeechRecognizer: SpeechRecognizer? = null

    @ReactMethod
    fun startSpeechRecognition(language: String, promise: Promise) {
        Handler(Looper.getMainLooper()).post {
            try {
                if (!SpeechRecognizer.isRecognitionAvailable(reactContext)) {
                    promise.reject("SPEECH_NOT_AVAILABLE", "Speech recognition unavailable on this device")
                    return@post
                }

                // Reuse existing recognizer or create new one
                var recognizer = activeSpeechRecognizer
                if (recognizer == null) {
                    // 1. Try Android 12+ (API 31+) on-device offline recognizer
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        try {
                            if (SpeechRecognizer.isOnDeviceRecognitionAvailable(reactContext)) {
                                recognizer = SpeechRecognizer.createOnDeviceSpeechRecognizer(reactContext)
                                Log.i(TAG, "Using Android OnDeviceSpeechRecognizer (100% offline)")
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "createOnDeviceSpeechRecognizer failed: ${e.message}")
                        }
                    }
                    // 2. Standard system SpeechRecognizer
                    if (recognizer == null) {
                        try {
                            recognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
                        } catch (e: Exception) {
                            Log.w(TAG, "Standard createSpeechRecognizer failed: ${e.message}")
                        }
                    }
                    // 3. Google RecognitionService fallback
                    if (recognizer == null) {
                        val googleComponent = ComponentName.unflattenFromString(
                            "com.google.android.googlequicksearchbox/com.google.android.voicesearch.serviceapi.GoogleRecognitionService"
                        )
                        if (googleComponent != null) {
                            try {
                                recognizer = SpeechRecognizer.createSpeechRecognizer(reactContext, googleComponent)
                            } catch (_: Exception) {}
                        }
                    }
                }

                if (recognizer == null) {
                    promise.reject("SPEECH_NOT_AVAILABLE", "Could not initialize SpeechRecognizer")
                    return@post
                }
                activeSpeechRecognizer = recognizer

                val langCode = if (language.startsWith("hi")) "hi-IN" else "en-IN"
                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, langCode)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, langCode)
                    putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactContext.packageName)
                    putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                    putExtra("android.speech.extra.PREFER_OFFLINE", true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra("android.speech.extra.DICTATION_MODE", true)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 3000L)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2500L)
                    putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 2000L)
                }

                var isCompleted = false
                var lastRecognizedText = ""

                // 15-second watchdog timer to avoid any indefinite hanging
                val timeoutRunnable = Runnable {
                    if (!isCompleted) {
                        isCompleted = true
                        Log.w(TAG, "SpeechRecognizer watchdog timeout reached (15s)")
                        try {
                            activeSpeechRecognizer?.stopListening()
                        } catch (_: Exception) {}
                        if (lastRecognizedText.isNotBlank()) {
                            promise.resolve(lastRecognizedText)
                        } else {
                            promise.resolve("")
                        }
                    }
                }
                Handler(Looper.getMainLooper()).postDelayed(timeoutRunnable, 15000L)

                recognizer.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        Log.i(TAG, "Native SpeechRecognizer ready")
                        val map = Arguments.createMap()
                        map.putString("status", "READY")
                        sendEvent("onSpeechReady", map)
                    }
                    override fun onBeginningOfSpeech() {
                        Log.i(TAG, "Native SpeechRecognizer speech started")
                        val map = Arguments.createMap()
                        map.putString("status", "STARTED")
                        sendEvent("onSpeechStarted", map)
                    }
                    override fun onRmsChanged(rmsdB: Float) {
                        val map = Arguments.createMap()
                        map.putDouble("rmsdB", rmsdB.toDouble())
                        sendEvent("onSpeechRmsChanged", map)
                    }
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onEndOfSpeech() {
                        Log.i(TAG, "Native SpeechRecognizer speech ended")
                        val map = Arguments.createMap()
                        map.putString("status", "ENDED")
                        sendEvent("onSpeechEnded", map)
                    }
                    override fun onError(error: Int) {
                        if (isCompleted) return
                        isCompleted = true
                        Handler(Looper.getMainLooper()).removeCallbacks(timeoutRunnable)

                        val isOfflineDisconnect = (error == 11 || // ERROR_SERVER_DISCONNECTED
                                                   error == SpeechRecognizer.ERROR_NETWORK ||
                                                   error == SpeechRecognizer.ERROR_NETWORK_TIMEOUT ||
                                                   error == SpeechRecognizer.ERROR_SERVER)

                        val err = when (error) {
                            SpeechRecognizer.ERROR_NO_MATCH -> "No speech recognized"
                            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech detected"
                            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission required"
                            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Network timeout"
                            SpeechRecognizer.ERROR_NETWORK -> "Network error"
                            SpeechRecognizer.ERROR_CLIENT -> "Speech recognizer client error"
                            11 -> "Offline speech: server disconnected"
                            else -> "Speech recognition error code: $error"
                        }
                        Log.w(TAG, "SpeechRecognizer error: $err ($error, isOfflineDisconnect=$isOfflineDisconnect)")
                        val map = Arguments.createMap()
                        map.putString("error", err)
                        map.putInt("code", error)
                        map.putBoolean("isOfflineDisconnect", isOfflineDisconnect)
                        sendEvent("onSpeechError", map)

                        if (lastRecognizedText.isNotBlank()) {
                            promise.resolve(lastRecognizedText)
                        } else if (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT || isOfflineDisconnect) {
                            // Resolve empty string gracefully on offline/timeout so app does not crash
                            promise.resolve("")
                        } else {
                            promise.reject("SPEECH_ERROR", err)
                        }
                    }
                    override fun onResults(results: Bundle?) {
                        if (isCompleted) return
                        isCompleted = true
                        Handler(Looper.getMainLooper()).removeCallbacks(timeoutRunnable)

                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val text = matches?.firstOrNull()?.trim() ?: lastRecognizedText
                        Log.i(TAG, "SpeechRecognizer transcription: '$text'")
                        val map = Arguments.createMap()
                        map.putString("transcript", text)
                        sendEvent("onSpeechResults", map)
                        promise.resolve(text)
                    }
                    override fun onPartialResults(partialResults: Bundle?) {
                        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val partial = matches?.firstOrNull()?.trim() ?: ""
                        if (partial.isNotEmpty()) {
                            lastRecognizedText = partial
                            val map = Arguments.createMap()
                            map.putString("partialText", partial)
                            sendEvent("onSpeechPartialResults", map)
                        }
                    }
                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })

                recognizer.startListening(intent)
                Log.i(TAG, "SpeechRecognizer started listening (lang: $langCode)")
            } catch (e: Exception) {
                Log.e(TAG, "startSpeechRecognition error: ${e.message}", e)
                promise.reject("START_SPEECH_FAILED", e.message ?: "Failed to start speech recognition", e)
            }
        }
    }

    @ReactMethod
    fun isSpeechRecognitionAvailable(promise: Promise) {
        try {
            val available = SpeechRecognizer.isRecognitionAvailable(reactContext)
            promise.resolve(available)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun stopSpeechRecognition(promise: Promise) {
        Handler(Looper.getMainLooper()).post {
            try {
                activeSpeechRecognizer?.stopListening()
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("STOP_SPEECH_FAILED", e.message ?: "Failed to stop speech recognition", e)
            }
        }
    }

    // ----------------------------------------------------------------
    // JNI declarations — implemented in JanbhashaJNI.cpp
    // ----------------------------------------------------------------
    private external fun nativeInitialize(
        jsiRuntimeRef: Long,
        modelsBasePath: String,
        manifestPath: String,
        cacheDir: String,
        callInvokerHolder: Any
    )

    private external fun nativeRelease()
    private external fun nativeCancelPipeline()

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        try {
            audioTrackPlayer.stop()
            vitsEngine.release()
            textToSpeech?.shutdown()
            textToSpeech = null
            activeSpeechRecognizer?.destroy()
            activeSpeechRecognizer = null
            mediaPlayer?.release()
            mediaPlayer = null
        } catch (_: Exception) {}
    }
}
