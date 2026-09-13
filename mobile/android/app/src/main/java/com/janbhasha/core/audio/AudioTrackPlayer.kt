package com.janbhasha.core.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioTrack
import android.os.Build
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Low-Latency Native AudioTrack Player strictly locked to 16,000 Hz Mono.
 * Directly streams FloatArray or ShortArray PCM buffers from VITS TTS synthesis
 * to the Android audio hardware (Speaker or Bluetooth).
 */
class AudioTrackPlayer {

    companion object {
        private const val TAG = "JANBHASHA][AUDIO"
        const val SAMPLE_RATE = 16000
    }

    private var audioTrack: AudioTrack? = null
    @Volatile
    private var isPlaying = false

    /**
     * Plays a 16kHz Float PCM buffer synchronously on IO dispatcher.
     */
    suspend fun playFloatPcm16k(
        samples: FloatArray,
        preferredDevice: android.media.AudioDeviceInfo? = null,
        onCompleted: (() -> Unit)? = null
    ) = withContext(Dispatchers.IO) {
        stop()

        val minBufSize = AudioTrack.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_FLOAT
        )
        val bufferSize = maxOf(minBufSize * 2, samples.size * 4, 8192)

        val attributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
            .build()

        val format = AudioFormat.Builder()
            .setSampleRate(SAMPLE_RATE)
            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
            .setEncoding(AudioFormat.ENCODING_PCM_FLOAT)
            .build()

        try {
            audioTrack = AudioTrack(
                attributes,
                format,
                bufferSize,
                AudioTrack.MODE_STREAM,
                AudioManager.AUDIO_SESSION_ID_GENERATE
            )

            val track = audioTrack ?: run {
                Log.e(TAG, "Failed to create AudioTrack for 16kHz Float PCM")
                onCompleted?.invoke()
                return@withContext
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && preferredDevice != null) {
                track.preferredDevice = preferredDevice
                Log.i(TAG, "AudioTrack preferred device set: ${preferredDevice.productName}")
            }

            isPlaying = true
            track.play()
            Log.i(TAG, "AudioTrack playing 16kHz VITS stream (${samples.size} samples, ${samples.size / 16000f}s)...")

            // Stream samples in 2048-float chunks
            val chunkSize = 2048
            var offset = 0
            while (isPlaying && offset < samples.size) {
                val toWrite = minOf(chunkSize, samples.size - offset)
                track.write(samples, offset, toWrite, AudioTrack.WRITE_BLOCKING)
                offset += toWrite
            }

            if (isPlaying) {
                val drainMs = ((samples.size.toFloat() / SAMPLE_RATE) * 1000).toLong().coerceAtMost(3000)
                kotlinx.coroutines.delay(drainMs)
            }

            Log.i(TAG, "AudioTrack playback completed successfully")
        } catch (e: Exception) {
            Log.e(TAG, "AudioTrack playback error: ${e.message}", e)
        } finally {
            stop()
            withContext(Dispatchers.Main) {
                onCompleted?.invoke()
            }
        }
    }

    fun stop() {
        isPlaying = false
        try {
            audioTrack?.let {
                if (it.playState == AudioTrack.PLAYSTATE_PLAYING) {
                    it.stop()
                }
                it.release()
            }
        } catch (_: Exception) {}
        audioTrack = null
    }

    fun isPlaying(): Boolean = isPlaying
}
