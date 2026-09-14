package com.janbhasha.core.ai

import android.annotation.SuppressLint
import android.content.Context
import android.util.Base64
import android.util.Log
import android.webkit.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.io.File
import java.io.FileOutputStream
import kotlin.coroutines.resume

/**
 * Indic Parler-TTS Premium Engine — WebView-based.
 *
 * Architecture:
 *   Kotlin (text + speaker description)
 *     → Android WebView (Chrome 121+ WebGPU)
 *       → Transformers.js + onnxruntime-web (WASM fallback)
 *         → text_encoder_fp16.onnx + decoder_fp16.onnx + dac_44khz
 *           → PCM Float32 audio (44.1 kHz)
 *     ← Base64-encoded WAV returned to Kotlin bridge
 *   → AudioTrack / MediaPlayer playback
 *
 * Model files are served from device storage via file:// URI.
 * NO network required after model is installed.
 *
 * Limitations:
 *   - Cold-start: ~5-15 seconds (WebView + ONNX session init)
 *   - Per-sentence: ~2-8 seconds
 *   - Requires Chrome WebView 121+ (shipped on Android 10+)
 *   - Memory: ~1.2-2.0 GB peak RAM during inference
 */
class IndicParlerTtsWebEngine(private val context: Context) {

    companion object {
        private const val TAG = "JANBHASHA][PARLER_WEB"
        private const val INIT_TIMEOUT_MS = 30_000L
        private const val SYNTHESIS_TIMEOUT_MS = 60_000L
        private const val BRIDGE_NAME = "AndroidTtsBridge"
    }

    @SuppressLint("SetJavaScriptEnabled")
    private var webView: WebView? = null
    private var isInitialized = false
    private var pendingSynthesisCallback: ((String?) -> Unit)? = null

    @SuppressLint("SetJavaScriptEnabled")
    fun isReady(): Boolean = isInitialized && webView != null

    /**
     * Initialize the WebView and Parler-TTS ONNX session.
     * Must be called on Main thread (WebView requirement).
     */
    @SuppressLint("SetJavaScriptEnabled")
    suspend fun initialize(): Boolean = withContext(Dispatchers.Main) {
        if (isInitialized) return@withContext true
        Log.i(TAG, "Initializing Indic Parler-TTS WebView engine...")

        try {
            val wv = WebView(context).also { webView = it }
            wv.settings.apply {
                javaScriptEnabled = true
                allowFileAccess = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true
                domStorageEnabled = true
                cacheMode = WebSettings.LOAD_NO_CACHE
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }

            // JS → Kotlin bridge for audio and status callbacks
            wv.addJavascriptInterface(object {
                @JavascriptInterface
                fun onAudioReady(base64Wav: String) {
                    Log.i(TAG, "Parler-TTS audio ready: ${base64Wav.length} base64 chars")
                    pendingSynthesisCallback?.invoke(base64Wav)
                    pendingSynthesisCallback = null
                }

                @JavascriptInterface
                fun onError(message: String) {
                    Log.e(TAG, "Parler-TTS JS error: $message")
                    pendingSynthesisCallback?.invoke(null)
                    pendingSynthesisCallback = null
                }

                @JavascriptInterface
                fun onReady() {
                    Log.i(TAG, "Parler-TTS ONNX session ready in WebView")
                    isInitialized = true
                }

                @JavascriptInterface
                fun onLog(message: String) {
                    Log.d(TAG, "[WebView] $message")
                }
            }, BRIDGE_NAME)

            wv.webChromeClient = WebChromeClient()
            wv.webViewClient = object : WebViewClient() {
                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    Log.e(TAG, "WebView error: ${error?.description} for ${request?.url}")
                }
            }

            // Extract HTML runner to cache dir and load it
            val runnerHtml = extractRunnerHtml()
            val modelBaseUrl = getModelBaseUrl()
            wv.loadUrl("file://${runnerHtml.absolutePath}?modelBase=${modelBaseUrl}")

            Log.i(TAG, "WebView loading Parler-TTS runner...")
            // Wait for onReady callback (up to 30s)
            val ok = withTimeoutOrNull(INIT_TIMEOUT_MS) {
                while (!isInitialized) {
                    kotlinx.coroutines.delay(200)
                }
                true
            } ?: false

            if (!ok) {
                Log.e(TAG, "Parler-TTS WebView init timed out after ${INIT_TIMEOUT_MS}ms")
            }
            ok
        } catch (e: Exception) {
            Log.e(TAG, "Parler-TTS WebView init error: ${e.message}", e)
            false
        }
    }

    /**
     * Synthesize text to WAV using Indic Parler-TTS in WebView.
     * Returns GenerationResult with path to 44.1kHz WAV file.
     */
    suspend fun synthesizeToWav(
        text: String,
        speakerDescription: String,
        outputFile: File
    ): OfflineSantaliTtsEngine.GenerationResult = withContext(Dispatchers.Main) {
        val wv = webView
        if (wv == null || !isInitialized) {
            return@withContext OfflineSantaliTtsEngine.GenerationResult(
                success = false,
                errorMessage = "Parler-TTS WebView engine not initialized"
            )
        }

        val t0 = System.currentTimeMillis()
        Log.i(TAG, "Parler-TTS synthesizing: '${text.take(50)}...' with speaker: ${speakerDescription.take(60)}")

        val base64Wav = suspendCancellableCoroutine<String?> { cont ->
            pendingSynthesisCallback = { result -> cont.resume(result) }
            val escapedText = text.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ")
            val escapedDesc = speakerDescription.replace("\\", "\\\\").replace("'", "\\'")
            wv.evaluateJavascript(
                "window.synthesize('$escapedText', '$escapedDesc');",
                null
            )
        }.let { result ->
            withTimeoutOrNull(SYNTHESIS_TIMEOUT_MS) { result }
        }

        if (base64Wav == null) {
            return@withContext OfflineSantaliTtsEngine.GenerationResult(
                success = false,
                errorMessage = "Parler-TTS synthesis timed out or failed"
            )
        }

        try {
            val wavBytes = Base64.decode(base64Wav, Base64.DEFAULT)
            withContext(Dispatchers.IO) {
                FileOutputStream(outputFile).use { it.write(wavBytes) }
            }
            val durationSec = if (wavBytes.size > 44) (wavBytes.size - 44).toFloat() / (SantaliTtsConfig.PARLER_SAMPLE_RATE * 2) else 0f
            val inferenceMs = System.currentTimeMillis() - t0
            Log.i(TAG, "Parler-TTS WAV written: ${wavBytes.size} bytes, ${durationSec}s, ${inferenceMs}ms")
            OfflineSantaliTtsEngine.GenerationResult(
                success = true,
                audioFilePath = outputFile.absolutePath,
                sampleRate = SantaliTtsConfig.PARLER_SAMPLE_RATE,
                durationSec = durationSec,
                engineUsed = SantaliTtsConfig.TtsEngine.INDIC_PARLER_TTS,
                inferenceMs = inferenceMs
            )
        } catch (e: Exception) {
            Log.e(TAG, "Parler-TTS WAV write error: ${e.message}", e)
            OfflineSantaliTtsEngine.GenerationResult(
                success = false,
                errorMessage = "Parler-TTS audio decode error: ${e.message}"
            )
        }
    }

    private fun getModelBaseUrl(): String {
        val extDir = context.getExternalFilesDir(null) ?: context.filesDir
        val modelDir = File(extDir, SantaliTtsConfig.PARLER_MODEL_DIR)
        return modelDir.absolutePath
    }

    private fun extractRunnerHtml(): File {
        val htmlFile = File(context.cacheDir, "parler_tts_runner.html")
        if (!htmlFile.exists() || htmlFile.length() < 1000) {
            context.assets.open("parler_tts_runner.html").use { input ->
                FileOutputStream(htmlFile).use { output ->
                    input.copyTo(output)
                }
            }
            Log.i(TAG, "Parler-TTS runner HTML extracted to: ${htmlFile.absolutePath}")
        }
        return htmlFile
    }

    fun release() {
        try {
            webView?.destroy()
            webView = null
            isInitialized = false
            pendingSynthesisCallback = null
            Log.i(TAG, "Parler-TTS WebView released")
        } catch (_: Exception) {}
    }
}
