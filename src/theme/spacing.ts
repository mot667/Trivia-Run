export const spacing = {
  // Base spacing unit (4px)
  unit: 4,
  
  // Predefined spacing values
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48,  // 48px
  xxxl: 64, // 64px
  
  // Component-specific spacing
  card: {
    padding: 20,
    margin: 16,
    borderRadius: 16,
  },
  
  button: {
    padding: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginVertical: 8,
  },
  
  modal: {
    padding: 24,
    margin: 20,
    borderRadius: 20,
  },
  
  screen: {
    padding: 20,
    paddingHorizontal: 16,
  },
  
  // Touch targets
  touchTarget: {
    minHeight: 44,
    minWidth: 44,
  },
  
  // Safe areas
  safeArea: {
    top: 8,
    bottom: 16,
    horizontal: 16,
  },
} as const;

// Helper functions for spacing calculations
export const sp = (multiplier: number) => spacing.unit * multiplier;

export type Spacing = typeof spacing;