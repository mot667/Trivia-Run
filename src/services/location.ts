import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { useRunStore } from '../state/useRunStore';
import { processGPSPoint } from '../utils/distance';

const LOCATION_TASK_NAME = 'background-location-task';

// Mock GPS data for testing in simulators/web
const MOCK_GPS_ENABLED = Platform.OS === 'web';
let mockLocationInterval: any = null;
let mockLatitude = 37.7749; // San Francisco starting point
let mockLongitude = -122.4194;

export interface LocationService {
  requestPermissions: () => Promise<boolean>;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
  getCurrentPosition: () => Promise<Location.LocationObject | null>;
  isLocationEnabled: () => Promise<boolean>;
}

// Background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const store = useRunStore.getState();
    
    // Process each location update
    locations.forEach((location) => {
      const gpsPoint = processGPSPoint(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          speed: location.coords.speed || undefined,
          timestamp: location.timestamp,
        },
        store.currentRun?.gpsPoints || []
      );
      
      // Update GPS status based on accuracy
      let gpsStatus: 'poor' | 'medium' | 'good' = 'good';
      if (location.coords.accuracy) {
        if (location.coords.accuracy > 50) {
          gpsStatus = 'poor';
        } else if (location.coords.accuracy > 20) {
          gpsStatus = 'medium';
        }
      }
      
      store.updateGPSPosition(gpsPoint);
      store.setGPSStatus(gpsStatus);
    });
  }
});

class LocationServiceImpl implements LocationService {
  private isTracking = false;
  private foregroundSubscription: Location.LocationSubscription | null = null;
  
  async requestPermissions(): Promise<boolean> {
    try {
      // Use mock GPS for web only
      if (Platform.OS === 'web') {
        console.log('🌍 Mock GPS permissions granted for web');
        return true;
      }
      
      // Request foreground location permission
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }
      
      // Request background location permission
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.log('Background location permission denied');
        // Still return true as foreground permission is sufficient for basic functionality
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }
  
  async startTracking(): Promise<boolean> {
    try {
      if (this.isTracking) {
        return true;
      }
      
      // Use mock GPS for web
      if (Platform.OS === 'web') {
        console.log('🌍 Starting mock GPS tracking for web');
        this.startMockGPSTracking();
        this.isTracking = true;
        return true;
      }
      
      // Check if location services are enabled
      const isEnabled = await this.isLocationEnabled();
      if (!isEnabled) {
        console.log('⚠️ Location services disabled, falling back to mock GPS');
        this.startMockGPSTracking();
        this.isTracking = true;
        return true;
      }
      
      // Check permissions
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const granted = await this.requestPermissions();
        if (!granted) {
          console.log('⚠️ GPS permissions denied, falling back to mock GPS');
          this.startMockGPSTracking();
          this.isTracking = true;
          return true;
        }
      }
      
      // Start foreground location tracking
      this.foregroundSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 1, // Update every meter
        },
        (location) => {
          const store = useRunStore.getState();
          
          const gpsPoint = processGPSPoint(
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy || undefined,
              speed: location.coords.speed || undefined,
              timestamp: location.timestamp,
            },
            store.currentRun?.gpsPoints || []
          );
          
          // Update GPS status based on accuracy
          let gpsStatus: 'poor' | 'medium' | 'good' = 'good';
          if (location.coords.accuracy) {
            if (location.coords.accuracy > 50) {
              gpsStatus = 'poor';
            } else if (location.coords.accuracy > 20) {
              gpsStatus = 'medium';
            }
          }
          
          store.updateGPSPosition(gpsPoint);
          store.setGPSStatus(gpsStatus);
        }
      );
      
      // Start background location tracking if permission is granted
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Less frequent updates in background
          distanceInterval: 5,
          deferredUpdatesInterval: 5000,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: 'Trivia Run Active',
            notificationBody: 'Tracking your run with GPS',
            notificationColor: '#FC4C02',
          },
        });
      }
      
      this.isTracking = true;
      useRunStore.getState().setGPSStatus('good');
      
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }
  
  async stopTracking(): Promise<void> {
    try {
      if (!this.isTracking) {
        return;
      }
      
      // Stop mock GPS if running
      if (mockLocationInterval) {
        clearInterval(mockLocationInterval);
        mockLocationInterval = null;
        console.log('🌍 Stopped mock GPS tracking');
      }
      
      // Stop foreground tracking
      if (this.foregroundSubscription) {
        this.foregroundSubscription.remove();
        this.foregroundSubscription = null;
      }
      
      // Stop background tracking
      const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
      if (isTaskDefined) {
        const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (isTaskRegistered) {
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        }
      }
      
      this.isTracking = false;
      useRunStore.getState().setGPSStatus('disabled');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }
  
  async getCurrentPosition(): Promise<Location.LocationObject | null> {
    try {
      // Return mock position for web
      if (Platform.OS === 'web') {
        return {
          coords: {
            latitude: mockLatitude,
            longitude: mockLongitude,
            altitude: 50,
            accuracy: 5,
            altitudeAccuracy: 5,
            heading: 0,
            speed: 3.0,
          },
          timestamp: Date.now(),
        };
      }
      
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      return location;
    } catch (error) {
      console.error('Error getting current position:', error);
      return null;
    }
  }
  
  private startMockGPSTracking(): void {
    console.log('🌍 Starting mock GPS simulation');
    const store = useRunStore.getState();
    
    // Set initial GPS status
    store.setGPSStatus('good');
    
    // Simulate GPS updates every 2 seconds
    mockLocationInterval = setInterval(() => {
      // Get fresh store state each time
      const currentStore = useRunStore.getState();
      
      // Simulate movement (very small increments for realistic running speed)
      mockLatitude += (Math.random() - 0.5) * 0.0001; // ~11 meters max
      mockLongitude += (Math.random() - 0.5) * 0.0001;
      
      const mockLocation = {
        latitude: mockLatitude,
        longitude: mockLongitude,
        accuracy: 5 + Math.random() * 10, // 5-15 meter accuracy
        speed: 2.5 + Math.random() * 2, // 2.5-4.5 m/s (9-16 km/h running pace)
        timestamp: Date.now(),
      };
      
      const gpsPoint = processGPSPoint(mockLocation, currentStore.currentRun?.gpsPoints || []);
      currentStore.updateGPSPosition(gpsPoint);
      
      // Occasionally change GPS quality for realism
      const random = Math.random();
      if (random < 0.1) {
        store.setGPSStatus('medium');
      } else if (random < 0.05) {
        store.setGPSStatus('poor');
      } else {
        store.setGPSStatus('good');
      }
    }, 2000);
  }
  
  async isLocationEnabled(): Promise<boolean> {
    try {
      // Use mock GPS for web
      if (Platform.OS === 'web') {
        return true;
      }
      
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking if location is enabled:', error);
      return false;
    }
  }
  
  getIsTracking(): boolean {
    return this.isTracking;
  }
}

// Singleton instance
export const locationService = new LocationServiceImpl();

// Helper functions
export async function checkLocationPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  try {
    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return { granted: false, canAskAgain: true };
  }
}

export async function checkBackgroundLocationPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  try {
    const { status, canAskAgain } = await Location.getBackgroundPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain,
    };
  } catch (error) {
    console.error('Error checking background location permission:', error);
    return { granted: false, canAskAgain: true };
  }
}

export function calculateGPSAccuracyStatus(accuracy?: number): 'poor' | 'medium' | 'good' {
  if (!accuracy) return 'good';
  
  if (accuracy > 50) return 'poor';
  if (accuracy > 20) return 'medium';
  return 'good';
}