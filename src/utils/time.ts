import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(utc);

/**
 * Format elapsed time in MM:SS or HH:MM:SS format
 */
export function formatElapsedTime(seconds: number): string {
  const duration = dayjs.duration(seconds, 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const secs = duration.seconds();
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Format time for display with units
 */
export function formatTimeWithUnits(seconds: number): string {
  const duration = dayjs.duration(seconds, 'seconds');
  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const secs = duration.seconds();
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Parse time string (MM:SS or HH:MM:SS) to seconds
 */
export function parseTimeString(timeString: string): number {
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 2) {
    // MM:SS format
    const [minutes, seconds] = parts;
    return (minutes * 60) + seconds;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    return (hours * 3600) + (minutes * 60) + seconds;
  }
  
  return 0;
}

/**
 * Get current timestamp in milliseconds
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestampSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Format timestamp for file names (YYYY-MM-DD_HH-mm-ss)
 */
export function formatTimestampForFile(timestamp?: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD_HH-mm-ss');
}

/**
 * Format timestamp for display (e.g., "March 15, 2024 at 2:30 PM")
 */
export function formatTimestampForDisplay(timestamp: number): string {
  return dayjs(timestamp).format('MMMM D, YYYY [at] h:mm A');
}

/**
 * Format timestamp for run history (e.g., "Today", "Yesterday", "March 15")
 */
export function formatTimestampRelative(timestamp: number): string {
  const now = dayjs();
  const date = dayjs(timestamp);
  
  if (date.isSame(now, 'day')) {
    return 'Today';
  } else if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  } else if (date.isSame(now, 'year')) {
    return date.format('MMMM D');
  } else {
    return date.format('MMMM D, YYYY');
  }
}

/**
 * Format time as ISO string for TCX export
 */
export function formatTimestampISO(timestamp: number): string {
  return dayjs(timestamp).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
}

/**
 * Create a timer that calls a callback every second
 */
export class Timer {
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private isPaused: boolean = false;
  private isRunning: boolean = false;
  
  constructor(private callback: (elapsedSeconds: number) => void) {}
  
  start(): void {
    if (this.isRunning) return;
    
    this.startTime = Date.now() - this.pausedTime;
    this.isRunning = true;
    this.isPaused = false;
    
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.callback(elapsed);
      }
    }, 1000);
  }
  
  pause(): void {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.pausedTime = Date.now() - this.startTime;
  }
  
  resume(): void {
    if (!this.isRunning || !this.isPaused) return;
    
    this.startTime = Date.now() - this.pausedTime;
    this.isPaused = false;
  }
  
  stop(): number {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    const finalTime = this.isPaused ? this.pausedTime : Date.now() - this.startTime;
    const elapsedSeconds = Math.floor(finalTime / 1000);
    
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pausedTime = 0;
    
    return elapsedSeconds;
  }
  
  getElapsedSeconds(): number {
    if (!this.isRunning) return 0;
    
    if (this.isPaused) {
      return Math.floor(this.pausedTime / 1000);
    } else {
      return Math.floor((Date.now() - this.startTime) / 1000);
    }
  }
  
  getIsRunning(): boolean {
    return this.isRunning;
  }
  
  getIsPaused(): boolean {
    return this.isPaused;
  }
}

/**
 * Calculate elapsed time between two timestamps
 */
export function getElapsedTime(startTime: number, endTime?: number): number {
  const end = endTime || Date.now();
  return Math.floor((end - startTime) / 1000);
}

/**
 * Add penalty time to a base time and format for display
 */
export function formatTimeWithPenalty(baseSeconds: number, penaltySeconds: number): {
  base: string;
  penalty: string;
  total: string;
} {
  return {
    base: formatElapsedTime(baseSeconds),
    penalty: `+${formatElapsedTime(penaltySeconds)}`,
    total: formatElapsedTime(baseSeconds + penaltySeconds),
  };
}