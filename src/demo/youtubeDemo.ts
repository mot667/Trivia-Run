/**
 * YouTube Video Demo Script
 * 
 * Import and run these functions in your app to create
 * the console spam and funny moments for your video!
 * 
 * Usage in a component:
 * import { runFullDemo, simulateErrorScenario, demonstrateStravaIntegration } from './demo/youtubeDemo';
 * 
 * Then call them when you want to film that part of the video.
 */

import { Alert } from 'react-native';
import { DEBUG_CONFIG, logDemo, logError, logSuccess, logWarning, spamConsole } from '../config/debug';
import { runDemoMontage, sayFunnyDemoMessage, speechService } from '../services/speech';
import { triviaService } from '../services/trivia';

/**
 * SCENARIO 1: Expo Multi-Device Debugging Chaos
 * Shows console logs flying everywhere and simulated errors
 */
export async function simulateExpoMultiDeviceError() {
  if (!DEBUG_CONFIG.DEMO_MODE) {
    console.log('Enable DEMO_MODE in debug config first!');
    return;
  }

  logDemo('═══════════════════════════════════════');
  logDemo('📱 SIMULATING MULTI-DEVICE EXPO DEBUGGING');
  logDemo('═══════════════════════════════════════');
  
  // Simulate two devices connecting
  spamConsole('📱 Device 1 (iPhone 14) connecting to Metro bundler...', 5);
  spamConsole('📱 Device 2 (Samsung Galaxy) connecting to Metro bundler...', 5);
  
  logSuccess('✅ Device 1 connected! IP: 192.168.1.100');
  logSuccess('✅ Device 2 connected! IP: 192.168.1.101');
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate some errors
  logError('❌ [Device 1] Warning: Can\'t perform a React state update on an unmounted component');
  logError('❌ [Device 2] TypeError: Cannot read property \'distance\' of undefined');
  
  spamConsole('🔄 Hot reloading on both devices', 8);
  
  logWarning('⚠️  [Device 1] Possible Unhandled Promise Rejection');
  logError('💥 [Device 2] GPS permission denied! Location services not available!');
  
  // Show the popup error on Device 2
  if (DEBUG_CONFIG.SIMULATE_ERRORS) {
    Alert.alert(
      '💥 Error on Device 1',
      'GPS Location Error: Unable to get current position. Do Better',
      [{ text: 'I will do Better' }]
    );
  }
  
  logDemo('');
  logDemo('📹 Perfect! That console chaos is great B-roll footage!');
  logDemo('💡 This shows how Expo lets you debug on multiple devices simultaneously!');
  logDemo('');
  
  spamConsole('🛠️  Fixing bugs in real-time', 5);
  
  logSuccess('✅ Bugs "fixed"! (for the video at least 😉)');
}

/**
 * SCENARIO 2: Strava Integration Demo
 * Shows the full upload process with logging
 */
export async function demonstrateStravaIntegration() {
  if (!DEBUG_CONFIG.DEMO_MODE) {
    console.log('Enable DEMO_MODE in debug config first!');
    return;
  }

  logDemo('═══════════════════════════════════════');
  logDemo('🏃 DEMONSTRATING STRAVA INTEGRATION');
  logDemo('═══════════════════════════════════════');
  
  // Simulate the OAuth flow
  logDemo('');
  logDemo('Step 1: OAuth Authentication');
  spamConsole('🔐 Connecting to Strava OAuth 2.0', 7);
  logSuccess('✅ User authorized! Access token received');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate creating activity data
  logDemo('');
  logDemo('Step 2: Preparing Activity Data');
  logDemo('   Building JSON payload...');
  logDemo('   Adding run statistics...');
  logDemo('   Calculating pace and speed...');
  logDemo('   Embedding trivia results...');
  logDemo('   Adding penalty time (the secret sauce! 😈)...');
  
  spamConsole('📦 Compressing activity data', 5);
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate the upload
  logDemo('');
  logDemo('Step 3: Uploading to Strava');
  logWarning('⏳ Sending POST request to api.strava.com/v3/activities...');
  spamConsole('📡 Transmitting data', 10);
  
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  logSuccess('═══════════════════════════════════════');
  logSuccess('🎉 UPLOAD SUCCESSFUL!');
  logSuccess('═══════════════════════════════════════');
  logSuccess('Activity ID: 1234567890');
  logSuccess('Your friend\'s time has been officially RUINED! 😂');
  logSuccess('Penalty seconds added to their Strava time!');
  logDemo('');
  logDemo('💭 They\'ll be so confused why their time is slower than usual!');
  logDemo('📹 Make sure you get their reaction when they check Strava! 😂');
}

/**
 * SCENARIO 3: Speech Synthesis Demo
 * Makes the phone say funny things
 */
export async function demonstrateSpeechSynthesis() {
  if (!DEBUG_CONFIG.DEMO_MODE) {
    console.log('Enable DEMO_MODE in debug config first!');
    return;
  }

  logDemo('═══════════════════════════════════════');
  logDemo('🗣️  DEMONSTRATING SPEECH SYNTHESIS');
  logDemo('═══════════════════════════════════════');
  
  spamConsole('🎙️  Initializing text-to-speech engine', 5);
  
  // Say something funny
  await sayFunnyDemoMessage();
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  logDemo('');
  logDemo('Let\'s announce a wrong answer with penalties...');
  await speechService.speak(
    'Oops! Wrong answer! Adding 15 seconds to your time. Better luck next question!',
    { rate: 0.9, pitch: 0.8 }
  );
  
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  logWarning('😈 That voice is gonna haunt your friend\'s dreams!');
  logDemo('');
  
  // Another funny one
  await speechService.speak(
    'Do you even know how to code? This is embarrassing! Please someone help me out of here!',
    { rate: 1.1, pitch: 1.2 }
  );
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  logSuccess('✅ Speech synthesis demo complete!');
  logDemo('💡 The TTS system works great for delivering trivia questions while running!');
}

/**
 * SCENARIO 4: Trivia System Demo
 * Shows the question selection and validation
 */
export async function demonstrateTriviaSystem() {
  if (!DEBUG_CONFIG.DEMO_MODE) {
    console.log('Enable DEMO_MODE in debug config first!');
    return;
  }

  logDemo('═══════════════════════════════════════');
  logDemo('🧠 DEMONSTRATING TRIVIA SYSTEM');
  logDemo('═══════════════════════════════════════');
  
  // Load trivia bank (will show all the logging)
  await triviaService.loadTriviaBank();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get a few questions
  logDemo('');
  logDemo('Selecting random questions...');
  
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const question = triviaService.getRandomQuestion();
    
    if (question) {
      logDemo('');
      logDemo(`Question ${i + 1}:`);
      logDemo(`   "${question.question}"`);
      question.options.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        logDemo(`   ${letter}) ${opt}`);
      });
      
      // Simulate answering wrong
      if (i === 1) {
        logWarning('❌ WRONG ANSWER! Adding 10 second penalty!');
        spamConsole('⏱️  Penalty timer activated', 3);
      }
    }
  }
  
  // Show stats
  const stats = triviaService.getStatistics();
  logDemo('');
  logSuccess('📊 Trivia System Statistics:');
  logDemo(`   Total questions: ${stats.totalQuestions}`);
  logDemo(`   Questions used: ${stats.usedQuestions}`);
  logDemo('');
  logSuccess('✅ Trivia system is ready to challenge runners!');
}

/**
 * THE BIG ONE: Full Demo Montage
 * Run this for the ultimate console spam!
 */
export async function runFullDemo() {
  if (!DEBUG_CONFIG.DEMO_MODE) {
    console.log('⚠️  Enable DEMO_MODE in src/config/debug.ts first!');
    return;
  }

  console.clear(); // Clear console for clean start
  
  logDemo('');
  logDemo('🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬');
  logDemo('🎬                                      🎬');
  logDemo('🎬    TRIVIA RUN - YOUTUBE DEMO        🎬');
  logDemo('🎬    FULL MONTAGE SEQUENCE            🎬');
  logDemo('🎬                                      🎬');
  logDemo('🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬🎬');
  logDemo('');
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Run the montage speech
  await runDemoMontage();
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Show all the scenarios
  await demonstrateTriviaSystem();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await demonstrateSpeechSynthesis();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await demonstrateStravaIntegration();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await simulateExpoMultiDeviceError();
  
  logDemo('');
  logDemo('═══════════════════════════════════════');
  logSuccess('🎬 FULL DEMO COMPLETE!');
  logDemo('═══════════════════════════════════════');
  logSuccess('That should give you PLENTY of B-roll footage! 📹');
  logDemo('Your video is gonna be AMAZING! 🔥');
  logDemo('Don\'t forget to show your friend\'s reaction! 😂');
  logDemo('═══════════════════════════════════════');
}

/**
 * Quick tester for each scenario
 */
export const demoScenarios = {
  '1_expo_errors': simulateExpoMultiDeviceError,
  '2_strava': demonstrateStravaIntegration,
  '3_speech': demonstrateSpeechSynthesis,
  '4_trivia': demonstrateTriviaSystem,
  'full_demo': runFullDemo,
};
