/**
 * Janbhasha Spacing & Touch Target Specifications
 * Strictly enforces accessibility standards (>= 48dp minimum touch target; >= 64-96dp for primary classroom controls).
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,

  // Touch Target Accessibility Bounds
  touchTarget: {
    min: 48,          // Minimum standard accessibility target (WCAG 2.5.5)
    comfort: 64,      // Standard classroom action button height
    massive: 96,      // Live classroom microphone / stop button height
  },

  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    pill: 999,
  },
};
