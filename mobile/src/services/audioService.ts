import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { JanbhashaModule } = NativeModules;

export interface BluetoothDevice {
  name: string;
  address: string;
  isAudio?: boolean;
}

class AudioService {
  private isCurrentlyPlaying: boolean = false;
  private isCurrentlyRecording: boolean = false;

  async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'JANBHASHA Microphone Permission',
          message: 'JANBHASHA needs access to your microphone to transcribe and translate classroom speech.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error requesting microphone permission:', err);
      return false;
    }
  }

  async requestBluetoothPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;
    if (Platform.Version >= 31) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          {
            title: 'JANBHASHA Bluetooth Permission',
            message: 'JANBHASHA needs Bluetooth permission to route synthesized Santali audio to classroom speakers.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  }

  async startRecording(): Promise<string> {
    const hasPerm = await this.requestMicrophonePermission();
    if (!hasPerm) {
      throw new Error('Microphone permission denied');
    }
    if (JanbhashaModule && typeof JanbhashaModule.startRecording === 'function') {
      this.isCurrentlyRecording = true;
      return await JanbhashaModule.startRecording();
    }
    throw new Error('Native JanbhashaModule.startRecording unavailable');
  }

  async stopRecording(): Promise<string> {
    if (JanbhashaModule && typeof JanbhashaModule.stopRecording === 'function') {
      this.isCurrentlyRecording = false;
      return await JanbhashaModule.stopRecording();
    }
    this.isCurrentlyRecording = false;
    throw new Error('Native JanbhashaModule.stopRecording unavailable');
  }

  async playAudio(audioInput: string, textFallback?: string, language: string = 'sat_Olck'): Promise<string> {
    if (!audioInput) {
      if (textFallback) {
        await this.speakText(textFallback, language);
        return 'SPOKEN_OFFLINE';
      }
      throw new Error('No audio input provided');
    }
    if (JanbhashaModule && typeof JanbhashaModule.playAudio === 'function') {
      this.isCurrentlyPlaying = true;
      try {
        const res = await JanbhashaModule.playAudio(audioInput);
        this.isCurrentlyPlaying = false;
        return res;
      } catch (err) {
        this.isCurrentlyPlaying = false;
        if (textFallback) {
          await this.speakText(textFallback, language);
          return 'SPOKEN_OFFLINE';
        }
        throw err;
      }
    }
    if (textFallback) {
      await this.speakText(textFallback, language);
      return 'SPOKEN_OFFLINE';
    }
    throw new Error('Native JanbhashaModule.playAudio unavailable');
  }

  async speakText(text: string, language: string = 'sat_Olck'): Promise<boolean> {
    if (!text) return false;
    if (JanbhashaModule && typeof JanbhashaModule.speakText === 'function') {
      this.isCurrentlyPlaying = true;
      try {
        await JanbhashaModule.speakText(text, language);
        this.isCurrentlyPlaying = false;
        return true;
      } catch (err) {
        this.isCurrentlyPlaying = false;
        console.warn('speakText error:', err);
        return false;
      }
    }
    return false;
  }

  async stopSpeech(): Promise<boolean> {
    if (JanbhashaModule && typeof JanbhashaModule.stopSpeech === 'function') {
      try {
        return await JanbhashaModule.stopSpeech();
      } catch {
        return false;
      }
    }
    return true;
  }

  async isTtsAvailable(): Promise<boolean> {
    if (JanbhashaModule && typeof JanbhashaModule.isTtsAvailable === 'function') {
      try {
        return await JanbhashaModule.isTtsAvailable();
      } catch {
        return false;
      }
    }
    return true;
  }

  async startSpeechRecognition(language: string = 'hi'): Promise<string> {
    const hasPerm = await this.requestMicrophonePermission();
    if (!hasPerm) {
      throw new Error('Microphone permission denied');
    }
    if (JanbhashaModule && typeof JanbhashaModule.startSpeechRecognition === 'function') {
      return await JanbhashaModule.startSpeechRecognition(language);
    }
    throw new Error('Native speech recognition unavailable');
  }

  async stopSpeechRecognition(): Promise<boolean> {
    if (JanbhashaModule && typeof JanbhashaModule.stopSpeechRecognition === 'function') {
      try {
        return await JanbhashaModule.stopSpeechRecognition();
      } catch {
        return false;
      }
    }
    return true;
  }

  async stopAudio(): Promise<boolean> {
    this.isCurrentlyPlaying = false;
    await this.stopSpeech();
    if (JanbhashaModule && typeof JanbhashaModule.stopAudio === 'function') {
      return await JanbhashaModule.stopAudio();
    }
    return true;
  }

  async isAudioPlaying(): Promise<boolean> {
    if (JanbhashaModule && typeof JanbhashaModule.isAudioPlaying === 'function') {
      return await JanbhashaModule.isAudioPlaying();
    }
    return this.isCurrentlyPlaying;
  }

  async getBluetoothDevices(): Promise<BluetoothDevice[]> {
    await this.requestBluetoothPermission();
    if (JanbhashaModule && typeof JanbhashaModule.getBluetoothDevices === 'function') {
      try {
        return await JanbhashaModule.getBluetoothDevices();
      } catch {
        return [];
      }
    }
    return [];
  }

  async enableBluetoothSco(): Promise<boolean> {
    if (JanbhashaModule && typeof JanbhashaModule.enableBluetoothSco === 'function') {
      try {
        return await JanbhashaModule.enableBluetoothSco();
      } catch {
        return false;
      }
    }
    return false;
  }

  async disableBluetoothSco(): Promise<boolean> {
    if (JanbhashaModule && typeof JanbhashaModule.disableBluetoothSco === 'function') {
      try {
        return await JanbhashaModule.disableBluetoothSco();
      } catch {
        return false;
      }
    }
    return false;
  }

  // ----------------------------------------------------------------
  // 2 Audio Output Modes (Device Speaker vs Bluetooth)
  // ----------------------------------------------------------------
  async setAudioOutputMode(mode: 'speaker' | 'bluetooth'): Promise<string> {
    if (JanbhashaModule && typeof JanbhashaModule.setAudioOutputMode === 'function') {
      try {
        return await JanbhashaModule.setAudioOutputMode(mode);
      } catch (err) {
        console.warn('Native setAudioOutputMode failed:', err);
      }
    }
    // Fallback if native module not compiled yet
    if (mode === 'bluetooth') {
      await this.enableBluetoothSco();
    } else {
      await this.disableBluetoothSco();
    }
    return mode;
  }

  async getAudioOutputStatus(): Promise<{
    mode: 'speaker' | 'bluetooth';
    isBluetoothConnected: boolean;
    connectedBluetoothDeviceName: string;
  }> {
    if (JanbhashaModule && typeof JanbhashaModule.getAudioOutputStatus === 'function') {
      try {
        return await JanbhashaModule.getAudioOutputStatus();
      } catch {
        // fallback
      }
    }
    return {
      mode: 'speaker',
      isBluetoothConnected: false,
      connectedBluetoothDeviceName: '',
    };
  }

  async openBluetoothSettings(): Promise<boolean> {
    if (JanbhashaModule && typeof JanbhashaModule.openBluetoothSettings === 'function') {
      try {
        return await JanbhashaModule.openBluetoothSettings();
      } catch {
        return false;
      }
    }
    return false;
  }
}

export const audioService = new AudioService();
