/**
 * Calculate pace in minutes per kilometer
 */
export function calculatePaceMinPerKm(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters <= 0 || timeSeconds <= 0) return 0;
  
  const distanceKm = distanceMeters / 1000;
  const timeMinutes = timeSeconds / 60;
  
  return timeMinutes / distanceKm;
}

/**
 * Calculate pace in minutes per mile
 */
export function calculatePaceMinPerMile(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters <= 0 || timeSeconds <= 0) return 0;
  
  const distanceMiles = distanceMeters * 0.000621371;
  const timeMinutes = timeSeconds / 60;
  
  return timeMinutes / distanceMiles;
}

/**
 * Format pace for display (e.g., "5:30", "8:45")
 */
export function formatPace(paceMinPerUnit: number): string {
  if (!isFinite(paceMinPerUnit) || paceMinPerUnit <= 0) return '--:--';
  
  const minutes = Math.floor(paceMinPerUnit);
  const seconds = Math.round((paceMinPerUnit - minutes) * 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format pace with units (e.g., "5:30 /km", "8:45 /mi")
 */
export function formatPaceWithUnits(
  distanceMeters: number, 
  timeSeconds: number, 
  unit: 'metric' | 'imperial' = 'metric'
): string {
  let pace: number;
  let unitLabel: string;
  
  if (unit === 'imperial') {
    pace = calculatePaceMinPerMile(distanceMeters, timeSeconds);
    unitLabel = '/mi';
  } else {
    pace = calculatePaceMinPerKm(distanceMeters, timeSeconds);
    unitLabel = '/km';
  }
  
  return `${formatPace(pace)} ${unitLabel}`;
}

/**
 * Calculate speed in km/h
 */
export function calculateSpeedKmh(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters <= 0 || timeSeconds <= 0) return 0;
  
  const distanceKm = distanceMeters / 1000;
  const timeHours = timeSeconds / 3600;
  
  return distanceKm / timeHours;
}

/**
 * Calculate speed in mph
 */
export function calculateSpeedMph(distanceMeters: number, timeSeconds: number): number {
  if (distanceMeters <= 0 || timeSeconds <= 0) return 0;
  
  const distanceMiles = distanceMeters * 0.000621371;
  const timeHours = timeSeconds / 3600;
  
  return distanceMiles / timeHours;
}

/**
 * Format speed for display
 */
export function formatSpeed(
  distanceMeters: number, 
  timeSeconds: number, 
  unit: 'metric' | 'imperial' = 'metric'
): string {
  let speed: number;
  let unitLabel: string;
  
  if (unit === 'imperial') {
    speed = calculateSpeedMph(distanceMeters, timeSeconds);
    unitLabel = 'mph';
  } else {
    speed = calculateSpeedKmh(distanceMeters, timeSeconds);
    unitLabel = 'km/h';
  }
  
  return `${speed.toFixed(1)} ${unitLabel}`;
}

/**
 * Convert m/s to km/h
 */
export function msToKmh(metersPerSecond: number): number {
  return metersPerSecond * 3.6;
}

/**
 * Convert m/s to mph
 */
export function msToMph(metersPerSecond: number): number {
  return metersPerSecond * 2.237;
}

/**
 * Convert km/h to pace (min/km)
 */
export function kmhToPaceMinPerKm(kmh: number): number {
  if (kmh <= 0) return 0;
  return 60 / kmh;
}

/**
 * Convert mph to pace (min/mile)
 */
export function mphToPaceMinPerMile(mph: number): number {
  if (mph <= 0) return 0;
  return 60 / mph;
}

/**
 * Calculate average pace from multiple segments
 */
export function calculateAveragePace(segments: Array<{ distance: number; time: number }>): number {
  const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
  const totalTime = segments.reduce((sum, seg) => sum + seg.time, 0);
  
  return calculatePaceMinPerKm(totalDistance, totalTime);
}

/**
 * Determine pace zone based on pace (recreational runner zones)
 */
export function getPaceZone(paceMinPerKm: number): {
  zone: string;
  description: string;
  color: string;
} {
  if (paceMinPerKm < 3.5) {
    return { zone: 'Elite', description: 'Elite pace', color: '#FF0000' };
  } else if (paceMinPerKm < 4.0) {
    return { zone: 'Fast', description: 'Fast pace', color: '#FF4500' };
  } else if (paceMinPerKm < 5.0) {
    return { zone: 'Good', description: 'Good pace', color: '#FFA500' };
  } else if (paceMinPerKm < 6.0) {
    return { zone: 'Moderate', description: 'Moderate pace', color: '#32CD32' };
  } else if (paceMinPerKm < 7.0) {
    return { zone: 'Easy', description: 'Easy pace', color: '#87CEEB' };
  } else {
    return { zone: 'Recovery', description: 'Recovery pace', color: '#D3D3D3' };
  }
}

/**
 * Predict finish time based on current pace and remaining distance
 */
export function predictFinishTime(
  currentDistanceMeters: number,
  targetDistanceMeters: number,
  currentTimeSeconds: number
): number {
  if (currentDistanceMeters <= 0 || targetDistanceMeters <= currentDistanceMeters) {
    return currentTimeSeconds;
  }
  
  const remainingDistance = targetDistanceMeters - currentDistanceMeters;
  const currentPace = calculatePaceMinPerKm(currentDistanceMeters, currentTimeSeconds);
  const remainingTimeMinutes = (remainingDistance / 1000) * currentPace;
  
  return currentTimeSeconds + (remainingTimeMinutes * 60);
}

/**
 * Calculate calories burned (rough estimation)
 * Formula: METs × weight(kg) × time(hours)
 * Running METs approximation based on pace
 */
export function calculateCalories(
  distanceMeters: number,
  timeSeconds: number,
  weightKg: number = 70 // Default average weight
): number {
  const timeHours = timeSeconds / 3600;
  const paceMinPerKm = calculatePaceMinPerKm(distanceMeters, timeSeconds);
  
  // METs estimation based on pace (rough approximation)
  let mets: number;
  if (paceMinPerKm < 4.0) {
    mets = 15.0; // Very fast
  } else if (paceMinPerKm < 5.0) {
    mets = 12.0; // Fast
  } else if (paceMinPerKm < 6.0) {
    mets = 9.0;  // Moderate
  } else if (paceMinPerKm < 7.0) {
    mets = 7.0;  // Easy
  } else {
    mets = 5.0;  // Very easy
  }
  
  return Math.round(mets * weightKg * timeHours);
}