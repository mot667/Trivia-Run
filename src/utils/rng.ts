/**
 * Generate a random number between min and max (inclusive)
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random element from an array
 */
export function randomFromArray<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a random boolean with optional probability
 */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Generate a random UUID-like string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Generate random trivia trigger distance based on min/max range
 */
export function generateRandomTriggerDistance(
  currentDistanceMeters: number,
  minKm: number = 0.8,
  maxKm: number = 1.6
): number {
  const randomKm = randomBetween(minKm, maxKm);
  return currentDistanceMeters + (randomKm * 1000);
}

/**
 * Generate a weighted random selection
 */
export function weightedRandom<T>(items: Array<{ item: T; weight: number }>): T | undefined {
  if (items.length === 0) return undefined;
  
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.item;
    }
  }
  
  // Fallback to last item
  return items[items.length - 1].item;
}

/**
 * Generate random seed for reproducible randomness
 */
export class SeededRandom {
  private seed: number;
  
  constructor(seed?: number) {
    this.seed = seed ?? Date.now();
  }
  
  next(): number {
    // Simple LCG algorithm
    this.seed = (this.seed * 1664525 + 1013904223) % Math.pow(2, 32);
    return this.seed / Math.pow(2, 32);
  }
  
  between(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
  
  intBetween(min: number, max: number): number {
    return Math.floor(this.between(min, max + 1));
  }
  
  fromArray<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }
}

/**
 * Generate random trivia intervals with some variation to feel more natural
 */
export function generateTriviaIntervals(
  totalDistanceKm: number,
  baseIntervalKm: number = 1.2,
  variationPercent: number = 0.3
): number[] {
  const intervals: number[] = [];
  let currentDistance = 0;
  
  while (currentDistance < totalDistanceKm) {
    const variation = randomBetween(-variationPercent, variationPercent);
    const intervalKm = baseIntervalKm * (1 + variation);
    currentDistance += intervalKm;
    
    if (currentDistance < totalDistanceKm) {
      intervals.push(currentDistance);
    }
  }
  
  return intervals;
}

/**
 * Create a probability distribution for different types of trivia
 */
export function createTriviaTypeDistribution() {
  return [
    { item: 'sports', weight: 30 },
    { item: 'science', weight: 25 },
    { item: 'history', weight: 20 },
    { item: 'geography', weight: 15 },
    { item: 'entertainment', weight: 10 },
  ];
}

/**
 * Random jitter for timing to make things feel more natural
 */
export function addRandomJitter(
  baseValue: number,
  jitterPercent: number = 0.1
): number {
  const jitter = randomBetween(-jitterPercent, jitterPercent);
  return baseValue * (1 + jitter);
}

/**
 * Generate random encouragement messages based on performance
 */
export function getRandomEncouragement(
  correctAnswers: number,
  totalAnswers: number
): string {
  const successRate = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;
  
  const highPerformance = [
    "Amazing! You're crushing this! 🔥",
    "Brilliant! Keep that momentum! ⚡",
    "Outstanding performance! 🌟",
    "You're on fire! 🏃‍♂️💨",
  ];
  
  const mediumPerformance = [
    "Good work! Keep it up! 👍",
    "Nice job! You're doing great! 🎯",
    "Solid performance! 💪",
    "Keep pushing! You've got this! 🚀",
  ];
  
  const encouragement = [
    "Don't give up! Every step counts! 🏃‍♂️",
    "You're doing awesome! 💪",
    "Keep going! You're stronger than you think! 💯",
    "One step at a time! 🦶",
  ];
  
  if (successRate >= 0.8) {
    return randomFromArray(highPerformance) || "Great job!";
  } else if (successRate >= 0.5) {
    return randomFromArray(mediumPerformance) || "Keep going!";
  } else {
    return randomFromArray(encouragement) || "You can do it!";
  }
}