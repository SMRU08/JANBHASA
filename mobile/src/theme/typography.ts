/**
 * Janbhasha Typography Design System
 * Scaled for rural tablet usage and multi-script legibility (Ol Chiki, Devanagari, Warang Citi, Latin).
 */

export const Typography = {
  fontFamily: {
    regular: 'System',
    olChiki: 'NotoSansOlChiki-Regular',
    olChikiBold: 'NotoSansOlChiki-Bold',
  },
  size: {
    caption: 12,
    bodySmall: 14,
    body: 16,
    bodyLarge: 18,
    titleSmall: 20,
    title: 24,
    titleLarge: 28,
    display: 34,
    olChikiDisplay: 42, // Ol Chiki requires larger line-height and size for glyph clarity
  },
  weight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    heavy: '900',
  } as const,
  lineHeight: {
    caption: 16,
    body: 22,
    bodyLarge: 26,
    title: 32,
    display: 42,
    olChikiDisplay: 52,
  },
};
