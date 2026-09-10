import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { useAppStore } from '../../store/useAppStore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNPrint from 'react-native-print';

export const WorksheetScreen: React.FC = () => {
  const { goBack } = useAppStore();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const worksheetItems = [
    { icon: '🌳', labelHindi: 'पेड़', labelSantali: 'ᱫᱟᱨᱮ', english: 'Tree' },
    { icon: '🐦', labelHindi: 'चिड़िया', labelSantali: 'ᱪᱮᱬᱮ', english: 'Bird' },
    { icon: '🐟', labelHindi: 'मछली', labelSantali: 'ᱦᱟᱹᱠᱩ', english: 'Fish' },
    { icon: '📖', labelHindi: 'किताब', labelSantali: 'ᱯᱩᱛᱷᱤ', english: 'Book' },
    { icon: '☀️', labelHindi: 'सूरज', labelSantali: 'ᱥᱤᱧ ᱪᱟᱸᱫᱚ', english: 'Sun' },
  ];

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: sans-serif; padding: 20px; color: #1E293B; }
            .header { text-align: center; border-bottom: 2px solid #1B4D3E; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { color: #1B4D3E; font-size: 24px; margin: 0; }
            .sub { color: #E06D3B; font-weight: bold; font-size: 14px; margin-top: 5px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #CBD5E1; padding: 12px; text-align: center; font-size: 16px; }
            th { background-color: #F8FAFC; color: #1B4D3E; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #64748B; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JANBHASHA PRIMARY WORKSHEET</h1>
            <div class="sub">NEP 2020 Foundational Literacy & Numeracy • Santali (Ol Chiki)</div>
          </div>
          <div class="meta">
            <div><strong>Student Name:</strong> ______________________</div>
            <div><strong>Class:</strong> Grade 1-2 &nbsp;&nbsp; <strong>Date:</strong> ___________</div>
          </div>
          <h3>Activity: Match the Pictures with their Words (चित्र मिलान)</h3>
          <table>
            <thead>
              <tr>
                <th>Picture</th>
                <th>Hindi Word</th>
                <th>Santali (Ol Chiki)</th>
                <th>Draw Line</th>
              </tr>
            </thead>
            <tbody>
              ${worksheetItems
                .map(
                  (item) => `
                <tr>
                  <td style="font-size: 26px;">${item.icon}</td>
                  <td><strong>${item.labelHindi}</strong></td>
                  <td><strong>${item.labelSantali}</strong></td>
                  <td>( &nbsp; &nbsp; &nbsp; &nbsp; )</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="footer">
            Generated offline by JANBHASHA • Empowering Mother-Tongue Learning
          </div>
        </body>
        </html>
      `;

      const options = {
        html: htmlContent,
        fileName: `Janbhasha_Worksheet_${Date.now()}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      if (file.filePath) {
        Alert.alert(
          'Worksheet Generated',
          `PDF successfully saved!\n\nFile: ${file.filePath}`,
          [
            { text: 'OK' },
            {
              text: 'Print Now',
              onPress: async () => {
                await RNPrint.print({ filePath: file.filePath });
              },
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('PDF Error', err.message || 'Could not generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Worksheet" subtitle="Match the Pictures • चित्र मिलान" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Printable Worksheet Card */}
        <View style={styles.paperCard}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>JANBHASHA Primary Worksheet</Text>
            <Text style={styles.sheetSub}>Match the Pictures • ᱪᱤᱛᱟᱹᱨ ᱢᱤᱞᱟᱹᱣ ᱢᱮ</Text>
          </View>

          <View style={styles.studentInfoRow}>
            <Text style={styles.infoLabel}>Name: <Text style={styles.infoBlank}>______________</Text></Text>
            <Text style={styles.infoLabel}>Date: <Text style={styles.infoBlank}>________</Text></Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.colHeader, { flex: 0.8 }]}>Picture</Text>
            <Text style={[styles.colHeader, { flex: 1.2 }]}>Hindi Word</Text>
            <Text style={[styles.colHeader, { flex: 1.5 }]}>Santali (Ol Chiki)</Text>
          </View>

          {worksheetItems.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={[styles.colCell, { flex: 0.8 }]}>
                <Text style={styles.itemEmoji}>{item.icon}</Text>
              </View>
              <View style={[styles.colCell, { flex: 1.2 }]}>
                <Text style={styles.hindiWord}>{item.labelHindi}</Text>
              </View>
              <View style={[styles.colCell, { flex: 1.5 }]}>
                <Text style={styles.santaliWord}>{item.labelSantali}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={handleDownloadPdf}
          disabled={isGenerating}
          activeOpacity={0.85}
        >
          {isGenerating ? (
            <ActivityIndicator color={JanbhashaTheme.colors.white} />
          ) : (
            <Text style={styles.downloadBtnText}>⬇️ Download PDF & Print</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  paperCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 20,
    elevation: 3,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    marginBottom: 24,
  },
  sheetHeader: {
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: JanbhashaTheme.colors.deepGreen,
    paddingBottom: 12,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
  sheetSub: {
    fontSize: 13,
    color: JanbhashaTheme.colors.warmOrange,
    fontWeight: '700',
    marginTop: 4,
  },
  studentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  infoBlank: {
    color: JanbhashaTheme.colors.lightText,
    fontWeight: '400',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.mutedText,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  colCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: {
    fontSize: 26,
  },
  hindiWord: {
    fontSize: 15,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  santaliWord: {
    fontSize: 18,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
  },
  downloadBtn: {
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
  },
  downloadBtnText: {
    color: JanbhashaTheme.colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
