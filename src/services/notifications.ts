
export interface NotificationService {
  requestPermissions: () => Promise<boolean>;
  scheduleRunReminder: (seconds: number) => Promise<string | null>;
  sendTriviaNotification: (message: string) => Promise<void>;
  sendRunCompleteNotification: (distance: string, time: string) => Promise<void>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

// Mock implementation for Expo Go compatibility
class MockNotificationService implements NotificationService {
  async requestPermissions(): Promise<boolean> {
    console.log('🔔 Mock: Notification permissions granted (Expo Go mode)');
    return true;
  }
  
  async scheduleRunReminder(seconds: number): Promise<string | null> {
    console.log(`🔔 Mock: Run reminder scheduled for ${seconds} seconds`);
    return `mock-${Date.now()}`;
  }
  
  async sendTriviaNotification(message: string): Promise<void> {
    console.log('🧠 Mock: Trivia notification:', message);
  }
  
  async sendRunCompleteNotification(distance: string, time: string): Promise<void> {
    console.log(`🎉 Mock: Run complete - ${distance} in ${time}`);
  }
  
  async cancelNotification(id: string): Promise<void> {
    console.log(`🔔 Mock: Cancelled notification ${id}`);
  }
  
  async cancelAllNotifications(): Promise<void> {
    console.log('🔔 Mock: Cancelled all notifications');
  }
}

// Singleton instance - always use mock for Expo Go compatibility
export const notificationService = new MockNotificationService();

// Helper functions
export async function checkNotificationPermission(): Promise<{
  granted: boolean;
  canAskAgain: boolean;
}> {
  // In Expo Go, we'll always return true for mock purposes
  return { granted: true, canAskAgain: true };
}

// Mock notification response handlers
export function setupNotificationListeners() {
  console.log('🔔 Mock: Notification listeners setup (Expo Go mode)');
  
  // Return a cleanup function that does nothing
  return () => {
    console.log('🔔 Mock: Notification listeners cleaned up');
  };
}

// Quick notification functions
export async function notifyTriviaQuestion(questionText: string): Promise<void> {
  const shortText = questionText.substring(0, 50) + (questionText.length > 50 ? '...' : '');
  console.log(`🧠 Trivia: ${shortText}`);
}

export async function notifyRunMilestone(distanceKm: number, currentPace: string): Promise<void> {
  console.log(`🏃‍♂️ Milestone: ${distanceKm}km completed! Current pace: ${currentPace}`);
}

export async function notifyPenaltyAdded(penaltySeconds: number, totalPenalty: number): Promise<void> {
  console.log(`⏱️ Penalty: +${penaltySeconds}s added. Total: ${totalPenalty}s`);
}