import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SettingsState {
  // Units
  units: 'metric' | 'imperial';
  
  // Trivia settings
  penaltySecondsPerWrongAnswer: number;
  triviaFrequencyMinKm: number;
  triviaFrequencyMaxKm: number;
  triviaTimeoutSeconds: number;
  
  // Enhanced trivia timing options
  triviaTriggerType: 'distance' | 'time' | 'count';
  triviaDistanceMinMeters: number;
  triviaDistanceMaxMeters: number;
  triviaTimeMinSeconds: number;
  triviaTimeMaxSeconds: number;
  triviaCountMinQuestions: number;
  triviaCountMaxQuestions: number;
  triviaFirstQuestionDelayMeters: number; // Delay before first question
  triviaEnabled: boolean;
  
  // Audio/haptic settings
  speechEnabled: boolean;
  hapticsEnabled: boolean;
  voiceGender: 'male' | 'female';
  speechRate: number; // 0.5 to 2.0
  
  // Auto-upload settings
  autoUploadToStrava: boolean;
  
  // User profile
  weightKg: number;
  
  // Onboarding
  hasCompletedOnboarding: boolean;
  
  // Permissions
  locationPermissionGranted: boolean;
  notificationPermissionGranted: boolean;
  
  // Display preferences
  keepScreenAwake: boolean;
  showPaceInRealTime: boolean;
  
  // Actions
  setUnits: (units: 'metric' | 'imperial') => void;
  setPenaltySeconds: (seconds: number) => void;
  setTriviaFrequency: (minKm: number, maxKm: number) => void;
  setTriviaTimeout: (seconds: number) => void;
  setTriviaTriggerType: (type: 'distance' | 'time' | 'count') => void;
  setTriviaDistanceRange: (minMeters: number, maxMeters: number) => void;
  setTriviaTimeRange: (minSeconds: number, maxSeconds: number) => void;
  setTriviaCountRange: (minQuestions: number, maxQuestions: number) => void;
  setTriviaFirstQuestionDelay: (meters: number) => void;
  setTriviaEnabled: (enabled: boolean) => void;
  setSpeechEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setVoiceSettings: (gender: 'male' | 'female', rate: number) => void;
  setAutoUploadToStrava: (enabled: boolean) => void;
  setWeightKg: (weight: number) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setLocationPermission: (granted: boolean) => void;
  setNotificationPermission: (granted: boolean) => void;
  setKeepScreenAwake: (enabled: boolean) => void;
  setShowPaceInRealTime: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: Omit<SettingsState, 'setUnits' | 'setPenaltySeconds' | 'setTriviaFrequency' | 'setTriviaTimeout' | 'setSpeechEnabled' | 'setHapticsEnabled' | 'setVoiceSettings' | 'setAutoUploadToStrava' | 'setWeightKg' | 'setOnboardingCompleted' | 'setLocationPermission' | 'setNotificationPermission' | 'setKeepScreenAwake' | 'setShowPaceInRealTime' | 'setTriviaTriggerType' | 'setTriviaDistanceRange' | 'setTriviaTimeRange' | 'setTriviaCountRange' | 'setTriviaFirstQuestionDelay' | 'setTriviaEnabled' | 'resetToDefaults'> = {
  units: 'metric',
  penaltySecondsPerWrongAnswer: 30,
  triviaFrequencyMinKm: 0.8,
  triviaFrequencyMaxKm: 1.6,
  triviaTimeoutSeconds: 30,
  
  // Enhanced trivia timing defaults
  triviaTriggerType: 'distance',
  triviaDistanceMinMeters: 800,  // 0.8km
  triviaDistanceMaxMeters: 1600, // 1.6km
  triviaTimeMinSeconds: 120,     // 2 minutes
  triviaTimeMaxSeconds: 300,     // 5 minutes
  triviaCountMinQuestions: 2,    // Every 2-4 questions for count mode
  triviaCountMaxQuestions: 4,
  triviaFirstQuestionDelayMeters: 200, // 200m before first question
  triviaEnabled: true,
  speechEnabled: true,
  hapticsEnabled: true,
  voiceGender: 'female',
  speechRate: 1.0,
  autoUploadToStrava: false,
  weightKg: 70,
  hasCompletedOnboarding: false,
  locationPermissionGranted: false,
  notificationPermissionGranted: false,
  keepScreenAwake: true,
  showPaceInRealTime: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      setUnits: (units) => set({ units }),
      
      setPenaltySeconds: (penaltySecondsPerWrongAnswer) => 
        set({ penaltySecondsPerWrongAnswer }),
      
      setTriviaFrequency: (triviaFrequencyMinKm, triviaFrequencyMaxKm) => 
        set({ triviaFrequencyMinKm, triviaFrequencyMaxKm }),
      
      setTriviaTimeout: (triviaTimeoutSeconds) => 
        set({ triviaTimeoutSeconds }),
      
      setTriviaTriggerType: (triviaTriggerType) => 
        set({ triviaTriggerType }),
      
      setTriviaDistanceRange: (triviaDistanceMinMeters, triviaDistanceMaxMeters) => 
        set({ triviaDistanceMinMeters, triviaDistanceMaxMeters }),
      
      setTriviaTimeRange: (triviaTimeMinSeconds, triviaTimeMaxSeconds) => 
        set({ triviaTimeMinSeconds, triviaTimeMaxSeconds }),
      
      setTriviaCountRange: (triviaCountMinQuestions, triviaCountMaxQuestions) => 
        set({ triviaCountMinQuestions, triviaCountMaxQuestions }),
      
      setTriviaFirstQuestionDelay: (triviaFirstQuestionDelayMeters) => 
        set({ triviaFirstQuestionDelayMeters }),
      
      setTriviaEnabled: (triviaEnabled) => 
        set({ triviaEnabled }),
      
      setSpeechEnabled: (speechEnabled) => set({ speechEnabled }),
      
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      
      setVoiceSettings: (voiceGender, speechRate) => 
        set({ voiceGender, speechRate }),
      
      setAutoUploadToStrava: (autoUploadToStrava) => 
        set({ autoUploadToStrava }),
      
      setWeightKg: (weightKg) => set({ weightKg }),
      
      setOnboardingCompleted: (hasCompletedOnboarding) => 
        set({ hasCompletedOnboarding }),
      
      setLocationPermission: (locationPermissionGranted) => 
        set({ locationPermissionGranted }),
      
      setNotificationPermission: (notificationPermissionGranted) => 
        set({ notificationPermissionGranted }),
      
      setKeepScreenAwake: (keepScreenAwake) => 
        set({ keepScreenAwake }),
      
      setShowPaceInRealTime: (showPaceInRealTime) => 
        set({ showPaceInRealTime }),
      
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'trivia-run-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain keys
      partialize: (state) => ({
        units: state.units,
        penaltySecondsPerWrongAnswer: state.penaltySecondsPerWrongAnswer,
        triviaFrequencyMinKm: state.triviaFrequencyMinKm,
        triviaFrequencyMaxKm: state.triviaFrequencyMaxKm,
        triviaTimeoutSeconds: state.triviaTimeoutSeconds,
        triviaTriggerType: state.triviaTriggerType,
        triviaDistanceMinMeters: state.triviaDistanceMinMeters,
        triviaDistanceMaxMeters: state.triviaDistanceMaxMeters,
        triviaTimeMinSeconds: state.triviaTimeMinSeconds,
        triviaTimeMaxSeconds: state.triviaTimeMaxSeconds,
        triviaCountMinQuestions: state.triviaCountMinQuestions,
        triviaCountMaxQuestions: state.triviaCountMaxQuestions,
        triviaFirstQuestionDelayMeters: state.triviaFirstQuestionDelayMeters,
        triviaEnabled: state.triviaEnabled,
        speechEnabled: state.speechEnabled,
        hapticsEnabled: state.hapticsEnabled,
        voiceGender: state.voiceGender,
        speechRate: state.speechRate,
        autoUploadToStrava: state.autoUploadToStrava,
        weightKg: state.weightKg,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        keepScreenAwake: state.keepScreenAwake,
        showPaceInRealTime: state.showPaceInRealTime,
      }),
    }
  )
);