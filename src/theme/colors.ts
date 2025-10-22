export const colors = {
  // Primary brand colors
  primary: '#FC4C02', // Strava orange
  primaryLight: '#FF6B2B',
  primaryDark: '#E6430A',
  
  // Background colors (dark theme)
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2A2A2A',
  elevation: {
    level1: '#1F1F1F',
    level2: '#232323',
    level3: '#262626',
    level4: '#2A2A2A',
    level5: '#2E2E2E',
  },
  
  // Text colors
  onBackground: '#FFFFFF',
  onSurface: '#FFFFFF',
  onSurfaceVariant: '#CCCCCC',
  onPrimary: '#FFFFFF',
  
  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // Running status colors
  running: '#4CAF50',
  paused: '#FF9800',
  stopped: '#F44336',
  
  // UI element colors
  border: '#333333',
  divider: '#2A2A2A',
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // GPS status colors
  gpsGood: '#4CAF50',
  gpsMedium: '#FF9800',
  gpsPoor: '#F44336',
  
  // Trivia colors
  triviaCorrect: '#4CAF50',
  triviaIncorrect: '#F44336',
  triviaTimeout: '#FF9800',
  
  // Transparent variants
  transparent: 'transparent',
  white50: 'rgba(255, 255, 255, 0.5)',
  white10: 'rgba(255, 255, 255, 0.1)',
  black50: 'rgba(0, 0, 0, 0.5)',
} as const;

export type Colors = typeof colors;