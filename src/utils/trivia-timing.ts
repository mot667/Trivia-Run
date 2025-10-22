import { randomBetween } from './rng';

export interface TriviaTriggerConfig {
  type: 'distance' | 'time' | 'count';
  distanceMinMeters: number;
  distanceMaxMeters: number;
  timeMinSeconds: number;
  timeMaxSeconds: number;
  countMinQuestions: number;
  countMaxQuestions: number;
  firstQuestionDelayMeters: number;
  enabled: boolean;
}

export interface TriviaState {
  totalDistanceMeters: number;
  elapsedSeconds: number;
  questionsAnswered: number;
  lastTriggerDistanceMeters?: number;
  lastTriggerTimeSeconds?: number;
  lastTriggerQuestionCount?: number;
}

/**
 * Calculate the next trivia trigger based on the configured type
 */
export function calculateNextTriviaTrigger(
  config: TriviaTriggerConfig,
  currentState: TriviaState,
  isFirstQuestion: boolean = false
): number {
  if (!config.enabled) {
    return Infinity; // Never trigger if disabled
  }

  switch (config.type) {
    case 'distance':
      return calculateDistanceBasedTrigger(config, currentState, isFirstQuestion);
    
    case 'time':
      return calculateTimeBasedTrigger(config, currentState, isFirstQuestion);
    
    case 'count':
      return calculateCountBasedTrigger(config, currentState, isFirstQuestion);
    
    default:
      return calculateDistanceBasedTrigger(config, currentState, isFirstQuestion);
  }
}

/**
 * Calculate distance-based trigger (in meters from start)
 */
function calculateDistanceBasedTrigger(
  config: TriviaTriggerConfig,
  currentState: TriviaState,
  isFirstQuestion: boolean
): number {
  if (isFirstQuestion) {
    return config.firstQuestionDelayMeters;
  }

  const randomInterval = randomBetween(
    config.distanceMinMeters,
    config.distanceMaxMeters
  );
  
  return currentState.totalDistanceMeters + randomInterval;
}

/**
 * Calculate time-based trigger (in seconds from start)
 */
function calculateTimeBasedTrigger(
  config: TriviaTriggerConfig,
  currentState: TriviaState,
  isFirstQuestion: boolean
): number {
  if (isFirstQuestion) {
    // For time-based, convert the delay from meters to seconds (assume 5 m/s pace)
    const delaySeconds = config.firstQuestionDelayMeters / 5;
    return currentState.elapsedSeconds + delaySeconds;
  }

  const randomTimeInterval = randomBetween(
    config.timeMinSeconds,
    config.timeMaxSeconds
  );
  
  return currentState.elapsedSeconds + randomTimeInterval;
}

/**
 * Calculate count-based trigger (every N questions) - converted to distance
 * This provides immediate triggering for count-based mode
 */
function calculateCountBasedTrigger(
  config: TriviaTriggerConfig,
  currentState: TriviaState,
  isFirstQuestion: boolean
): number {
  if (isFirstQuestion) {
    return config.firstQuestionDelayMeters;
  }

  const randomQuestionInterval = Math.floor(randomBetween(
    config.countMinQuestions,
    config.countMaxQuestions
  ));
  
  // For count-based, trigger immediately after the interval
  if (currentState.questionsAnswered % randomQuestionInterval === 0) {
    return currentState.totalDistanceMeters; // Trigger now
  }
  
  // Otherwise, wait for next interval check
  return currentState.totalDistanceMeters + 100; // Small increment to check again soon
}

/**
 * Check if trivia should trigger now based on current state
 */
export function shouldTriggerTrivia(
  config: TriviaTriggerConfig,
  currentState: TriviaState,
  nextTriggerDistance: number,
  nextTriggerTime?: number
): boolean {
  if (!config.enabled) {
    return false;
  }

  switch (config.type) {
    case 'distance':
      return currentState.totalDistanceMeters >= nextTriggerDistance;
    
    case 'time':
      return nextTriggerTime !== undefined && currentState.elapsedSeconds >= nextTriggerTime;
    
    case 'count':
      return currentState.totalDistanceMeters >= nextTriggerDistance;
    
    default:
      return currentState.totalDistanceMeters >= nextTriggerDistance;
  }
}

/**
 * Get human-readable description of current trivia timing configuration
 */
export function getTriviaTimingDescription(config: TriviaTriggerConfig): string {
  if (!config.enabled) {
    return 'Trivia questions disabled';
  }

  switch (config.type) {
    case 'distance':
      const minKm = (config.distanceMinMeters / 1000).toFixed(1);
      const maxKm = (config.distanceMaxMeters / 1000).toFixed(1);
      return `Every ${minKm}-${maxKm} km`;
    
    case 'time':
      const minMin = Math.floor(config.timeMinSeconds / 60);
      const maxMin = Math.floor(config.timeMaxSeconds / 60);
      return `Every ${minMin}-${maxMin} minutes`;
    
    case 'count':
      if (config.countMinQuestions === config.countMaxQuestions) {
        return `Every ${config.countMinQuestions} questions`;
      }
      return `Every ${config.countMinQuestions}-${config.countMaxQuestions} questions`;
    
    default:
      return 'Unknown timing mode';
  }
}

/**
 * Validate trivia timing configuration
 */
export function validateTriviaConfig(config: TriviaTriggerConfig): string[] {
  const errors: string[] = [];

  if (config.distanceMinMeters <= 0) {
    errors.push('Minimum distance must be greater than 0');
  }
  
  if (config.distanceMaxMeters <= config.distanceMinMeters) {
    errors.push('Maximum distance must be greater than minimum distance');
  }
  
  if (config.timeMinSeconds <= 0) {
    errors.push('Minimum time must be greater than 0');
  }
  
  if (config.timeMaxSeconds <= config.timeMinSeconds) {
    errors.push('Maximum time must be greater than minimum time');
  }
  
  if (config.countMinQuestions <= 0) {
    errors.push('Minimum question count must be greater than 0');
  }
  
  if (config.countMaxQuestions < config.countMinQuestions) {
    errors.push('Maximum question count must be greater than or equal to minimum');
  }
  
  if (config.firstQuestionDelayMeters < 0) {
    errors.push('First question delay cannot be negative');
  }

  return errors;
}

/**
 * Create preset configurations for common use cases
 */
export const TRIVIA_TIMING_PRESETS = {
  beginner: {
    type: 'distance' as const,
    distanceMinMeters: 1000,    // 1km
    distanceMaxMeters: 1500,    // 1.5km
    timeMinSeconds: 300,        // 5 min
    timeMaxSeconds: 450,        // 7.5 min
    countMinQuestions: 3,
    countMaxQuestions: 5,
    firstQuestionDelayMeters: 500, // 500m
    enabled: true,
  },
  
  intermediate: {
    type: 'distance' as const,
    distanceMinMeters: 800,     // 0.8km
    distanceMaxMeters: 1200,    // 1.2km
    timeMinSeconds: 180,        // 3 min
    timeMaxSeconds: 300,        // 5 min
    countMinQuestions: 2,
    countMaxQuestions: 4,
    firstQuestionDelayMeters: 300, // 300m
    enabled: true,
  },
  
  advanced: {
    type: 'distance' as const,
    distanceMinMeters: 400,     // 0.4km
    distanceMaxMeters: 800,     // 0.8km
    timeMinSeconds: 120,        // 2 min
    timeMaxSeconds: 240,        // 4 min
    countMinQuestions: 1,
    countMaxQuestions: 3,
    firstQuestionDelayMeters: 200, // 200m
    enabled: true,
  },
  
  testing: {
    type: 'distance' as const,
    distanceMinMeters: 50,      // 50m for testing
    distanceMaxMeters: 200,     // 200m for testing
    timeMinSeconds: 15,         // 15 sec
    timeMaxSeconds: 30,         // 30 sec
    countMinQuestions: 1,
    countMaxQuestions: 2,
    firstQuestionDelayMeters: 50, // 50m
    enabled: true,
  },
};