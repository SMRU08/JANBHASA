import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';

const { JanbhashaModule } = NativeModules;

export class AudioManager {
  async setAudioOutputMode(mode: 'speaker' | 'bluetooth' | 'wired'): Promise<void> {
    if (JanbhashaModule?.setAudioOutputMode) {
      try {
        await JanbhashaModule.setAudioOutputMode(mode);
      } catch (e) {
        console.warn('Native setAudioOutputMode failed:', e);
      }
    }
  }

  async openBluetoothSettings(): Promise<void> {
    if (JanbhashaModule?.openBluetoothSettings) {
      try {
        await JanbhashaModule.openBluetoothSettings();
      } catch (e) {
        console.warn('Native openBluetoothSettings failed:', e);
      }
    }
  }

  // Privacy protection: immediately wipe recorded temporary audio after inference
  async purgeTempAudio(filePath: string): Promise<void> {
    try {
      if (await RNFS.exists(filePath)) {
        await RNFS.unlink(filePath);
      }
    } catch {
      // ignore
    }
  }
}

export const audioManager = new AudioManager();
