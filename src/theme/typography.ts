import { Platform } from 'react-native';

// Font families
const fontFamily = {
  regular: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'SF Pro Display Medium',
    android: 'Roboto Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'SF Pro Display Bold',
    android: 'Roboto Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'SF Mono',
    android: 'Roboto Mono',
    default: 'monospace',
  }),
} as const;

// Font sizes
const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
  xxxxxl: 64,
} as const;

// Line heights
const lineHeight = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 26,
  xl: 28,
  xxl: 32,
  xxxl: 40,
  xxxxl: 56,
  xxxxxl: 72,
} as const;

// Typography styles
export const typography = {
  // Display styles (large numbers, stats)
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxxxl,
    lineHeight: lineHeight.xxxxxl,
    fontWeight: '700' as const,
  },
  
  displayMedium: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxxl,
    lineHeight: lineHeight.xxxxl,
    fontWeight: '700' as const,
  },
  
  displaySmall: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxxl,
    lineHeight: lineHeight.xxxl,
    fontWeight: '700' as const,
  },
  
  // Headline styles
  headlineLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    fontWeight: '600' as const,
  },
  
  headlineMedium: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: '600' as const,
  },
  
  headlineSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: '500' as const,
  },
  
  // Title styles
  titleLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: '500' as const,
  },
  
  titleMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: '500' as const,
  },
  
  titleSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '500' as const,
  },
  
  // Body styles
  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: '400' as const,
  },
  
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '400' as const,
  },
  
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '400' as const,
  },
  
  // Label styles
  labelLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '500' as const,
  },
  
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '500' as const,
  },
  
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500' as const,
  },
  
  // Monospace for stats
  monoLarge: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: '400' as const,
  },
  
  monoMedium: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: '400' as const,
  },
  
  // Button text
  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    fontWeight: '600' as const,
  },
  
  buttonLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    fontWeight: '600' as const,
  },
} as const;

export { fontFamily, fontSize, lineHeight };
export type Typography = typeof typography;