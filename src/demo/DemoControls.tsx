/**
 * YouTube Demo Controls
 * 
 * Add this component to any screen to get easy buttons for triggering demo scenarios
 * Perfect for your video recording!
 * 
 * Usage:
 * import { YoutubeDemoControls } from '../demo/DemoControls';
 * 
 * Then in your component:
 * <YoutubeDemoControls />
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { DEBUG_CONFIG } from '../config/debug';
import { theme } from '../theme';
import { demoScenarios } from './youtubeDemo';

export const YoutubeDemoControls: React.FC = () => {
  if (!DEBUG_CONFIG.DEMO_MODE) {
    return null; // Don't show if demo mode is off
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title="🎬 YouTube Demo Controls"
          subtitle="Trigger demo scenarios for your video"
        />
        <Card.Content>
          <Text style={styles.warning}>
            ⚠️  These will spam your console and trigger speech! Make sure you're ready to record!
          </Text>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              icon="alert-circle"
              onPress={demoScenarios['1_expo_errors']}
              style={[styles.button, { backgroundColor: '#F44336' }]}
            >
              1. Expo Multi-Device Errors
            </Button>
            
            <Button
              mode="contained"
              icon="run"
              onPress={demoScenarios['2_strava']}
              style={[styles.button, { backgroundColor: '#FC4C02' }]}
            >
              2. Strava Integration
            </Button>
            
            <Button
              mode="contained"
              icon="microphone"
              onPress={demoScenarios['3_speech']}
              style={[styles.button, { backgroundColor: '#2196F3' }]}
            >
              3. Speech Synthesis (🔊 Sound!)
            </Button>
            
            <Button
              mode="contained"
              icon="brain"
              onPress={demoScenarios['4_trivia']}
              style={[styles.button, { backgroundColor: '#9C27B0' }]}
            >
              4. Trivia System
            </Button>
            
            <Button
              mode="contained"
              icon="movie-open"
              onPress={demoScenarios['full_demo']}
              style={[styles.button, { backgroundColor: '#FF9800' }]}
              labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            >
              🎬 FULL DEMO (All Scenarios!)
            </Button>
          </View>
          
          <Text style={styles.tip}>
            💡 Tip: Run "Full Demo" for maximum console chaos!
          </Text>
          
          <Text style={styles.tip}>
            📹 Remember to open your developer console/logs before recording!
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  warning: {
    ...theme.typography.bodyMedium,
    color: '#FF9800',
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: theme.spacing.sm,
  },
  buttonContainer: {
    gap: theme.spacing.md,
  },
  button: {
    marginVertical: theme.spacing.xs,
  },
  tip: {
    ...theme.typography.bodySmall,
    color: theme.colors.onSurfaceVariant,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
});
