package com.janbhasha

import android.content.Context
import android.content.Intent
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
import android.speech.SpeechRecognizer
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import java.util.Locale
import java.io.File
import java.io.FileOutputStream

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
        Log.i(TAG, "Using internal storage models: ${internalModels.absolutePath}")
        return internalModels
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
    private var audioRecord: AudioRecord? = null
    private var isRecordingWav = false
    private var wavRecordingThread: Thread? = null
    private var currentRecordingPath: String? = null
    private var mediaPlayer: MediaPlayer? = null

    @ReactMethod
    fun startRecording(promise: Promise) {
        try {
            stopCurrentRecording()
            val cacheDir = reactContext.cacheDir
            val wavFile = File(cacheDir, "recorded_mic_${System.currentTimeMillis()}.wav")
            currentRecordingPath = wavFile.absolutePath

            val sampleRate = 16000
            val channelConfig = AudioFormat.CHANNEL_IN_MONO
            val audioFormat = AudioFormat.ENCODING_PCM_16BIT
            val minBuf = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)
            val bufferSize = if (minBuf > 0) minBuf * 2 else 4096

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

            wavRecordingThread = Thread {
                val tempPcm = File(cacheDir, "temp_stream_${System.currentTimeMillis()}.pcm")
                try {
                    FileOutputStream(tempPcm).use { fos ->
                        val buffer = ByteArray(bufferSize)
                        while (isRecordingWav) {
                            val read = recorder.read(buffer, 0, buffer.size)
                            if (read > 0) {
                                fos.write(buffer, 0, read)
                            }
                        }
                    }
                    writeWavHeaderAndData(tempPcm, wavFile, sampleRate, 1, 16)
                    tempPcm.delete()
                    Log.i(TAG, "Standard 16kHz RIFF WAV generated: ${wavFile.length()} bytes")
                } catch (e: Exception) {
                    Log.e(TAG, "Audio recording stream error: ${e.message}", e)
                }
            }
            wavRecordingThread?.start()

            Log.i(TAG, "Native 16kHz WAV recording started: ${wavFile.absolutePath}")
            promise.resolve(wavFile.absolutePath)
        } catch (e: Exception) {
            Log.e(TAG, "startRecording error: ${e.message}", e)
            promise.reject("RECORD_START_FAILED", e.message ?: "Failed to start recording", e)
        }
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        try {
            if (!isRecordingWav) {
                promise.reject("NOT_RECORDING", "No active recording session")
                return
            }
            stopCurrentRecording()
            val path = currentRecordingPath ?: ""
            val file = File(path)
            if (file.exists() && file.length() > 44) {
                Log.i(TAG, "Native 16kHz WAV recording finalized: $path (${file.length()} bytes)")
                promise.resolve(path)
            } else {
                Log.w(TAG, "WAV recording file is empty or too short: ${file.length()} bytes")
                promise.resolve(path)
            }
        } catch (e: Exception) {
            Log.e(TAG, "stopRecording error: ${e.message}", e)
            stopCurrentRecording()
            promise.reject("RECORD_STOP_FAILED", e.message ?: "Failed to stop recording", e)
        }
    }

    private fun stopCurrentRecording() {
        try {
            isRecordingWav = false
            audioRecord?.let {
                if (it.recordingState == AudioRecord.RECORDSTATE_RECORDING) {
                    it.stop()
                }
                it.release()
            }
            audioRecord = null
            // Ensure background WAV encoder completes writing the 44-byte RIFF header and payload
            wavRecordingThread?.join(2500)
            wavRecordingThread = null
        } catch (_: Exception) {}
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

                setDataSource(targetPath)
                setOnCompletionListener {
                    it.release()
                    mediaPlayer = null
                    promise.resolve("COMPLETED")
                }
                setOnErrorListener { _, what, extra ->
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

    // ----------------------------------------------------------------
    // Native On-Device Offline Speech Synthesis (Android TextToSpeech)
    // ----------------------------------------------------------------
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady = false

    private val olChikiMap = mapOf(
        'ᱚ' to "a",   'ᱛ' to "t",   'ᱜ' to "g",   'ᱝ' to "ng",  'ᱞ' to "l",
        'ᱟ' to "aa",  'ᱠ' to "k",   'ᱡ' to "j",   'ᱢ' to "m",   'ᱣ' to "w",
        'ᱤ' to "i",   'ᱥ' to "s",   'ᱦ' to "h",   'ᱧ' to "ny",  'ᱨ' to "r",
        'ᱩ' to "u",   'ᱪ' to "c",   'ᱫ' to "d",   'ᱬ' to "n",   'ᱭ' to "y",
        'ᱮ' to "e",   'ᱯ' to "p",   'ᱰ' to "d",   'ᱱ' to "n",   'ᱲ' to "r",
        'ᱳ' to "o",   'ᱴ' to "t",   'ᱵ' to "b",   'ᱶ' to "v",   'ᱷ' to "h",
        'ᱸ' to "n",   'ᱹ' to "'",   'ᱺ' to "h",   'ᱼ' to "-",   'ᱽ' to "'",
        '᱾' to ".",   '᱿' to ".",
        '᱐' to "0",   '᱑' to "1",   '᱒' to "2",   '᱓' to "3",   '᱔' to "4",
        '᱕' to "5",   '᱖' to "6",   '᱗' to "7",   '᱘' to "8",   '᱙' to "9"
    )

    private fun transliterateOlChiki(input: String): String {
        val sb = StringBuilder()
        for (c in input) {
            val mapped = olChikiMap[c]
            if (mapped != null) {
                sb.append(mapped)
            } else {
                sb.append(c)
            }
        }
        return sb.toString()
    }

    private fun initTtsIfNeeded(onReady: () -> Unit) {
        if (textToSpeech != null && isTtsReady) {
            onReady()
            return
        }
        Handler(Looper.getMainLooper()).post {
            try {
                textToSpeech = TextToSpeech(reactContext) { status ->
                    if (status == TextToSpeech.SUCCESS) {
                        isTtsReady = true
                        try {
                            val res = textToSpeech?.setLanguage(Locale("hi", "IN"))
                            if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) {
                                textToSpeech?.setLanguage(Locale.ENGLISH)
                            }
                        } catch (_: Exception) {}
                        Log.i(TAG, "Native Android TextToSpeech engine initialized")
                        onReady()
                    } else {
                        Log.w(TAG, "Android TextToSpeech init status: $status")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to initialize TextToSpeech: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun speakText(text: String, language: String, promise: Promise) {
        initTtsIfNeeded {
            Handler(Looper.getMainLooper()).post {
                try {
                    val tts = textToSpeech
                    if (tts == null) {
                        promise.reject("TTS_ERROR", "TextToSpeech instance is null")
                        return@post
                    }

                    val hasOlChiki = text.any { it.code in 0x1C50..0x1C7F }
                    val spokenText = if (hasOlChiki) transliterateOlChiki(text) else text

                    val audioManager = reactContext.getSystemService(Context.AUDIO_SERVICE) as? AndroidAudioManager
                    if (audioManager != null) {
                        audioManager.isSpeakerphoneOn = (currentAudioOutputMode == "speaker")
                    }

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        val attrs = AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                            .build()
                        tts.setAudioAttributes(attrs)
                    }

                    if (language.startsWith("hi")) {
                        tts.language = Locale("hi", "IN")
                    } else {
                        tts.language = Locale("en", "IN")
                    }

                    tts.setPitch(1.0f)
                    tts.setSpeechRate(0.92f)

                    val utteranceId = "janbhasha_tts_${System.currentTimeMillis()}"
                    val params = Bundle().apply {
                        putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, utteranceId)
                    }
                    tts.speak(spokenText, TextToSpeech.QUEUE_FLUSH, params, utteranceId)
                    Log.i(TAG, "Spoken text offline [$currentAudioOutputMode]: $spokenText")
                    promise.resolve("SPEAKING")
                } catch (e: Exception) {
                    Log.e(TAG, "speakText error: ${e.message}", e)
                    promise.reject("SPEAK_FAILED", e.message ?: "Failed to speak text", e)
                }
            }
        }
    }

    @ReactMethod
    fun stopSpeech(promise: Promise) {
        Handler(Looper.getMainLooper()).post {
            try {
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
        promise.resolve(isTtsReady || textToSpeech != null)
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

                activeSpeechRecognizer?.destroy()
                val recognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)
                activeSpeechRecognizer = recognizer

                val langCode = if (language.startsWith("hi")) "hi-IN" else "en-IN"
                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, langCode)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, langCode)
                    putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
                }

                var isCompleted = false
                recognizer.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        Log.i(TAG, "Native SpeechRecognizer ready")
                    }
                    override fun onBeginningOfSpeech() {
                        Log.i(TAG, "Native SpeechRecognizer speech started")
                    }
                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onEndOfSpeech() {
                        Log.i(TAG, "Native SpeechRecognizer speech ended")
                    }
                    override fun onError(error: Int) {
                        if (isCompleted) return
                        isCompleted = true
                        val err = when (error) {
                            SpeechRecognizer.ERROR_NO_MATCH -> "No speech recognized"
                            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech detected"
                            SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Microphone permission required"
                            else -> "Speech recognition error code: $error"
                        }
                        Log.w(TAG, "SpeechRecognizer error: $err ($error)")
                        promise.reject("SPEECH_ERROR", err)
                    }
                    override fun onResults(results: Bundle?) {
                        if (isCompleted) return
                        isCompleted = true
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        val text = matches?.firstOrNull() ?: ""
                        Log.i(TAG, "SpeechRecognizer transcription: $text")
                        promise.resolve(text)
                    }
                    override fun onPartialResults(partialResults: Bundle?) {}
                    override fun onEvent(eventType: Int, params: Bundle?) {}
                })

                recognizer.startListening(intent)
                Log.i(TAG, "SpeechRecognizer started listening (lang: $langCode, offline preferred)")
            } catch (e: Exception) {
                Log.e(TAG, "startSpeechRecognition error: ${e.message}", e)
                promise.reject("START_SPEECH_FAILED", e.message ?: "Failed to start speech recognition", e)
            }
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
            textToSpeech?.shutdown()
            textToSpeech = null
            activeSpeechRecognizer?.destroy()
            activeSpeechRecognizer = null
            mediaPlayer?.release()
            mediaPlayer = null
        } catch (_: Exception) {}
    }
}
