import { getDistance } from 'geolib';

export interface Coordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  timestamp?: number;
}

export interface DistancePoint extends Coordinate {
  distance: number; // cumulative distance in meters
  isValid: boolean;
}

// GPS accuracy threshold in meters
const GPS_ACCURACY_THRESHOLD = 50;
// Maximum reasonable speed change in m/s (roughly 21.6 km/h jump)
const MAX_SPEED_JUMP = 6;
// Minimum distance between points to consider (1 meter)
const MIN_DISTANCE_THRESHOLD = 1;

/**
 * Calculate distance between two coordinates using geolib
 */
export function calculateDistance(
  from: Coordinate,
  to: Coordinate
): number {
  return getDistance(from, to);
}

/**
 * Calculate cumulative distance from an array of coordinates
 */
export function calculateCumulativeDistance(coordinates: Coordinate[]): number {
  if (coordinates.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const segmentDistance = calculateDistance(coordinates[i - 1], coordinates[i]);
    totalDistance += segmentDistance;
  }
  
  return totalDistance;
}

/**
 * Filter out inaccurate GPS points based on accuracy and speed
 */
export function filterInaccuratePoints(
  newPoint: Coordinate,
  lastValidPoint?: Coordinate
): boolean {
  // Check GPS accuracy
  if (newPoint.accuracy && newPoint.accuracy > GPS_ACCURACY_THRESHOLD) {
    return false;
  }
  
  // If we have a previous point, check for unreasonable speed jumps
  if (lastValidPoint && newPoint.timestamp && lastValidPoint.timestamp) {
    const distance = calculateDistance(lastValidPoint, newPoint);
    const timeDiff = (newPoint.timestamp - lastValidPoint.timestamp) / 1000; // seconds
    
    if (timeDiff > 0) {
      const speed = distance / timeDiff; // m/s
      const lastSpeed = lastValidPoint.speed || 0;
      
      // Check for unreasonable speed jumps
      if (Math.abs(speed - lastSpeed) > MAX_SPEED_JUMP) {
        return false;
      }
    }
    
    // Ignore points that are too close to the last valid point
    if (distance < MIN_DISTANCE_THRESHOLD) {
      return false;
    }
  }
  
  return true;
}

/**
 * Process a new GPS point and return updated distance tracking
 */
export function processGPSPoint(
  newPoint: Coordinate,
  previousPoints: DistancePoint[]
): DistancePoint {
  const lastValidPoint = previousPoints
    .slice()
    .reverse()
    .find(p => p.isValid);
  
  const isValid = filterInaccuratePoints(newPoint, lastValidPoint);
  
  let distance = 0;
  if (isValid && lastValidPoint) {
    const segmentDistance = calculateDistance(lastValidPoint, newPoint);
    distance = lastValidPoint.distance + segmentDistance;
  } else if (isValid && previousPoints.length === 0) {
    // First valid point
    distance = 0;
  } else {
    // Invalid point, keep previous distance
    distance = previousPoints.length > 0 ? previousPoints[previousPoints.length - 1].distance : 0;
  }
  
  return {
    ...newPoint,
    distance,
    isValid,
    timestamp: newPoint.timestamp || Date.now(),
  };
}

/**
 * Convert meters to kilometers with proper rounding
 */
export function metersToKilometers(meters: number): number {
  return Math.round((meters / 1000) * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert meters to miles with proper rounding
 */
export function metersToMiles(meters: number): number {
  return Math.round((meters * 0.000621371) * 100) / 100; // Round to 2 decimal places
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'imperial') {
    const miles = metersToMiles(meters);
    return `${miles.toFixed(2)} mi`;
  } else {
    const km = metersToKilometers(meters);
    return `${km.toFixed(2)} km`;
  }
}

/**
 * Calculate current speed from GPS data
 */
export function calculateCurrentSpeed(
  recentPoints: DistancePoint[],
  timeWindowSeconds: number = 10
): number {
  if (recentPoints.length < 2) return 0;
  
  const now = Date.now();
  const cutoffTime = now - (timeWindowSeconds * 1000);
  
  // Filter points within the time window
  const validPoints = recentPoints
    .filter(p => p.isValid && p.timestamp && p.timestamp >= cutoffTime)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  
  if (validPoints.length < 2) return 0;
  
  const firstPoint = validPoints[0];
  const lastPoint = validPoints[validPoints.length - 1];
  
  const distance = lastPoint.distance - firstPoint.distance; // meters
  const timeDiff = ((lastPoint.timestamp || 0) - (firstPoint.timestamp || 0)) / 1000; // seconds
  
  if (timeDiff <= 0) return 0;
  
  return distance / timeDiff; // m/s
}

/**
 * Smooth distance calculations by averaging recent valid points
 */
export function smoothDistance(
  points: DistancePoint[],
  smoothingWindow: number = 3
): number {
  if (points.length === 0) return 0;
  
  const validPoints = points.filter(p => p.isValid);
  if (validPoints.length === 0) return 0;
  
  if (validPoints.length < smoothingWindow) {
    return validPoints[validPoints.length - 1].distance;
  }
  
  const recentPoints = validPoints.slice(-smoothingWindow);
  const distances = recentPoints.map(p => p.distance);
  
  // Simple moving average
  const sum = distances.reduce((acc, d) => acc + d, 0);
  return sum / distances.length;
}