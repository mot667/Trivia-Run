import React from 'react';
import { View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { useSettingsStore } from '../state/useSettingsStore';
import { theme } from '../theme';
import { getTriviaTimingDescription } from '../utils/trivia-timing';

interface TriviaConfigDisplayProps {
  style?: any;
  compact?: boolean;
}

export default function TriviaConfigDisplay({ style, compact = false }: TriviaConfigDisplayProps) {
  const settings = useSettingsStore();
  
  if (!settings.triviaEnabled) {
    return (
      <View style={[{ alignItems: 'center' }, style]}>
        <Chip
          icon="help-circle-outline"
          textStyle={{ fontSize: 12 }}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        >
          Trivia Disabled
        </Chip>
      </View>
    );
  }

  const description = getTriviaTimingDescription({
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

  const getIcon = () => {
    switch (settings.triviaTriggerType) {
      case 'distance':
        return 'map-marker-distance';
      case 'time':
        return 'clock-outline';
      case 'count':
        return 'numeric';
      default:
        return 'help-circle';
    }
  };

  if (compact) {
    return (
      <View style={[{ alignItems: 'center' }, style]}>
        <Chip
          icon={getIcon()}
          textStyle={{ fontSize: 12 }}
          style={{ backgroundColor: theme.colors.primary + '20' }}
        >
          {description}
        </Chip>
      </View>
    );
  }

  return (
    <View style={[{ alignItems: 'center', padding: 8 }, style]}>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
        Trivia Timing
      </Text>
      <Chip
        icon={getIcon()}
        textStyle={{ fontSize: 12 }}
        style={{ backgroundColor: theme.colors.primary + '20' }}
      >
        {description}
      </Chip>
    </View>
  );
}