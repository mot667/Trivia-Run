import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { DEBUG_CONFIG, logDemo, logSuccess, logWarning, spamConsole } from '../config/debug';

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
      
      if (DEBUG_CONFIG.DEMO_MODE) {
        logDemo('🗣️  SPEECH SYNTHESIS ACTIVATED');
        logDemo(`   Text: "${text}"`);
        logDemo(`   Rate: ${options.rate || 1.0}x`);
        logDemo(`   Pitch: ${options.pitch || 1.0}x`);
        spamConsole('🎙️  Generating speech waveforms', 3);
        
        if (DEBUG_CONFIG.FUNNY_MESSAGES && text.includes('penalty')) {
          logWarning('😈 Oh no! About to tell them they got it wrong!');
          logWarning('Their face is gonna be priceless! 😂');
        }
      }
      
      this.isSpeakingState = true;
      
      const speechOptions: Speech.SpeechOptions = {
        language: options.language || 'en-US',
        pitch: options.pitch || 1.0,
        rate: options.rate || 1.0,
        voice: options.voice,
        onStart: () => {
          this.isSpeakingState = true;
          if (DEBUG_CONFIG.DEMO_MODE) {
            logSuccess('🔊 Speech started!');
          }
        },
        onDone: () => {
          this.isSpeakingState = false;
          if (DEBUG_CONFIG.DEMO_MODE) {
            logSuccess('✅ Speech completed!');
          }
        },
        onStopped: () => {
          this.isSpeakingState = false;
          if (DEBUG_CONFIG.DEMO_MODE) {
            logWarning('⏹️  Speech stopped mid-sentence!');
          }
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

export async function announceChallengeExplanation(): Promise<void> {
  const explanation = 'Welcome to Trivia Run! During your run, you\'ll receive trivia questions. Answer correctly to keep your time clean, or get penalty time for wrong answers. You have 30 seconds per question. Let\'s begin!';
  
  await speechService.speak(explanation, {
    rate: 0.9, // Slightly slower for comprehension
    pitch: 1.0,
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

// 🎬 DEMO MODE: Funny announcements for YouTube video
export async function sayFunnyDemoMessage(): Promise<void> {
  if (!DEBUG_CONFIG.DEMO_MODE || !DEBUG_CONFIG.FUNNY_MESSAGES) return;
  
  const funnyMessages = [
    'Hey! Your friend has no idea I\'m about to ruin their Strava time. This is gonna be hilarious!',
    'Wrong answer! I just added 10 seconds to your run. Your friends will wonder why you\'re so slow today!',
    'Fun fact: Every wrong answer makes you slower. Good luck explaining that on Strava!',
    'Oops! Another wrong answer. At this rate, your time will be... not great!',
    'Did you know? This app is specifically designed to make your friend look bad on Strava. Mission accomplished!',
    'Plot twist: The harder you think, the slower you run. That\'s not how fitness works!',
    'Your legs say run fast, but the trivia says slow down. Science!',
    'Warning: Your Strava friends are about to see a very confusing race time.',
    'Achievement unlocked: Most creative excuse for a slow run!',
    'This message brought to you by: Your friend who set up this whole prank!',
  ];
  
  const message = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
  
  logDemo('🎭 ACTIVATING FUNNY DEMO MESSAGE FOR YOUTUBE VIDEO!');
  logDemo(`   Message: "${message}"`);
  spamConsole('😂 Preparing to roast your friend', 5);
  
  await speechService.speak(message, {
    rate: 1.0,
    pitch: 1.1,
  });
  
  logSuccess('✅ Funny message delivered! Check your friend\'s reaction! 😂');
}

// Demo mode: Say something outrageous for the montage
export async function runDemoMontage(): Promise<void> {
  if (!DEBUG_CONFIG.DEMO_MODE) return;
  
  logDemo('═══════════════════════════════════════');
  logDemo('🎬 STARTING DEMO MONTAGE SEQUENCE');
  logDemo('═══════════════════════════════════════');
  
  await speechService.speak('Initializing Trivia Run... Prepare to have your mind blown!', { rate: 1.2, pitch: 1.0 });
  
  spamConsole('🚀 Loading awesome features', 10);
  
  logDemo('Feature 1: GPS tracking that actually works!');
  logDemo('Feature 2: Trivia questions that will make you think!');
  logDemo('Feature 3: Penalties that will make you cry!');
  logDemo('Feature 4: Strava integration that will expose you!');
  
  await speechService.speak('Warning: This app contains dangerous levels of fun and embarrassment!', { rate: 0.9, pitch: 1.3 });
  
  logSuccess('✅ Montage sequence complete! That\'s a wrap! 🎬');
}