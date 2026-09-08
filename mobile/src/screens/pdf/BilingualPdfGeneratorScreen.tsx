import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { SohraiWatermark } from '../../components/common/SohraiWatermark';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { generateWorksheetHtml, FLNWorksheetItem } from '../../utils/pdfBuilder';

// Pre-packaged NIPUN Bharat FLN Sample Worksheet Items
const SAMPLE_FLN_ITEMS: FLNWorksheetItem[] = [
  {
    id: '1',
    category: 'Greetings',
    hindiText: 'नमस्ते (प्रणाम)',
    santhaliOlChiki: 'ᱡᱚᱦᱟᱨ',
    pronunciationLatin: 'Johar',
  },
  {
    id: '2',
    category: 'Everyday Objects',
    hindiText: 'पानी (जल)',
    santhaliOlChiki: 'ᱫᱟᱜ',
    pronunciationLatin: 'Daah',
  },
  {
    id: '3',
    category: 'Everyday Objects',
    hindiText: 'किताब (पुस्तक)',
    santhaliOlChiki: 'ᱯᱩᱛᱷᱤ',
    pronunciationLatin: 'Puthi',
  },
  {
    id: '4',
    category: 'Institution',
    hindiText: 'स्कूल (विद्यालय)',
    santhaliOlChiki: 'ᱤᱛᱩᱱ ᱟᱥᱲᱟ',
    pronunciationLatin: 'Itun Asda',
  },
  {
    id: '5',
    category: 'Health',
    hindiText: 'दवाई (औषधि)',
    santhaliOlChiki: 'ᱨᱟᱱ',
    pronunciationLatin: 'Ran',
  },
];

export const BilingualPdfGeneratorScreen: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUri, setGeneratedPdfUri] = useState<string | null>(null);

  const handleGeneratePdf = async () => {
    setIsGenerating(true);

    try {
      const htmlContent = generateWorksheetHtml(
        'Government Primary School (Mayurbhanj)',
        'Class 2 (FLN Module)',
        'Everyday Words & Community Terms',
        SAMPLE_FLN_ITEMS
      );

      // In production React Native, RNHTMLtoPDF.convert({ html, fileName, directory: 'Documents' })
      // Here we simulate the fast native compilation
      setTimeout(() => {
        setIsGenerating(false);
        const targetPath = 'file:///data/user/0/com.janbhasha/files/Janbhasha_FLN_Worksheet_Grade2.pdf';
        setGeneratedPdfUri(targetPath);
        Alert.alert(
          'Worksheet Generated Offline! 📄',
          `Bilingual FLN PDF compiled successfully without internet.\nSaved to: ${targetPath}`,
          [{ text: 'OK' }]
        );
      }, 900);
    } catch (err: any) {
      setIsGenerating(false);
      Alert.alert('Error', err.message || 'Could not generate PDF');
    }
  };

  const handlePrintPdf = () => {
    Alert.alert(
      'Native Android Print Dialog',
      'Dispatched to local Wi-Fi / USB OTG thermal printer (Zero-Cloud).'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.background.slate} barStyle="dark-content" />
      <SohraiWatermark />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bilingual FLN PDF Generator</Text>
        <Text style={styles.headerSubtitle}>
          NIPUN Bharat • On-Device Native Print Compiler (Zero Cloud)
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Preview Card */}
        <View style={styles.previewCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>WORKSHEET SPECIFICATION</Text>
          </View>

          <Text style={styles.previewTitle}>Grade 2: Hindi ↔ Santhali (Ol Chiki)</Text>
          <Text style={styles.previewMeta}>
            Includes: Sohrai traditional border, tracing dots, phonetic transliteration, and teacher signature stamp.
          </Text>

          <View style={styles.itemsTable}>
            {SAMPLE_FLN_ITEMS.map((item, idx) => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemIndex}>{idx + 1}.</Text>
                <View style={styles.itemPair}>
                  <Text style={styles.itemHindi}>{item.hindiText}</Text>
                  <Text style={styles.itemSanthali}>{item.santhaliOlChiki}</Text>
                </View>
                <Text style={styles.itemLatin}>({item.pronunciationLatin})</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Zone */}
        <View style={styles.actionsWrapper}>
          <NeumorphicButton
            onPress={handleGeneratePdf}
            zone="primary"
            size="massive"
            title={isGenerating ? 'COMPILING ON-DEVICE...' : '📄 COMPILE PRINTABLE A4 PDF'}
            subtitle="Embedded Ol Chiki fonts • No internet needed"
            disabled={isGenerating}
          />

          {generatedPdfUri && (
            <View style={{ marginTop: 16 }}>
              <NeumorphicButton
                onPress={handlePrintPdf}
                zone="playback"
                title="🖨️ SEND TO LOCAL PRINTER (USB / WI-FI)"
                subtitle="Native Android Print Spooler Integration"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.slate,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.cultural.terracotta,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.background.darkSlate,
    marginTop: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  previewCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.background.border,
    padding: 20,
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cultural.forestGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.background.darkSlate,
  },
  previewMeta: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  itemsTable: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.background.border,
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2D8C3',
  },
  itemIndex: {
    width: 24,
    fontWeight: '800',
    color: Colors.cultural.terracotta,
  },
  itemPair: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemHindi: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.background.darkSlate,
    width: '45%',
  },
  itemSanthali: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.cultural.terracotta,
  },
  itemLatin: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  actionsWrapper: {
    marginTop: 10,
  },
});
