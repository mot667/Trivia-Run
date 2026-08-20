# 🎬 YouTube Demo Mode

This demo system is designed to create awesome console logs and funny moments for your YouTube video!

## Setup

1. **Enable Demo Mode**: Open `src/config/debug.ts` and make sure these are set:
```typescript
export const DEBUG_CONFIG = {
  DEMO_MODE: true,
  VERBOSE_LOGGING: true,
  SIMULATE_ERRORS: true,
  FUNNY_MESSAGES: true,
  SPAM_CONSOLE: true,
};
```

2. **Add Demo Controls to Your App**: In any screen (like Settings), add:
```typescript
import { YoutubeDemoControls } from '../demo/DemoControls';

// Then in your component:
<YoutubeDemoControls />
```

## Demo Scenarios

### 1. 🔴 Expo Multi-Device Errors
**Purpose**: Show how Expo lets you debug on multiple phones at once

**What it does**:
- Simulates two devices connecting to Metro bundler
- Shows various React errors and warnings
- Displays a GPS error popup
- Creates console chaos with error messages

**Perfect for**: Explaining how React Native debugging works

### 2. 🏃 Strava Integration
**Purpose**: Demonstrate the Strava upload process

**What it does**:
- Shows OAuth authentication flow
- Logs activity data preparation
- Simulates API upload with progress
- Shows success message with penalty time easter egg

**Perfect for**: Explaining how the app ruins your friend's Strava time 😂

### 3. 🗣️ Speech Synthesis
**Purpose**: Show off the text-to-speech feature

**What it does**:
- Makes the phone say funny messages out loud
- Demonstrates trivia question announcements
- Shows penalty announcements
- Logs speech waveform generation

**Perfect for**: Getting funny audio clips for your video

**Funny messages include**:
- "Your friend has no idea I'm about to ruin their Strava time!"
- "Wrong answer! I just added 10 seconds to your run!"
- And more hilarious roasts...

### 4. 🧠 Trivia System
**Purpose**: Demonstrate the question selection and validation

**What it does**:
- Loads the trivia bank with detailed logs
- Selects random questions
- Shows question difficulty
- Simulates wrong answers with penalties
- Displays trivia statistics

**Perfect for**: Explaining how the core game mechanic works

### 5. 🎬 FULL DEMO (Recommended!)
**Purpose**: Run all scenarios in sequence

**What it does**:
- Clears console for clean start
- Runs montage speech intro
- Executes all four scenarios
- Creates MAXIMUM console spam
- Perfect for B-roll footage

**Perfect for**: Getting all your footage in one take!

## Tips for Recording

### Console/Terminal Footage
1. Open your React Native debugger or Metro bundler terminal
2. Make the text size large enough to read on camera
3. Use a dark theme for better contrast
4. Position your terminal so logs are visible

### Phone Footage
1. Enable screen recording on your phone
2. Make sure developer logs are visible (shake device → show logs)
3. Record your friend's confused reactions when they get penalties 😂

### Montage Ideas
- Film the console scrolling with cool music
- Zoom in on specific error messages
- Show multiple phones debugging at once
- Cut to your friend's face when speech says something funny

## Disabling for Production

Before building for production or doing a real run:

1. Set `DEMO_MODE: false` in `src/config/debug.ts`
2. The demo controls will automatically hide
3. All extra logging will stop
4. App will run normally

## Custom Messages

Want to add your own funny messages? Edit these files:

- **Speech messages**: `src/services/speech.ts` → `sayFunnyDemoMessage()`
- **Strava messages**: `src/services/strava.ts` → `uploadRun()`
- **Trivia messages**: `src/services/trivia.ts` → `getRandomQuestion()`

## Troubleshooting

**No logs appearing?**
- Check that `DEMO_MODE: true` in debug config
- Make sure you opened the right console/terminal

**Speech not working?**
- Check phone volume
- Ensure app has microphone permissions
- Test with simpler messages first

**Want more console spam?**
- Increase the `count` parameter in `spamConsole()` calls
- Add more log messages in the service files

## Have Fun! 🎉

This is designed to make your video awesome and get great reactions from your friend. Don't forget to capture their face when they realize their Strava time has penalties! 😂

Questions? Check the code comments in:
- `src/demo/youtubeDemo.ts`
- `src/config/debug.ts`
