import { useFocusEffect } from '@react-navigation/native';
import * as KeepAwake from 'expo-keep-awake';
import * as Location from 'expo-location';
import React, { useCallback, useEffect } from 'react';
import {
    Alert,
    BackHandler,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    EndRunButton,
    PauseRunButton,
    ResumeRunButton,
    StartRunButton,
} from '../components/BigButton';
import { GpsLockPill, GpsSearchingIndicator } from '../components/GpsLockPill';
import {
    CaloriesStatCard,
    DistanceStatCard,
    PaceStatCard,
    PenaltyStatCard,
    TimeStatCard,
} from '../components/StatCard';
import TriviaConfigDisplay from '../components/TriviaConfigDisplay';
import { TriviaModal } from '../components/TriviaModal';
import { locationService } from '../services/location';
import { announceRunPause, announceRunResume, announceRunStart } from '../services/speech';
import { triviaService } from '../services/trivia';
import { useRunStore } from '../state/useRunStore';
import { useSettingsStore } from '../state/useSettingsStore';
import { theme } from '../theme';
import { formatElapsedTime } from '../utils/time';

interface RunScreenProps {
  navigation: any;
}

export const RunScreen: React.FC<RunScreenProps> = ({ navigation }) => {
  const {
    currentRun,
    gpsStatus,
    showTriviaModal,
    isLocationTracking,
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    presentTriviaQuestion,
    answerTriviaQuestion,
    skipTriviaQuestion,
    timeoutTriviaQuestion,
    dismissTriviaModal,
    setGPSStatus,
  } = useRunStore();
  
  const {
    units,
    triviaTimeoutSeconds,
    speechEnabled,
    keepScreenAwake,
    showPaceInRealTime,
    triviaTriggerType,
    triviaEnabled,
  } = useSettingsStore();
  
  // Keep screen awake during runs
  useEffect(() => {
    if (keepScreenAwake && currentRun?.status === 'running') {
      KeepAwake.activateKeepAwakeAsync();
      return () => {
        KeepAwake.deactivateKeepAwake();
      };
    }
  }, [keepScreenAwake, currentRun?.status]);

  // Initialize GPS status on screen load
  useEffect(() => {
    const initializeGPS = async () => {
      try {
        // Check if location services are enabled
        const isEnabled = await locationService.isLocationEnabled();
        if (!isEnabled) {
          setGPSStatus('poor');
          return;
        }

        // Check existing permissions (don't request yet)
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          // Try to get initial position
          const position = await locationService.getCurrentPosition();
          if (position) {
            setGPSStatus('good');
          } else {
            setGPSStatus('medium');
          }
        } else {
          setGPSStatus('poor');
        }
      } catch (error) {
        console.error('Error initializing GPS:', error);
        setGPSStatus('poor');
      }
    };

    initializeGPS();
  }, [setGPSStatus]);
  
  // Handle back button during active run
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentRun && currentRun.status !== 'finished') {
          Alert.alert(
            'Exit Run?',
            'Are you sure you want to exit? Your run is still active.',
            [
              { text: 'Stay', style: 'cancel' },
              { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
            ]
          );
          return true; // Prevent default back action
        }
        return false;
      };
      
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [currentRun, navigation])
  );
  
  // Location tracking effect
  useEffect(() => {
    if (isLocationTracking) {
      locationService.startTracking();
    } else {
      locationService.stopTracking();
    }
  }, [isLocationTracking]);
  
  // Trivia trigger effect
  useEffect(() => {
    if (
      currentRun &&
      currentRun.status === 'running' &&
      !currentRun.activeTriviaQuestion
    ) {
      // Check if trivia should trigger based on the configured type
      let shouldTrigger = false;
      
      if (triviaTriggerType === 'distance') {
        shouldTrigger = currentRun.totalDistanceMeters >= currentRun.nextTriviaDistanceMeters &&
                      currentRun.totalDistanceMeters > 0;
      } else if (triviaTriggerType === 'time') {
        shouldTrigger = currentRun.nextTriviaTimeSeconds !== undefined &&
                      currentRun.elapsedSeconds >= currentRun.nextTriviaTimeSeconds;
      } else if (triviaTriggerType === 'count') {
        shouldTrigger = currentRun.totalDistanceMeters >= currentRun.nextTriviaDistanceMeters &&
                      currentRun.totalDistanceMeters > 0;
      }
      
      if (shouldTrigger && triviaEnabled) {
        // Trigger trivia question
        const question = triviaService.getRandomQuestion();
        if (question) {
          presentTriviaQuestion(question);
        }
      }
    }
  }, [
    currentRun?.totalDistanceMeters, 
    currentRun?.nextTriviaDistanceMeters, 
    currentRun?.elapsedSeconds,
    currentRun?.nextTriviaTimeSeconds,
    currentRun?.activeTriviaQuestion, 
    triviaTriggerType,
    triviaEnabled,
    presentTriviaQuestion
  ]);
  
  const handleStartRun = async () => {
    try {
      // Check location permission
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions to track your run.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Get initial position
      const position = await locationService.getCurrentPosition();
      const initialPosition = position ? {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      } : undefined;
      
      startRun(initialPosition);
      
      if (speechEnabled) {
        announceRunStart();
      }
    } catch (error) {
      console.error('Error starting run:', error);
      Alert.alert(
        'Error',
        'Failed to start run. Please check your GPS connection.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handlePauseRun = () => {
    pauseRun();
    if (speechEnabled) {
      announceRunPause();
    }
  };
  
  const handleResumeRun = () => {
    resumeRun();
    if (speechEnabled) {
      announceRunResume();
    }
  };
  
  const handleEndRun = () => {
    Alert.alert(
      'End Run',
      'Are you sure you want to end your run?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Run',
          style: 'destructive',
          onPress: () => {
            finishRun();
            // Navigate to home tab to start a new run
            navigation.navigate('index');
          },
        },
      ]
    );
  };
  
  const handleTriviaAnswer = (selectedIndex: number, timeToAnswer: number) => {
    answerTriviaQuestion(selectedIndex, timeToAnswer);
  };
  
  const handleTriviaSkip = () => {
    skipTriviaQuestion();
  };
  
  const handleTriviaTimeout = () => {
    timeoutTriviaQuestion();
  };
  
  const renderIdleState = () => (
    <View style={styles.centerContainer}>
      <Surface style={styles.welcomeCard} elevation={2}>
        <Text style={styles.welcomeTitle}>Ready to Run?</Text>
        <Text style={styles.welcomeSubtitle}>
          Challenge yourself with trivia questions during your run!
        </Text>
        
        <View style={styles.gpsContainer}>
          {gpsStatus === 'disabled' ? (
            <GpsSearchingIndicator />
          ) : (
            <GpsLockPill status={gpsStatus} />
          )}
        </View>
        
        <StartRunButton
          onPress={handleStartRun}
          disabled={gpsStatus === 'disabled'}
          loading={gpsStatus === 'disabled'}
        />
      </Surface>
    </View>
  );
  
  const renderRunningState = () => {
    if (!currentRun) return null;
    
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* GPS Status */}
        <View style={styles.gpsContainer}>
          <GpsLockPill status={gpsStatus} />
        </View>
        
        {/* Trivia Configuration */}
        <TriviaConfigDisplay compact style={{ marginBottom: 16 }} />
        
        {/* Main Stats Grid */}
        <View style={styles.mainStatsGrid}>
          <View style={styles.statRow}>
            <TimeStatCard
              elapsedSeconds={currentRun.elapsedSeconds}
              variant="accent"
              size="large"
            />
          </View>
          
          <View style={styles.statRow}>
            <DistanceStatCard
              distanceMeters={currentRun.totalDistanceMeters}
              unit={units}
              size="large"
            />
          </View>
          
          {showPaceInRealTime && (
            <View style={styles.statRow}>
              <PaceStatCard
                distanceMeters={currentRun.totalDistanceMeters}
                timeSeconds={currentRun.elapsedSeconds}
                unit={units}
                label="Current Pace"
                size="medium"
              />
            </View>
          )}
          
          <View style={styles.statRow}>
            <PaceStatCard
              distanceMeters={currentRun.totalDistanceMeters}
              timeSeconds={currentRun.elapsedSeconds}
              unit={units}
              label="Average Pace"
              size="medium"
            />
          </View>
        </View>
        
        {/* Secondary Stats */}
        <View style={styles.secondaryStatsGrid}>
          <CaloriesStatCard
            calories={currentRun.calories}
            size="small"
          />
          
          {currentRun.totalPenaltySeconds > 0 && (
            <PenaltyStatCard
              penaltySeconds={currentRun.totalPenaltySeconds}
              size="small"
            />
          )}
        </View>
        
        {/* Trivia Stats */}
        {currentRun.triviaResults.length > 0 && (
          <Surface style={styles.triviaStatsCard} elevation={1}>
            <Text style={styles.triviaStatsTitle}>Trivia Progress</Text>
            <View style={styles.triviaStatsRow}>
              <Text style={styles.triviaStatText}>
                Questions: {currentRun.triviaResults.length}
              </Text>
              <Text style={styles.triviaStatText}>
                Correct: {currentRun.triviaResults.filter(r => r.correct).length}
              </Text>
              <Text style={styles.triviaStatText}>
                Penalties: {formatElapsedTime(currentRun.totalPenaltySeconds)}
              </Text>
            </View>
          </Surface>
        )}
        
        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {currentRun.status === 'running' ? (
            <View style={styles.runningControls}>
              <PauseRunButton onPress={handlePauseRun} />
              <EndRunButton onPress={handleEndRun} />
            </View>
          ) : (
            <View style={styles.pausedControls}>
              <ResumeRunButton onPress={handleResumeRun} />
              <EndRunButton onPress={handleEndRun} />
            </View>
          )}
        </View>
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {!currentRun ? renderIdleState() : renderRunningState()}
        
        {/* Trivia Modal */}
        <TriviaModal
          visible={showTriviaModal}
          question={currentRun?.activeTriviaQuestion || null}
          timeoutSeconds={triviaTimeoutSeconds}
          onAnswer={handleTriviaAnswer}
          onSkip={handleTriviaSkip}
          onTimeout={handleTriviaTimeout}
          onDismiss={dismissTriviaModal}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.screen.padding,
  },
  welcomeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.card.borderRadius,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  welcomeTitle: {
    ...theme.typography.headlineLarge,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  welcomeSubtitle: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  gpsContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.screen.padding,
    paddingBottom: theme.spacing.xxxl,
  },
  mainStatsGrid: {
    marginBottom: theme.spacing.lg,
  },
  statRow: {
    marginBottom: theme.spacing.sm,
  },
  secondaryStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  triviaStatsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.card.borderRadius,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  triviaStatsTitle: {
    ...theme.typography.titleMedium,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  triviaStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  triviaStatText: {
    ...theme.typography.bodySmall,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  controlsContainer: {
    marginTop: theme.spacing.lg,
  },
  runningControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  pausedControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
});