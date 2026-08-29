import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useTheme } from '../../theme';

const { width } = Dimensions.get('window');

export function OCRScannerScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<'original' | 'translated'>('original');
  const [isScanning, setIsScanning] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const hindiText = `जल संरक्षण\n\nजल हमारे जीवन के लिए अत्यंत आवश्यक है। पानी की बचत करना हमारा कर्तव्य है। हमें जल को व्यर्थ नहीं बहाना चाहिए। वर्षा के पानी को एकत्रित करना चाहिए और पेड़ लगाकर जल स्तर को बढ़ाना चाहिए।`;

  const odiaText = `ଜଳ ସଂରକ୍ଷଣ\n\nଜଳ ଆମ ଜୀବନ ପାଇଁ ଅତ୍ୟନ୍ତ ଆବଶ୍ୟକ । ପାଣିର ସଞ୍ଚୟ କରିବା ଆମର କର୍ତ୍ତବ୍ୟ । ଆମେ ଜଳକୁ ବ୍ୟର୍ଥ ନକରି ବଞ୍ଚାଇବା ଉଚିତ । ବର୍ଷା ପାଣି ସଂଗ୍ରହ କରିବା ଏବଂ ଗଛ ଲଗାଇ ଜଳସ୍ତର ବଢ଼ାଇବା ଉଚିତ ।`;

  const handleSpeak = (text: string) => {
    Speech.stop();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      Speech.speak(text, {
        language: 'hi-IN',
        rate: 0.85,
        onDone: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const handleCapture = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]}>OCR Scan & Translate</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="flash-outline" size={20} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="image-outline" size={20} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Camera Viewfinder Mockup */}
        <View style={styles.viewfinderCard}>
          {/* Green Scanning Corners */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Book Page Graphic */}
          <View style={styles.bookPageMock}>
            <Text style={styles.bookTitle}>जल संरक्षण</Text>
            <Text style={styles.bookContent}>
              जल हमारे जीवन के लिए अत्यंत आवश्यक है। पानी की बचत करना हमारा कर्तव्य है। हमें जल को व्यर्थ नहीं बहाना चाहिए। वर्षा के पानी को एकत्रित करना चाहिए...
            </Text>
          </View>

          {/* Laser Scanning Line */}
          {isScanning && <View style={styles.laserLine} />}

          {/* Bottom Bar: Gallery, Shutter Button, Auto Detect */}
          <View style={styles.cameraControlsBar}>
            <TouchableOpacity style={styles.subIconBtn}>
              <Ionicons name="images-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCapture}
              activeOpacity={0.8}
              style={styles.shutterRing}
            >
              <View style={styles.shutterInside} />
            </TouchableOpacity>

            <View style={styles.autoDetectPill}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.autoDetectText}>Auto Detect</Text>
            </View>
          </View>
        </View>

        {/* Scan Result Tabbed Area */}
        <View style={[styles.resultCard, { backgroundColor: c.card, borderColor: c.border }]}>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              onPress={() => setActiveTab('original')}
              style={[
                styles.tabBtn,
                activeTab === 'original' && [styles.tabBtnActive, { borderBottomColor: '#2563EB' }],
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'original' ? '#2563EB' : c.textMuted },
                ]}
              >
                Original Text (Hindi)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('translated')}
              style={[
                styles.tabBtn,
                activeTab === 'translated' && [styles.tabBtnActive, { borderBottomColor: '#2563EB' }],
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === 'translated' ? '#2563EB' : c.textMuted },
                ]}
              >
                Translated (Odia)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Extracted / Translated Text Content */}
          <View style={styles.textContentArea}>
            <View style={styles.textHeaderRow}>
              <Text style={[styles.langLabel, { color: c.textMuted }]}>
                {activeTab === 'original' ? 'Hindi Devanagari' : 'Odia (ଓଡ଼ିଆ)'}
              </Text>
              <TouchableOpacity
                onPress={() => handleSpeak(activeTab === 'original' ? hindiText : odiaText)}
                style={styles.speakerBtn}
              >
                <Ionicons
                  name={isPlayingAudio ? 'pause' : 'volume-medium'}
                  size={18}
                  color="#2563EB"
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.extractedBody, { color: c.text }]}>
              {activeTab === 'original' ? hindiText : odiaText}
            </Text>
          </View>

          {/* Bottom Actions Row: Listen, Copy, Save */}
          <View style={styles.actionsBar}>
            <TouchableOpacity
              onPress={() => handleSpeak(activeTab === 'original' ? hindiText : odiaText)}
              style={styles.listenBtn}
            >
              <Ionicons name="volume-high" size={15} color="#FFFFFF" />
              <Text style={styles.listenBtnText}>Listen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.outlineBtn, { borderColor: c.border }]}>
              <Ionicons name="copy-outline" size={15} color={c.text} />
              <Text style={[styles.outlineBtnText, { color: c.text }]}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSaved(!isSaved)}
              style={[styles.outlineBtn, { borderColor: c.border }]}
            >
              <Ionicons
                name={isSaved ? 'star' : 'star-outline'}
                size={15}
                color={isSaved ? '#F59E0B' : c.text}
              />
              <Text style={[styles.outlineBtnText, { color: isSaved ? '#D97706' : c.text }]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  viewfinderCard: {
    width: '100%',
    height: 260,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#22C55E',
  },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  cornerBL: { bottom: 65, left: 16, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 65, right: 16, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },
  bookPageMock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    width: '85%',
    height: '65%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  bookContent: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 14,
  },
  laserLine: {
    position: 'absolute',
    width: '90%',
    height: 2,
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  cameraControlsBar: {
    position: 'absolute',
    bottom: 12,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subIconBtn: {
    padding: 8,
  },
  shutterRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInside: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
  },
  autoDetectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  autoDetectText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  resultCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomWidth: 2.5,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  textContentArea: {
    padding: 16,
  },
  textHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  langLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  speakerBtn: {
    padding: 4,
  },
  extractedBody: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
    minHeight: 90,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
  },
  listenBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
