package com.janbhasha

import android.content.Context
import android.media.AudioManager as AndroidAudioManager
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.common.annotations.FrameworkAPI
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.CallInvokerHolderImpl
import java.io.File

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
    @ReactMethod
    fun installJSI(promise: Promise) {
        try {
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

            // Resolve paths for the native engine
            val filesDir = reactContext.filesDir.absolutePath
            val modelsBasePath = "$filesDir/models"
            val manifestPath   = "$filesDir/model_manifest.json"
            val cacheDir       = reactContext.cacheDir.absolutePath

            // Ensure directories exist
            File(modelsBasePath).mkdirs()
            File(cacheDir).mkdirs()

            // Install JSI on the JS thread — mandatory
            reactContext.runOnJSQueueThread {
                try {
                    nativeInitialize(
                        jsRuntime,
                        modelsBasePath,
                        manifestPath,
                        cacheDir,
                        callInvokerHolder
                    )
                    Log.i(TAG, "JSI HostObject installed: global.__janbhasha")
                    // Promise must be resolved on the JS thread
                    promise.resolve(null)
                } catch (e: Exception) {
                    Log.e(TAG, "nativeInitialize failed: ${e.message}")
                    promise.reject("INIT_FAILED", e.message ?: "Unknown error", e)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "installJSI failed: ${e.message}")
            promise.reject("INSTALL_FAILED", e.message ?: "Unknown error", e)
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
}
