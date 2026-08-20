import React, { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  List,
  Portal,
  SegmentedButtons,
  Switch,
  Text,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YoutubeDemoControls } from '../demo/DemoControls';
import { stravaService } from '../services/strava';
import { useSettingsStore } from '../state/useSettingsStore';
import { theme } from '../theme';
import {
  getTriviaTimingDescription,
  TRIVIA_TIMING_PRESETS,
  validateTriviaConfig,
  type TriviaTriggerConfig,
} from '../utils/trivia-timing';

export default function SettingsScreen() {
  const settings = useSettingsStore();
  const [showTriviaDialog, setShowTriviaDialog] = useState(false);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [authCode, setAuthCode] = useState('');
  
  // Local state for trivia timing configuration
  const [localConfig, setLocalConfig] = useState<TriviaTriggerConfig>({
    type: settings.triviaTriggerType,
    distanceMinMeters: settings.triviaDistanceMinMeters,
    distanceMaxMeters: settings.triviaDistanceMaxMeters,
    timeMinSeconds: settings.triviaTimeMinSeconds,
    timeMaxSeconds: settings.triviaTimeMaxSeconds,
    countMinQuestions: settings.triviaCountMinQuestions,
    countMaxQuestions: settings.triviaCountMaxQuestions,
    firstQuestionDelayMeters: settings.triviaFirstQuestionDelayMeters,
    enabled: settings.triviaEnabled,
  });

  const currentTriviaDescription = getTriviaTimingDescription({
    type: settings.triviaTriggerType,
    distanceMinMeters: settings.triviaDistanceMinMeters,
    distanceMaxMeters: settings.triviaDistanceMaxMeters,
    timeMinSeconds: settings.triviaTimeMinSeconds,
    timeMaxSeconds: settings.triviaTimeMaxSeconds,
    countMinQuestions: settings.triviaCountMinQuestions,
    countMaxQuestions: settings.triviaCountMaxQuestions,
    firstQuestionDelayMeters: settings.triviaFirstQuestionDelayMeters,
    enabled: settings.triviaEnabled,
  });

  const handleSaveTriviaConfig = () => {
    const errors = validateTriviaConfig(localConfig);
    if (errors.length > 0) {
      Alert.alert('Invalid Configuration', errors.join('\n'));
      return;
    }

    // Save to settings store
    settings.setTriviaTriggerType(localConfig.type);
    settings.setTriviaDistanceRange(localConfig.distanceMinMeters, localConfig.distanceMaxMeters);
    settings.setTriviaTimeRange(localConfig.timeMinSeconds, localConfig.timeMaxSeconds);
    settings.setTriviaCountRange(localConfig.countMinQuestions, localConfig.countMaxQuestions);
    settings.setTriviaFirstQuestionDelay(localConfig.firstQuestionDelayMeters);
    settings.setTriviaEnabled(localConfig.enabled);

    setShowTriviaDialog(false);
    Alert.alert('Settings Saved', 'Trivia timing configuration has been updated.');
  };

  const handleLoadPreset = (presetName: keyof typeof TRIVIA_TIMING_PRESETS) => {
    const preset = TRIVIA_TIMING_PRESETS[presetName];
    setLocalConfig(preset);
    setShowPresetDialog(false);
  };

  const handleStravaConnect = async () => {
    try {
      // This will open the browser for OAuth
      await stravaService.authenticateWithStrava();
      
      // Show instructions for manual code entry
      Alert.alert(
        'Strava Authorization',
        'After authorizing in the browser:\n\n1. Copy the "code" value from the JSON response\n2. Come back to this app\n3. Click "Enter Code" to paste it',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enter Code', 
            onPress: () => {
              setAuthCode('');
              setShowCodeDialog(true);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'An error occurred while connecting to Strava.');
      console.error('Strava connection error:', error);
    }
  };

  const handleSubmitAuthCode = async () => {
    if (!authCode.trim()) {
      Alert.alert('Error', 'Please enter a valid authorization code.');
      return;
    }

    try {
      setShowCodeDialog(false);
      const success = await stravaService.completeOAuthWithCode(authCode.trim());
      if (success) {
        Alert.alert('Success', 'Connected to Strava successfully!');
        setAuthCode('');
      } else {
        Alert.alert('Failed', 'Invalid authorization code. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to complete Strava connection.');
      console.error('Manual OAuth error:', error);
    }
  };

  const handleStravaDisconnect = async () => {
    Alert.alert(
      'Disconnect Strava',
      'Are you sure you want to disconnect from Strava?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await stravaService.disconnectStrava();
            Alert.alert('Disconnected', 'Successfully disconnected from Strava.');
          },
        },
      ]
    );
  };

  const renderTriviaTimingDialog = () => (
    <Portal>
      <Dialog visible={showTriviaDialog} onDismiss={() => setShowTriviaDialog(false)}>
        <Dialog.Title>Trivia Timing Configuration</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView style={{ maxHeight: 400 }}>
            <View style={{ padding: 20 }}>
              {/* Enable/Disable Trivia */}
              <List.Item
                title="Enable Trivia Questions"
                left={() => <List.Icon icon="help-circle" />}
                right={() => (
                  <Switch
                    value={localConfig.enabled}
                    onValueChange={(enabled) => setLocalConfig(prev => ({ ...prev, enabled }))}
                  />
                )}
              />
              
              <Divider style={{ marginVertical: 16 }} />
              
              {/* Trigger Type Selection */}
              <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                Trigger Type
              </Text>
              <SegmentedButtons
                value={localConfig.type}
                onValueChange={(type) => setLocalConfig(prev => ({ ...prev, type: type as any }))}
                buttons={[
                  { value: 'distance', label: 'Distance' },
                  { value: 'time', label: 'Time' },
                  { value: 'count', label: 'Count' },
                ]}
                style={{ marginBottom: 16 }}
              />
              
              {/* Distance Configuration */}
              {localConfig.type === 'distance' && (
                <Card style={{ padding: 16, marginBottom: 16 }}>
                  <Text variant="titleSmall" style={{ marginBottom: 12 }}>
                    Distance Range (meters)
                  </Text>
                  <TextInput
                    label="Minimum Distance"
                    value={localConfig.distanceMinMeters.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setLocalConfig(prev => ({ ...prev, distanceMinMeters: value }));
                    }}
                    keyboardType="numeric"
                    style={{ marginBottom: 8 }}
                  />
                  <TextInput
                    label="Maximum Distance"
                    value={localConfig.distanceMaxMeters.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setLocalConfig(prev => ({ ...prev, distanceMaxMeters: value }));
                    }}
                    keyboardType="numeric"
                  />
                  <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                    Questions will appear every {(localConfig.distanceMinMeters / 1000).toFixed(1)}-{(localConfig.distanceMaxMeters / 1000).toFixed(1)} km
                  </Text>
                </Card>
              )}
              
              {/* Time Configuration */}
              {localConfig.type === 'time' && (
                <Card style={{ padding: 16, marginBottom: 16 }}>
                  <Text variant="titleSmall" style={{ marginBottom: 12 }}>
                    Time Range (seconds)
                  </Text>
                  <TextInput
                    label="Minimum Time"
                    value={localConfig.timeMinSeconds.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setLocalConfig(prev => ({ ...prev, timeMinSeconds: value }));
                    }}
                    keyboardType="numeric"
                    style={{ marginBottom: 8 }}
                  />
                  <TextInput
                    label="Maximum Time"
                    value={localConfig.timeMaxSeconds.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 0;
                      setLocalConfig(prev => ({ ...prev, timeMaxSeconds: value }));
                    }}
                    keyboardType="numeric"
                  />
                  <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                    Questions will appear every {Math.floor(localConfig.timeMinSeconds / 60)}-{Math.floor(localConfig.timeMaxSeconds / 60)} minutes
                  </Text>
                </Card>
              )}
              
              {/* Count Configuration */}
              {localConfig.type === 'count' && (
                <Card style={{ padding: 16, marginBottom: 16 }}>
                  <Text variant="titleSmall" style={{ marginBottom: 12 }}>
                    Question Count Range
                  </Text>
                  <TextInput
                    label="Minimum Questions"
                    value={localConfig.countMinQuestions.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 1;
                      setLocalConfig(prev => ({ ...prev, countMinQuestions: value }));
                    }}
                    keyboardType="numeric"
                    style={{ marginBottom: 8 }}
                  />
                  <TextInput
                    label="Maximum Questions"
                    value={localConfig.countMaxQuestions.toString()}
                    onChangeText={(text) => {
                      const value = parseInt(text) || 1;
                      setLocalConfig(prev => ({ ...prev, countMaxQuestions: value }));
                    }}
                    keyboardType="numeric"
                  />
                  <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                    New questions will appear after answering {localConfig.countMinQuestions}-{localConfig.countMaxQuestions} questions
                  </Text>
                </Card>
              )}
              
              {/* First Question Delay */}
              <Card style={{ padding: 16, marginBottom: 16 }}>
                <Text variant="titleSmall" style={{ marginBottom: 12 }}>
                  First Question Delay
                </Text>
                <TextInput
                  label="Distance before first question (meters)"
                  value={localConfig.firstQuestionDelayMeters.toString()}
                  onChangeText={(text) => {
                    const value = parseInt(text) || 0;
                    setLocalConfig(prev => ({ ...prev, firstQuestionDelayMeters: value }));
                  }}
                  keyboardType="numeric"
                />
                <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}>
                  First question will appear after {(localConfig.firstQuestionDelayMeters / 1000).toFixed(1)} km
                </Text>
              </Card>
              
              {/* Presets */}
              <Text variant="titleMedium" style={{ marginBottom: 12 }}>
                Quick Presets
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Chip onPress={() => handleLoadPreset('testing')}>Testing</Chip>
                <Chip onPress={() => handleLoadPreset('beginner')}>Beginner</Chip>
                <Chip onPress={() => handleLoadPreset('intermediate')}>Intermediate</Chip>
                <Chip onPress={() => handleLoadPreset('advanced')}>Advanced</Chip>
              </View>
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => setShowTriviaDialog(false)}>Cancel</Button>
          <Button onPress={handleSaveTriviaConfig}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      
      <ScrollView style={{ flex: 1 }}>
        {/* YouTube Demo Controls - Only shows when DEMO_MODE is enabled */}
        <YoutubeDemoControls />
        
        {/* Trivia Settings Section */}
        <List.Section>
          <List.Subheader>Trivia Questions</List.Subheader>
          
          <List.Item
            title="Enable Trivia Questions"
            description="Show trivia questions during runs"
            left={() => <List.Icon icon="help-circle" />}
            right={() => (
              <Switch
                value={settings.triviaEnabled}
                onValueChange={settings.setTriviaEnabled}
              />
            )}
          />
          
          <List.Item
            title="Trivia Timing"
            description={currentTriviaDescription}
            left={() => <List.Icon icon="timer" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => setShowTriviaDialog(true)}
            disabled={!settings.triviaEnabled}
          />
          
          <List.Item
            title="Question Timeout"
            description={`${settings.triviaTimeoutSeconds} seconds`}
            left={() => <List.Icon icon="clock-outline" />}
            right={() => <List.Icon icon="chevron-right" />}
            disabled={!settings.triviaEnabled}
          />
          
          <List.Item
            title="Wrong Answer Penalty"
            description={`${settings.penaltySecondsPerWrongAnswer} seconds`}
            left={() => <List.Icon icon="timer-minus" />}
            right={() => <List.Icon icon="chevron-right" />}
            disabled={!settings.triviaEnabled}
          />
        </List.Section>
        
        <Divider />
        
        {/* Audio Settings Section */}
        <List.Section>
          <List.Subheader>Audio & Speech</List.Subheader>
          
          <List.Item
            title="Speech Announcements"
            description="Enable voice announcements"
            left={() => <List.Icon icon="volume-high" />}
            right={() => (
              <Switch
                value={settings.speechEnabled}
                onValueChange={settings.setSpeechEnabled}
              />
            )}
          />
          
          <List.Item
            title="Haptic Feedback"
            description="Enable vibration feedback"
            left={() => <List.Icon icon="vibrate" />}
            right={() => (
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={settings.setHapticsEnabled}
              />
            )}
          />
        </List.Section>
        
        <Divider />
        
        {/* Units Settings Section */}
        <List.Section>
          <List.Subheader>Units & Display</List.Subheader>
          
          <List.Item
            title="Units"
            description={settings.units === 'metric' ? 'Metric (km, kg)' : 'Imperial (miles, lbs)'}
            left={() => <List.Icon icon="ruler" />}
            right={() => <List.Icon icon="chevron-right" />}
          />
          
          <List.Item
            title="Keep Screen Awake"
            description="Prevent screen from turning off during runs"
            left={() => <List.Icon icon="brightness-6" />}
            right={() => (
              <Switch
                value={settings.keepScreenAwake}
                onValueChange={settings.setKeepScreenAwake}
              />
            )}
          />
        </List.Section>
        
        <Divider />
        
        {/* Strava Integration Section */}
        <List.Section>
          <List.Subheader>Strava Integration</List.Subheader>
          
          {settings.stravaConnected ? (
            <>
              <List.Item
                title="Connected to Strava"
                description={settings.stravaAthleteName || 'Connected'}
                left={() => <List.Icon icon="check-circle" color={theme.colors.success} />}
                right={() => <List.Icon icon="chevron-right" />}
                onPress={handleStravaDisconnect}
              />
              
              <List.Item
                title="Auto-Upload Runs"
                description="Automatically upload completed runs to Strava"
                left={() => <List.Icon icon="cloud-upload" />}
                right={() => (
                  <Switch
                    value={settings.autoUploadToStrava}
                    onValueChange={settings.setAutoUploadToStrava}
                  />
                )}
              />
            </>
          ) : (
            <List.Item
              title="Connect to Strava"
              description="Link your Strava account to automatically upload runs"
              left={() => <List.Icon icon="link-variant" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={handleStravaConnect}
            />
          )}
        </List.Section>
        
        <Divider />
        
        {/* Strava Integration Section */}
        <List.Section>
          <List.Subheader>Strava Integration</List.Subheader>
          
          {settings.stravaConnected ? (
            <>
              <List.Item
                title="Connected to Strava"
                description={settings.stravaAthleteName || 'Connected'}
                left={() => <List.Icon icon="check-circle" color={theme.colors.success} />}
                right={() => <List.Icon icon="chevron-right" />}
                onPress={handleStravaDisconnect}
              />
              
              <List.Item
                title="Auto-Upload Runs"
                description="Automatically upload completed runs to Strava"
                left={() => <List.Icon icon="cloud-upload" />}
                right={() => (
                  <Switch
                    value={settings.autoUploadToStrava}
                    onValueChange={settings.setAutoUploadToStrava}
                  />
                )}
              />
            </>
          ) : (
            <List.Item
              title="Connect to Strava"
              description="Link your Strava account to automatically upload runs"
              left={() => <List.Icon icon="link-variant" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={handleStravaConnect}
            />
          )}
        </List.Section>
        
        <Divider />
        
        {/* Reset Section */}
        <List.Section>
          <List.Subheader>Reset</List.Subheader>
          
          <List.Item
            title="Reset to Defaults"
            description="Reset all settings to default values"
            left={() => <List.Icon icon="restore" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => {
              Alert.alert(
                'Reset Settings',
                'Are you sure you want to reset all settings to their default values?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Reset', 
                    style: 'destructive',
                    onPress: () => {
                      settings.resetToDefaults();
                      Alert.alert('Settings Reset', 'All settings have been reset to default values.');
                    }
                  },
                ]
              );
            }}
          />
        </List.Section>
      </ScrollView>
      
      {renderTriviaTimingDialog()}
      
      {/* Strava Authorization Code Dialog */}
      <Portal>
        <Dialog visible={showCodeDialog} onDismiss={() => setShowCodeDialog(false)}>
          <Dialog.Title>Enter Strava Authorization Code</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 16 }}>
              Paste the authorization code from the browser:
            </Text>
            <TextInput
              mode="outlined"
              value={authCode}
              onChangeText={setAuthCode}
              placeholder="Enter authorization code here..."
              multiline
              autoFocus
              style={{ minHeight: 60 }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCodeDialog(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSubmitAuthCode}>
              Connect
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}