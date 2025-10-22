import * as Haptics from 'expo-haptics';
import React from 'react';
import { AccessibilityRole, StyleSheet, ViewStyle } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { shadows, theme } from '../theme';

interface BigButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  hapticFeedback?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const BigButton: React.FC<BigButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  icon,
  style,
  hapticFeedback = true,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const styles = createStyles(variant, size);
  
  const handlePress = async () => {
    if (disabled || loading) return;
    
    if (hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onPress();
  };
  
  const buttonMode = variant === 'secondary' ? 'outlined' : 'contained';
  
  return (
    <Button
      mode={buttonMode}
      onPress={handlePress}
      disabled={disabled || loading}
      loading={loading}
      icon={icon}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      accessible={true}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      <Text style={styles.text}>{title}</Text>
    </Button>
  );
};

const createStyles = (variant: 'primary' | 'secondary' | 'destructive' | 'success', size: 'small' | 'medium' | 'large') => {
  const isLarge = size === 'large';
  const isMedium = size === 'medium';
  const isSmall = size === 'small';
  
  // Size configurations
  let height = 56; // Default large
  let paddingHorizontal: number = theme.spacing.xl;
  let fontSize: number = theme.typography.buttonLarge.fontSize;
  let borderRadius: number = theme.spacing.button.borderRadius;
  
  if (isMedium) {
    height = 48;
    paddingHorizontal = theme.spacing.lg;
    fontSize = theme.typography.button.fontSize;
  } else if (isSmall) {
    height = 40;
    paddingHorizontal = theme.spacing.md;
    fontSize = theme.typography.button.fontSize;
    borderRadius = 16;
  }
  
  // Color configurations
  let backgroundColor: string = theme.colors.primary;
  let textColor: string = theme.colors.onPrimary;
  let borderColor = 'transparent';
  
  switch (variant) {
    case 'secondary':
      backgroundColor = 'transparent';
      textColor = theme.colors.primary;
      borderColor = theme.colors.primary;
      break;
    case 'destructive':
      backgroundColor = theme.colors.error;
      textColor = theme.colors.onPrimary;
      break;
    case 'success':
      backgroundColor = theme.colors.success;
      textColor = theme.colors.onPrimary;
      break;
  }
  
  return StyleSheet.create({
    button: {
      borderRadius,
      marginVertical: theme.spacing.sm,
      ...shadows.medium,
      elevation: variant === 'secondary' ? 0 : 4,
    },
    content: {
      height,
      paddingHorizontal,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      color: textColor,
      fontSize,
      fontWeight: '600',
      letterSpacing: 0.5,
      textTransform: 'none',
    },
    text: {
      color: textColor,
      fontSize,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
  });
};

// Specialized button components for common use cases
interface StartRunButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const StartRunButton: React.FC<StartRunButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
}) => {
  return (
    <BigButton
      title="Start Run"
      onPress={onPress}
      variant="success"
      size="large"
      disabled={disabled}
      loading={loading}
      icon="play"
      accessibilityLabel="Start your trivia run"
      accessibilityHint="Begins GPS tracking and starts the run timer"
    />
  );
};

interface PauseRunButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const PauseRunButton: React.FC<PauseRunButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <BigButton
      title="Pause"
      onPress={onPress}
      variant="secondary"
      size="medium"
      disabled={disabled}
      icon="pause"
      accessibilityLabel="Pause run"
      accessibilityHint="Pauses the run timer and GPS tracking"
    />
  );
};

interface ResumeRunButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const ResumeRunButton: React.FC<ResumeRunButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <BigButton
      title="Resume"
      onPress={onPress}
      variant="success"
      size="medium"
      disabled={disabled}
      icon="play"
      accessibilityLabel="Resume run"
      accessibilityHint="Resumes the run timer and GPS tracking"
    />
  );
};

interface EndRunButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const EndRunButton: React.FC<EndRunButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <BigButton
      title="End Run"
      onPress={onPress}
      variant="destructive"
      size="medium"
      disabled={disabled}
      icon="stop"
      accessibilityLabel="End run"
      accessibilityHint="Stops the run and shows summary"
    />
  );
};

interface TriviaAnswerButtonProps {
  option: string;
  index: number;
  onPress: (index: number) => void;
  disabled?: boolean;
}

export const TriviaAnswerButton: React.FC<TriviaAnswerButtonProps> = ({
  option,
  index,
  onPress,
  disabled = false,
}) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D
  
  return (
    <BigButton
      title={`${letter}. ${option}`}
      onPress={() => onPress(index)}
      variant="secondary"
      size="medium"
      disabled={disabled}
      style={{ marginVertical: theme.spacing.xs }}
      accessibilityLabel={`Option ${letter}: ${option}`}
      accessibilityHint="Select this answer for the trivia question"
    />
  );
};

interface SkipTriviaButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const SkipTriviaButton: React.FC<SkipTriviaButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <BigButton
      title="Skip (Safety)"
      onPress={onPress}
      variant="secondary"
      size="small"
      disabled={disabled}
      icon="skip-next"
      accessibilityLabel="Skip trivia question"
      accessibilityHint="Skip this question for safety reasons, no penalty applied"
    />
  );
};