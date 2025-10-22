import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { stravaService } from '../services/strava';
import { DistancePoint } from '../utils/distance';
import { generateRandomTriggerDistance } from '../utils/rng';
import { Timer } from '../utils/time';
import {
    calculateNextTriviaTrigger,
    type TriviaState,
    type TriviaTriggerConfig
} from '../utils/trivia-timing';
import { useSettingsStore } from './useSettingsStore';

export type RunStatus = 'idle' | 'running' | 'paused' | 'finished';
export type GPSStatus = 'disabled' | 'poor' | 'medium' | 'good';

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TriviaResult {
  questionId: string;
  timestamp: number;
  correct: boolean;
  selectedIndex?: number;
  timeToAnswer: number; // seconds
  timedOut: boolean;
  skipped: boolean;
  penaltySeconds: number;
}

export interface RunData {
  id: string;
  startTime: number;
  endTime?: number;
  status: RunStatus;
  elapsedSeconds: number;
  
  // GPS and distance data
  gpsPoints: DistancePoint[];
  totalDistanceMeters: number;
  smoothedDistanceMeters: number;
  currentSpeed: number; // m/s
  averageSpeed: number; // m/s
  
  // Trivia data
  triviaResults: TriviaResult[];
  totalPenaltySeconds: number;
  nextTriviaDistanceMeters: number;
  nextTriviaTimeSeconds?: number; // For time-based triggers
  activeTriviaQuestion?: TriviaQuestion;
  triviaStartTime?: number;
  
  // Stats
  maxSpeed: number; // m/s
  calories: number;
  averagePace: number; // min/km
  currentPace: number; // min/km
}

export interface RunState {
  // Current run data
  currentRun: RunData | null;
  
  // GPS status
  gpsStatus: GPSStatus;
  lastGPSUpdate: number;
  
  // Timers
  timer: Timer | null;
  
  // UI state
  showTriviaModal: boolean;
  isLocationTracking: boolean;
  
  // Actions
  startRun: (initialPosition?: { latitude: number; longitude: number }) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  finishRun: () => void;
  
  // GPS and tracking
  updateGPSPosition: (position: DistancePoint) => void;
  setGPSStatus: (status: GPSStatus) => void;
  
  // Trivia
  presentTriviaQuestion: (question: TriviaQuestion) => void;
  answerTriviaQuestion: (selectedIndex: number, timeToAnswer: number) => void;
  skipTriviaQuestion: () => void;
  timeoutTriviaQuestion: () => void;
  dismissTriviaModal: () => void;
  
  // Timer
  updateElapsedTime: (seconds: number) => void;
  
  // Reset
  resetRun: () => void;
}

const createInitialRunData = (startTime: number): RunData => {
  const settings = useSettingsStore.getState();
  
  const triviaConfig: TriviaTriggerConfig = {
    type: settings.triviaTriggerType,
    distanceMinMeters: settings.triviaDistanceMinMeters,
    distanceMaxMeters: settings.triviaDistanceMaxMeters,
    timeMinSeconds: settings.triviaTimeMinSeconds,
    timeMaxSeconds: settings.triviaTimeMaxSeconds,
    countMinQuestions: settings.triviaCountMinQuestions,
    countMaxQuestions: settings.triviaCountMaxQuestions,
    firstQuestionDelayMeters: settings.triviaFirstQuestionDelayMeters,
    enabled: settings.triviaEnabled,
  };
  
  const triviaState: TriviaState = {
    totalDistanceMeters: 0,
    elapsedSeconds: 0,
    questionsAnswered: 0,
  };
  
  const nextTriviaDistance = calculateNextTriviaTrigger(triviaConfig, triviaState, true);
  const nextTriviaTime = triviaConfig.type === 'time' 
    ? calculateNextTriviaTrigger(triviaConfig, triviaState, true)
    : undefined;
  
  return {
    id: `run_${startTime}`,
    startTime,
    status: 'running',
    elapsedSeconds: 0,
    gpsPoints: [],
    totalDistanceMeters: 0,
    smoothedDistanceMeters: 0,
    currentSpeed: 0,
    averageSpeed: 0,
    triviaResults: [],
    totalPenaltySeconds: 0,
    nextTriviaDistanceMeters: nextTriviaDistance,
    nextTriviaTimeSeconds: nextTriviaTime,
    maxSpeed: 0,
    calories: 0,
    averagePace: 0,
    currentPace: 0,
  };
};

// Helper function to get current trivia configuration
const getTriviaConfig = (): TriviaTriggerConfig => {
  const settings = useSettingsStore.getState();
  return {
    type: settings.triviaTriggerType,
    distanceMinMeters: settings.triviaDistanceMinMeters,
    distanceMaxMeters: settings.triviaDistanceMaxMeters,
    timeMinSeconds: settings.triviaTimeMinSeconds,
    timeMaxSeconds: settings.triviaTimeMaxSeconds,
    countMinQuestions: settings.triviaCountMinQuestions,
    countMaxQuestions: settings.triviaCountMaxQuestions,
    firstQuestionDelayMeters: settings.triviaFirstQuestionDelayMeters,
    enabled: settings.triviaEnabled,
  };
};

export const useRunStore = create<RunState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentRun: null,
    gpsStatus: 'disabled',
    lastGPSUpdate: 0,
    timer: null,
    showTriviaModal: false,
    isLocationTracking: false,
    
    startRun: (initialPosition) => {
      const startTime = Date.now();
      const run = createInitialRunData(startTime);
      
      // Add initial position if provided
      if (initialPosition) {
        run.gpsPoints.push({
          ...initialPosition,
          distance: 0,
          isValid: true,
          timestamp: startTime,
        });
      }
      
      // Create and start timer
      const timer = new Timer((elapsedSeconds) => {
        get().updateElapsedTime(elapsedSeconds);
      });
      timer.start();
      
      set({
        currentRun: run,
        timer,
        isLocationTracking: true,
      });
    },
    
    pauseRun: () => {
      const { currentRun, timer } = get();
      if (!currentRun || currentRun.status !== 'running') return;
      
      timer?.pause();
      
      set({
        currentRun: {
          ...currentRun,
          status: 'paused',
        },
        isLocationTracking: false,
      });
    },
    
    resumeRun: () => {
      const { currentRun, timer } = get();
      if (!currentRun || currentRun.status !== 'paused') return;
      
      timer?.resume();
      
      set({
        currentRun: {
          ...currentRun,
          status: 'running',
        },
        isLocationTracking: true,
      });
    },
    
    finishRun: () => {
      const { currentRun, timer } = get();
      if (!currentRun) return;
      
      const finalElapsedSeconds = timer?.stop() || currentRun.elapsedSeconds;
      const endTime = Date.now();
      
      const finishedRun = {
        ...currentRun,
        status: 'finished' as const,
        endTime,
        elapsedSeconds: finalElapsedSeconds,
      };
      
      set({
        currentRun: finishedRun,
        timer: null,
        isLocationTracking: false,
        showTriviaModal: false,
      });
      
      // Auto-upload to Strava if enabled
      const settings = useSettingsStore.getState();
      if (settings.autoUploadToStrava && settings.stravaConnected) {
        stravaService.uploadRun(finishedRun)
          .then(activity => {
            if (activity) {
              console.log('✅ Run automatically uploaded to Strava:', activity.id);
            } else {
              console.error('❌ Failed to upload run to Strava');
            }
          })
          .catch(error => {
            console.error('❌ Strava upload error:', error);
          });
      }
    },
    
    updateGPSPosition: (position) => {
      const { currentRun } = get();
      if (!currentRun || currentRun.status === 'finished') return;
      
      const newGpsPoints = [...currentRun.gpsPoints, position];
      const totalDistanceMeters = position.distance;
      
      // Calculate current speed (last 10 seconds of data)
      const now = Date.now();
      const recentPoints = newGpsPoints
        .filter(p => p.timestamp && p.timestamp >= now - 10000)
        .filter(p => p.isValid);
      
      let currentSpeed = 0;
      if (recentPoints.length >= 2) {
        const first = recentPoints[0];
        const last = recentPoints[recentPoints.length - 1];
        const timeDiff = ((last.timestamp || 0) - (first.timestamp || 0)) / 1000;
        const distanceDiff = last.distance - first.distance;
        if (timeDiff > 0) {
          currentSpeed = distanceDiff / timeDiff;
        }
      }
      
      // Calculate average speed
      const validPoints = newGpsPoints.filter(p => p.isValid);
      let averageSpeed = 0;
      if (validPoints.length >= 2 && currentRun.elapsedSeconds > 0) {
        averageSpeed = totalDistanceMeters / currentRun.elapsedSeconds;
      }
      
      // Update max speed
      const maxSpeed = Math.max(currentRun.maxSpeed, currentSpeed);
      
      // Calculate calories (rough estimation)
      const weightKg = 70; // TODO: Get from settings
      const timeHours = currentRun.elapsedSeconds / 3600;
      const distanceKm = totalDistanceMeters / 1000;
      const calories = Math.round(distanceKm * weightKg * 0.75); // Rough estimation
      
      // Calculate paces (min/km)
      const currentPace = currentSpeed > 0 ? (1000 / 60) / currentSpeed : 0;
      const averagePace = averageSpeed > 0 ? (1000 / 60) / averageSpeed : 0;
      
      set({
        currentRun: {
          ...currentRun,
          gpsPoints: newGpsPoints,
          totalDistanceMeters,
          smoothedDistanceMeters: totalDistanceMeters, // TODO: Implement smoothing
          currentSpeed,
          averageSpeed,
          maxSpeed,
          calories,
          currentPace,
          averagePace,
        },
        lastGPSUpdate: now,
      });
      
      // Check if we should trigger trivia
      if (
        currentRun.status === 'running' &&
        !currentRun.activeTriviaQuestion &&
        totalDistanceMeters >= currentRun.nextTriviaDistanceMeters
      ) {
        // Trivia should be triggered by the location service
        // This is just for tracking the condition
      }
    },
    
    setGPSStatus: (gpsStatus) => {
      set({ gpsStatus });
    },
    
    presentTriviaQuestion: (question) => {
      const { currentRun } = get();
      if (!currentRun) return;
      
      set({
        currentRun: {
          ...currentRun,
          activeTriviaQuestion: question,
          triviaStartTime: Date.now(),
        },
        showTriviaModal: true,
      });
    },
    
    answerTriviaQuestion: (selectedIndex, timeToAnswer) => {
      const { currentRun } = get();
      if (!currentRun?.activeTriviaQuestion) return;
      
      const settings = useSettingsStore.getState();
      const question = currentRun.activeTriviaQuestion;
      const correct = selectedIndex === question.correctIndex;
      const penaltySeconds = correct ? 0 : settings.penaltySecondsPerWrongAnswer;
      
      const result: TriviaResult = {
        questionId: question.id,
        timestamp: Date.now(),
        correct,
        selectedIndex,
        timeToAnswer,
        timedOut: false,
        skipped: false,
        penaltySeconds,
      };
      
      const triviaConfig = getTriviaConfig();
      const triviaState: TriviaState = {
        totalDistanceMeters: currentRun.totalDistanceMeters,
        elapsedSeconds: currentRun.elapsedSeconds,
        questionsAnswered: currentRun.triviaResults.length + 1,
      };
      
      const nextTriggerDistance = calculateNextTriviaTrigger(triviaConfig, triviaState, false);
      const nextTriggerTime = triviaConfig.type === 'time'
        ? calculateNextTriviaTrigger(triviaConfig, triviaState, false)
        : undefined;
      
      set({
        currentRun: {
          ...currentRun,
          triviaResults: [...currentRun.triviaResults, result],
          totalPenaltySeconds: currentRun.totalPenaltySeconds + penaltySeconds,
          nextTriviaDistanceMeters: nextTriggerDistance,
          nextTriviaTimeSeconds: nextTriggerTime,
          activeTriviaQuestion: undefined,
          triviaStartTime: undefined,
        },
        showTriviaModal: false,
      });
    },
    
    skipTriviaQuestion: () => {
      const { currentRun } = get();
      if (!currentRun?.activeTriviaQuestion) return;
      
      const question = currentRun.activeTriviaQuestion;
      const result: TriviaResult = {
        questionId: question.id,
        timestamp: Date.now(),
        correct: false,
        timeToAnswer: 0,
        timedOut: false,
        skipped: true,
        penaltySeconds: 0, // No penalty for skipping for safety
      };
      
      const nextTriggerDistance = generateRandomTriggerDistance(
        currentRun.totalDistanceMeters,
        0.1, // 100m for testing
        0.3  // 300m for testing
      );
      
      set({
        currentRun: {
          ...currentRun,
          triviaResults: [...currentRun.triviaResults, result],
          nextTriviaDistanceMeters: nextTriggerDistance,
          activeTriviaQuestion: undefined,
          triviaStartTime: undefined,
        },
        showTriviaModal: false,
      });
    },
    
    timeoutTriviaQuestion: () => {
      const { currentRun } = get();
      if (!currentRun?.activeTriviaQuestion) return;
      
      const settings = useSettingsStore.getState();
      const question = currentRun.activeTriviaQuestion;
      const penaltySeconds = settings.penaltySecondsPerWrongAnswer;
      
      const result: TriviaResult = {
        questionId: question.id,
        timestamp: Date.now(),
        correct: false,
        timeToAnswer: settings.triviaTimeoutSeconds,
        timedOut: true,
        skipped: false,
        penaltySeconds,
      };
      
      const triviaConfig = getTriviaConfig();
      const triviaState: TriviaState = {
        totalDistanceMeters: currentRun.totalDistanceMeters,
        elapsedSeconds: currentRun.elapsedSeconds,
        questionsAnswered: currentRun.triviaResults.length + 1,
      };
      
      const nextTriggerDistance = calculateNextTriviaTrigger(triviaConfig, triviaState, false);
      const nextTriggerTime = triviaConfig.type === 'time'
        ? calculateNextTriviaTrigger(triviaConfig, triviaState, false)
        : undefined;
      
      set({
        currentRun: {
          ...currentRun,
          triviaResults: [...currentRun.triviaResults, result],
          totalPenaltySeconds: currentRun.totalPenaltySeconds + penaltySeconds,
          nextTriviaDistanceMeters: nextTriggerDistance,
          nextTriviaTimeSeconds: nextTriggerTime,
          activeTriviaQuestion: undefined,
          triviaStartTime: undefined,
        },
        showTriviaModal: false,
      });
    },
    
    dismissTriviaModal: () => {
      set({ showTriviaModal: false });
    },
    
    updateElapsedTime: (elapsedSeconds) => {
      const { currentRun } = get();
      if (!currentRun) return;
      
      set({
        currentRun: {
          ...currentRun,
          elapsedSeconds,
        },
      });
    },
    
    resetRun: () => {
      const { timer } = get();
      timer?.stop();
      
      set({
        currentRun: null,
        timer: null,
        showTriviaModal: false,
        isLocationTracking: false,
        gpsStatus: 'disabled',
        lastGPSUpdate: 0,
      });
    },
  }))
);