/**
 * Janbhasha Cultural Color Palette & Cognitive Action Zones
 * Inspired by Santhal Sohrai murals and terracotta art.
 * Enforces strict color-coding for cognitive clarity in low-literacy environments.
 */

export const Colors = {
  // Cultural Base Palette (Earthy, Recycled Paper & Slate)
  background: {
    slate: '#F4EFE6',         // Warm recycled paper/chalkboard slate
    surface: '#EAE3D2',        // Slightly deeper earth tone for cards
    surfaceElevated: '#FFFFFF',
    border: '#D8CBB5',
    darkSlate: '#2A2723',      // Slate text color for maximum outdoor contrast
  },

  // Cultural Identity Colors
  cultural: {
    terracotta: '#C85A32',     // Primary accent: baked earth / terracotta clay
    terracottaDark: '#A04220',
    mustard: '#E5A93C',        // Harvest mustard / marigold garland
    mustardDark: '#B88223',
    forestGreen: '#2C5E3B',    // Sal forest sacred grove
    forestGreenDark: '#1E4229',
    sohraiCharcoal: '#1A1918',  // Natural mineral soot used in wall art
    sohraiChalk: '#FAF7F0',     // Kaolin white clay for motifs
  },

  // Cognitive Action Zones (Strictly enforced across all screens)
  actionZones: {
    // Recording & Microphone Actions (TEAL)
    recording: {
      primary: '#0D9488',      // Rich Teal
      active: '#14B8A6',       // Bright pulsing Teal
      background: '#CCFBF1',   // Soft mint tint
      border: '#0F766E',
      shadow: '#042F2E',
    },
    // Audio Playback & Speaker Actions (AMBER)
    playback: {
      primary: '#D97706',      // Warm Amber / Marigold
      active: '#F59E0B',       // Bright Goldenrod
      background: '#FEF3C7',   // Light straw tint
      border: '#B45309',
      shadow: '#451A03',
    },
    // Navigation & Primary Utility (TERRACOTTA)
    primaryAction: {
      primary: '#C85A32',
      active: '#E06A3F',
      background: '#FDEEE9',
      border: '#9E3C1B',
    },
    // Success & Stamp Rewards (MOSS GREEN)
    success: {
      primary: '#15803D',
      background: '#DCFCE7',
      border: '#166534',
    },
    // Alert & Reset (RUST RED)
    danger: {
      primary: '#B91C1C',
      background: '#FEE2E2',
      border: '#991B1B',
    }
  },

  // Neumorphic / Tactile Shadows for Low-End Displays
  neumorphism: {
    lightShadow: '#FFFFFF',
    darkShadow: '#D1C5AF',
    pressedDepth: '#BEB096',
  }
} as const;
