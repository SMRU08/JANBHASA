import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export const JanbhashaHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
}) => {
  const { goBack } = useAppStore();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.sproutIcon}>
            <Text style={{ fontSize: 18 }}>🌱</Text>
          </View>
        )}

        <View style={styles.titleCol}>
          {title ? (
            <Text style={styles.titleText}>{title}</Text>
          ) : (
            <Text style={styles.brandTitle}>
              <Text style={{ color: JanbhashaTheme.colors.deepGreen }}>JAN</Text>
              <Text style={{ color: JanbhashaTheme.colors.warmOrange }}>BHASHA</Text>
            </Text>
          )}
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      </View>

      {rightAction && <View style={styles.right}>{rightAction}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: JanbhashaTheme.colors.creamBg,
    borderBottomWidth: 1,
    borderBottomColor: JanbhashaTheme.colors.subtleDivider,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: JanbhashaTheme.colors.white,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 26,
    color: JanbhashaTheme.colors.charcoalText,
    fontWeight: '700',
    marginTop: -4,
  },
  sproutIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
  },
  subtitleText: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
