import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    AccessibilityRole,
    Dimensions,
    Modal,
    SafeAreaView,
    StyleSheet,
    View,
} from 'react-native';
import { ProgressBar, Surface, Text } from 'react-native-paper';
import { speechService } from '../services/speech';
import { getCategoryEmoji, getDifficultyColor } from '../services/trivia';
import { TriviaQuestion } from '../state/useRunStore';
import { useSettingsStore } from '../state/useSettingsStore';
import { shadows, theme } from '../theme';
import { SkipTriviaButton, TriviaAnswerButton } from './BigButton';

interface TriviaModalProps {
  visible: boolean;
  question: TriviaQuestion | null;
  timeoutSeconds: number;
  onAnswer: (selectedIndex: number, timeToAnswer: number) => void;
  onSkip: () => void;
  onTimeout: () => void;
  onDismiss?: () => void;
}

export const TriviaModal: React.FC<TriviaModalProps> = ({
  visible,
  question,
  timeoutSeconds,
  onAnswer,
  onSkip,
  onTimeout,
  onDismiss,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(timeoutSeconds);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [hasSpoken, setHasSpoken] = useState(false);
  
  const { speechEnabled, hapticsEnabled } = useSettingsStore();
  
  // Timer effect
  useEffect(() => {
    if (!visible || !question) {
      setTimeRemaining(timeoutSeconds);
      setStartTime(null);
      setHasSpoken(false);
      return;
    }
    
    setStartTime(Date.now());
    setTimeRemaining(timeoutSeconds);
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [visible, question, timeoutSeconds, onTimeout]);
  
  // Speech effect
  useEffect(() => {
    if (visible && question && speechEnabled && !hasSpoken) {
      setHasSpoken(true);
      speechService.speakTriviaQuestion(question.question, question.options);
    }
  }, [visible, question, speechEnabled, hasSpoken]);
  
  // Haptic feedback when modal appears
  useEffect(() => {
    if (visible && question && hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [visible, question, hapticsEnabled]);
  
  const handleAnswer = async (selectedIndex: number) => {
    if (!startTime) return;
    
    const timeToAnswer = Math.floor((Date.now() - startTime) / 1000);
    
    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    onAnswer(selectedIndex, timeToAnswer);
  };
  
  const handleSkip = async () => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onSkip();
  };
  
  if (!visible || !question) {
    return null;
  }
  
  const progress = 1 - (timeRemaining / timeoutSeconds);
  const progressColor = timeRemaining <= 10 ? theme.colors.error : theme.colors.primary;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onDismiss}
      accessible={true}
      accessibilityLabel="Trivia question modal"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.backdrop}>
          <Surface style={styles.modal} elevation={5}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryEmoji}>
                  {getCategoryEmoji(question.category)}
                </Text>
                <Text style={styles.categoryText}>
                  {question.category.toUpperCase()}
                </Text>
              </View>
              
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(question.difficulty) + '20' }
                ]}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    { color: getDifficultyColor(question.difficulty) }
                  ]}
                >
                  {question.difficulty.toUpperCase()}
                </Text>
              </View>
            </View>
            
            {/* Timer */}
            <View style={styles.timerContainer}>
              <View style={styles.timerInfo}>
                <MaterialIcons
                  name="timer"
                  size={20}
                  color={progressColor}
                  style={styles.timerIcon}
                />
                <Text style={[styles.timerText, { color: progressColor }]}>
                  {timeRemaining}s
                </Text>
              </View>
              <ProgressBar
                progress={progress}
                color={progressColor}
                style={styles.progressBar}
              />
            </View>
            
            {/* Question */}
            <View style={styles.questionContainer}>
              <Text
                style={styles.questionText}
                accessible={true}
                accessibilityRole={"text" as AccessibilityRole}
                accessibilityLabel={`Question: ${question.question}`}
              >
                {question.question}
              </Text>
            </View>
            
            {/* Options */}
            <View style={styles.optionsContainer}>
              {question.options.map((option, index) => (
                <TriviaAnswerButton
                  key={index}
                  option={option}
                  index={index}
                  onPress={handleAnswer}
                  disabled={timeRemaining <= 0}
                />
              ))}
            </View>
            
            {/* Actions */}
            <View style={styles.actionsContainer}>
              <SkipTriviaButton
                onPress={handleSkip}
                disabled={timeRemaining <= 0}
              />
            </View>
          </Surface>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.modal.borderRadius,
    padding: theme.spacing.modal.padding,
    maxWidth: Math.min(screenWidth - 40, 400),
    maxHeight: screenHeight * 0.8,
    width: '100%',
    ...shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  categoryText: {
    ...theme.typography.labelLarge,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  difficultyText: {
    ...theme.typography.labelSmall,
    fontWeight: '600',
  },
  timerContainer: {
    marginBottom: theme.spacing.lg,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  timerIcon: {
    marginRight: theme.spacing.xs,
  },
  timerText: {
    ...theme.typography.titleLarge,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceVariant,
  },
  questionContainer: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  questionText: {
    ...theme.typography.headlineSmall,
    color: theme.colors.onSurface,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: theme.spacing.lg,
  },
  actionsContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
});

// Trivia result feedback modal
interface TriviaResultModalProps {
  visible: boolean;
  correct: boolean;
  correctAnswer?: string;
  explanation?: string;
  penaltySeconds?: number;
  onDismiss: () => void;
}

export const TriviaResultModal: React.FC<TriviaResultModalProps> = ({
  visible,
  correct,
  correctAnswer,
  explanation,
  penaltySeconds = 0,
  onDismiss,
}) => {
  const { hapticsEnabled } = useSettingsStore();
  
  useEffect(() => {
    if (visible && hapticsEnabled) {
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [visible, correct, hapticsEnabled]);
  
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss]);
  
  if (!visible) return null;
  
  const resultColor = correct ? theme.colors.success : theme.colors.error;
  const resultIcon = correct ? 'check-circle' : 'cancel';
  const resultText = correct ? 'Correct!' : 'Incorrect';
  
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.container}>
        <View style={styles.backdrop}>
          <Surface style={[styles.modal, { maxHeight: 'auto' }]} elevation={5}>
            <View style={{ alignItems: 'center', padding: theme.spacing.lg }}>
              <MaterialIcons
                name={resultIcon}
                size={48}
                color={resultColor}
                style={{ marginBottom: theme.spacing.md }}
              />
              
              <Text
                style={[
                  theme.typography.headlineMedium,
                  { color: resultColor, marginBottom: theme.spacing.sm }
                ]}
              >
                {resultText}
              </Text>
              
              {!correct && correctAnswer && (
                <Text
                  style={[
                    theme.typography.bodyMedium,
                    { color: theme.colors.onSurface, textAlign: 'center', marginBottom: theme.spacing.sm }
                  ]}
                >
                  Correct answer: {correctAnswer}
                </Text>
              )}
              
              {!correct && penaltySeconds > 0 && (
                <Text
                  style={[
                    theme.typography.bodyMedium,
                    { color: theme.colors.error, textAlign: 'center', marginBottom: theme.spacing.sm }
                  ]}
                >
                  +{penaltySeconds}s penalty
                </Text>
              )}
              
              {explanation && (
                <Text
                  style={[
                    theme.typography.bodySmall,
                    { color: theme.colors.onSurfaceVariant, textAlign: 'center' }
                  ]}
                >
                  {explanation}
                </Text>
              )}
            </View>
          </Surface>
        </View>
      </View>
    </Modal>
  );
};