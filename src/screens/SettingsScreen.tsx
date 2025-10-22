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
    </SafeAreaView>
  );
}