import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export interface SpeechService {
  speak: (text: string, options?: SpeechOptions) => Promise<void>;
  stop: () => void;
  isSpeaking: () => boolean;
  getAvailableVoices: () => Promise<Voice[]>;
  speakTriviaQuestion: (question: string, options: string[]) => Promise<void>;
  speakRunStats: (distance: string, time: string, pace: string) => Promise<void>;
  speakEncouragement: (message: string) => Promise<void>;
}

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  quality: string;
}

class SpeechServiceImpl implements SpeechService {
  private isSpeakingState = false;
  
  async speak(text: string, options: SpeechOptions = {}): Promise<void> {
    try {
      // Check if speech is available
      const isAvailable = await Speech.isSpeakingAsync();
      if (isAvailable) {
        await Speech.stop();
      }
      
      this.isSpeakingState = true;
      
      const speechOptions: Speech.SpeechOptions = {
        language: options.language || 'en-US',
        pitch: options.pitch || 1.0,
        rate: options.rate || 1.0,
        voice: options.voice,
        onStart: () => {
          this.isSpeakingState = true;
        },
        onDone: () => {
          this.isSpeakingState = false;
        },
        onStopped: () => {
          this.isSpeakingState = false;
        },
        onError: (error) => {
          console.error('Speech error:', error);
          this.isSpeakingState = false;
        },
      };
      
      await Speech.speak(text, speechOptions);
    } catch (error) {
      console.error('Error in speech synthesis:', error);
      this.isSpeakingState = false;
    }
  }
  
  stop(): void {
    try {
      Speech.stop();
      this.isSpeakingState = false;
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }
  
  isSpeaking(): boolean {
    return this.isSpeakingState;
  }
  
  async getAvailableVoices(): Promise<Voice[]> {
    try {
      if (Platform.OS === 'ios') {
        const voices = await Speech.getAvailableVoicesAsync();
        return voices.map((voice) => ({
          id: voice.identifier,
          name: voice.name,
          language: voice.language,
          quality: voice.quality,
        }));
      } else {
        // Android doesn't provide detailed voice information
        return [
          {
            id: 'default',
            name: 'Default Voice',
            language: 'en-US',
            quality: 'default',
          },
        ];
      }
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }
  
  async speakTriviaQuestion(question: string, options: string[]): Promise<void> {
    try {
      // Create a natural-sounding question with options
      let spokenText = `Trivia question: ${question}. `;
      
      if (options.length > 0) {
        spokenText += 'Your options are: ';
        options.forEach((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D
          spokenText += `${letter}: ${option}. `;
        });
      }
      
      await this.speak(spokenText, {
        rate: 0.9, // Slightly slower for comprehension
        pitch: 1.1, // Slightly higher pitch for attention
      });
    } catch (error) {
      console.error('Error speaking trivia question:', error);
    }
  }
  
  async speakRunStats(distance: string, time: string, pace: string): Promise<void> {
    try {
      const statsText = `You have run ${distance} in ${time}. Your current pace is ${pace}.`;
      
      await this.speak(statsText, {
        rate: 1.0,
        pitch: 1.0,
      });
    } catch (error) {
      console.error('Error speaking run stats:', error);
    }
  }
  
  async speakEncouragement(message: string): Promise<void> {
    try {
      await this.speak(message, {
        rate: 1.1, // Slightly faster for energy
        pitch: 1.2, // Higher pitch for enthusiasm
      });
    } catch (error) {
      console.error('Error speaking encouragement:', error);
    }
  }
}

// Singleton instance
export const speechService = new SpeechServiceImpl();

// Helper functions for common speech patterns
export async function announceDistance(distanceKm: number, unit: 'metric' | 'imperial' = 'metric'): Promise<void> {
  const unitLabel = unit === 'imperial' ? 'miles' : 'kilometers';
  const distance = unit === 'imperial' ? (distanceKm * 0.621371).toFixed(1) : distanceKm.toFixed(1);
  
  await speechService.speak(`${distance} ${unitLabel} completed!`, {
    rate: 1.1,
    pitch: 1.1,
  });
}

export async function announcePace(paceText: string, unit: 'metric' | 'imperial' = 'metric'): Promise<void> {
  const unitLabel = unit === 'imperial' ? 'per mile' : 'per kilometer';
  
  await speechService.speak(`Current pace: ${paceText} ${unitLabel}`, {
    rate: 1.0,
    pitch: 1.0,
  });
}

export async function announceCorrectAnswer(): Promise<void> {
  const encouragements = [
    'Correct! Well done!',
    'That\'s right! Great job!',
    'Excellent! Keep it up!',
    'Perfect! You\'re on fire!',
    'Brilliant! Nice work!',
  ];
  
  const message = encouragements[Math.floor(Math.random() * encouragements.length)];
  await speechService.speakEncouragement(message);
}

export async function announceIncorrectAnswer(penaltySeconds: number): Promise<void> {
  const messages = [
    `Oops! That's incorrect. ${penaltySeconds} second penalty added.`,
    `Not quite right. Adding ${penaltySeconds} seconds to your time.`,
    `Wrong answer. ${penaltySeconds} second penalty applied.`,
    `Incorrect. Your time penalty is ${penaltySeconds} seconds.`,
  ];
  
  const message = messages[Math.floor(Math.random() * messages.length)];
  await speechService.speak(message, {
    rate: 0.9,
    pitch: 0.9,
  });
}

export async function announceRunStart(): Promise<void> {
  await speechService.speakEncouragement('Run started! Good luck with your trivia challenges!');
}

export async function announceRunPause(): Promise<void> {
  await speechService.speak('Run paused. Take your time.', {
    rate: 0.9,
    pitch: 0.9,
  });
}

export async function announceRunResume(): Promise<void> {
  await speechService.speakEncouragement('Run resumed! Let\'s keep going!');
}

export async function announceRunComplete(distance: string, time: string, penalties: string): Promise<void> {
  let message = `Run complete! You ran ${distance} in ${time}.`;
  
  if (penalties !== '0:00') {
    message += ` With penalties, your final time is ${penalties}.`;
  }
  
  message += ' Great job!';
  
  await speechService.speakEncouragement(message);
}

// Voice settings helper
export function getVoiceForGender(gender: 'male' | 'female', voices: Voice[]): Voice | undefined {
  // This is a simplified approach - in a real app, you'd want more sophisticated voice selection
  const femaleKeywords = ['female', 'woman', 'samantha', 'victoria', 'allison'];
  const maleKeywords = ['male', 'man', 'alex', 'daniel', 'tom'];
  
  const keywords = gender === 'female' ? femaleKeywords : maleKeywords;
  
  for (const voice of voices) {
    const nameOrId = (voice.name || voice.id).toLowerCase();
    if (keywords.some(keyword => nameOrId.includes(keyword))) {
      return voice;
    }
  }
  
  return voices[0]; // Fallback to first available voice
}