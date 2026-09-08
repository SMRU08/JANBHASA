/**
 * Janbhasha Lightweight Elevations
 * Avoids expensive blur filters, multi-stop gradients, and heavy drop shadows to conserve GPU on 2GB tablets.
 */

import { Platform, ViewStyle } from 'react-native';
import { Colors } from './colors';

export const Elevations: Record<'none' | 'card' | 'tactileButton' | 'activeTactile', ViewStyle> = {
  none: {
    elevation: 0,
    borderWidth: 0,
  },
  card: {
    ...Platform.select({
      android: { elevation: 2 },
      default: {
        shadowColor: Colors.background.darkSlate,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
    borderWidth: 2,
    borderColor: Colors.background.border,
  },
  tactileButton: {
    ...Platform.select({
      android: { elevation: 4 },
      default: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
    }),
    borderWidth: 3,
  },
  activeTactile: {
    elevation: 1,
    borderWidth: 3,
  },
};
