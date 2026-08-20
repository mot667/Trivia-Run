# TriviaRun

A React Native running app that quizzes you mid-run and adds penalty time for wrong answers. Track your distance and pace, answer trivia challenges read aloud by the app, and optionally upload your (penalised) results to Strava.

**[Watch the demo on YouTube](https://www.youtube.com/watch?v=EQmyfInSnnQ)**

---

## Features

- **GPS run tracking** — real-time distance, pace, elapsed time, and calorie estimates
- **Trivia challenges** — questions are read aloud via text-to-speech at configurable intervals
- **Penalty system** — wrong answers add seconds to your final run time
- **Strava integration** — OAuth 2.0 login and automatic activity upload on run completion
- **Configurable settings** — units (km/mi), trivia frequency, penalty duration, voice options, haptics
- **Run summary** — post-run breakdown showing base time vs. total time with penalties

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Language | TypeScript |
| Navigation | Expo Router (file-based) |
| State | Zustand |
| UI | React Native Paper |
| GPS | expo-location (background tracking) |
| Speech | expo-speech (text-to-speech) |
| Auth | expo-auth-session (Strava OAuth 2.0) |
| Notifications | expo-notifications |

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator, or the [Expo Go](https://expo.dev/go) app

### Installation

```bash
git clone https://github.com/your-username/triviaRun.git
cd triviaRun
npm install
```

### Strava Integration (optional)

1. Create a Strava app at [strava.com/settings/api](https://www.strava.com/settings/api)
2. Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```env
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
```

### Run the app

```bash
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Project Structure

```
src/
  components/     # Reusable UI components (StatCard, TriviaModal, etc.)
  screens/        # RunScreen, SummaryScreen, SettingsScreen
  services/       # GPS, speech, trivia, Strava API
  state/          # Zustand stores (run state, settings)
  utils/          # Distance, pace, time, RNG helpers
app/              # Expo Router file-based routes
```

## License

MIT
