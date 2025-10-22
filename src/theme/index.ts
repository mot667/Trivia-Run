import { MD3DarkTheme } from 'react-native-paper';
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

// React Native Paper theme configuration
export const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryDark,
    onPrimary: colors.onPrimary,
    onPrimaryContainer: colors.onPrimary,
    background: colors.background,
    onBackground: colors.onBackground,
    surface: colors.surface,
    surfaceVariant: colors.surfaceVariant,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    error: colors.error,
    onError: colors.onPrimary,
    outline: colors.border,
    outlineVariant: colors.divider,
    elevation: {
      level0: colors.background,
      level1: colors.elevation.level1,
      level2: colors.elevation.level2,
      level3: colors.elevation.level3,
      level4: colors.elevation.level4,
      level5: colors.elevation.level5,
    },
  },
  roundness: spacing.card.borderRadius,
};

// Complete theme object
export const theme = {
  colors,
  typography,
  spacing,
  paper: paperTheme,
} as const;

export type Theme = typeof theme;

// Shadow presets
export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export default theme;