import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { BigButton } from '../components/BigButton';
import {
    CaloriesStatCard,
    DistanceStatCard,
    PaceStatCard
} from '../components/StatCard';
import { useRunStore } from '../state/useRunStore';
import { useSettingsStore } from '../state/useSettingsStore';
import { theme } from '../theme';
import { formatElapsedTime, formatTimeWithPenalty } from '../utils/time';

interface SummaryScreenProps {
  navigation: any;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ navigation }) => {
  const { currentRun, resetRun } = useRunStore();
  const { units } = useSettingsStore();
  
  if (!currentRun) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>No run data available</Text>
          <BigButton
            title="Back to Home"
            onPress={() => navigation.navigate('Run')}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }
  
  const handleNewRun = () => {
    resetRun();
    navigation.navigate('Run');
  };
  
  const handleSaveLocally = () => {
    // TODO: Implement local save
    console.log('Save locally');
  };
  
  const handleUploadToStrava = () => {
    // TODO: Implement Strava upload
    navigation.navigate('StravaAuth');
  };
  
  const handleShare = () => {
    // TODO: Implement sharing
    console.log('Share summary');
  };
  
  const timeDetails = formatTimeWithPenalty(
    currentRun.elapsedSeconds,
    currentRun.totalPenaltySeconds
  );
  
  const correctAnswers = currentRun.triviaResults.filter(r => r.correct).length;
  const totalQuestions = currentRun.triviaResults.length;
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : '0';
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Surface style={styles.headerCard} elevation={2}>
          <Text style={styles.headerTitle}>🏁 Run Complete!</Text>
          <Text style={styles.headerSubtitle}>Great job on your trivia run!</Text>
        </Surface>
        
        {/* Main Stats */}
        <View style={styles.mainStatsSection}>
          <Text style={styles.sectionTitle}>Performance</Text>
          
          <DistanceStatCard
            distanceMeters={currentRun.totalDistanceMeters}
            unit={units}
            size="large"
            variant="accent"
          />
          
          <View style={styles.timeBreakdown}>
            <Surface style={styles.timeCard} elevation={1}>
              <Text style={styles.timeLabel}>Running Time</Text>
              <Text style={styles.timeValue}>{timeDetails.base}</Text>
            </Surface>
            
            {currentRun.totalPenaltySeconds > 0 && (
              <Surface style={styles.timeCard} elevation={1}>
                <Text style={styles.timeLabel}>Penalty Time</Text>
                <Text style={[styles.timeValue, { color: theme.colors.error }]}>
                  {timeDetails.penalty}
                </Text>
              </Surface>
            )}
            
            <Surface style={styles.timeCard} elevation={1}>
              <Text style={styles.timeLabel}>Final Time</Text>
              <Text style={[styles.timeValue, { color: theme.colors.primary }]}>
                {timeDetails.total}
              </Text>
            </Surface>
          </View>
          
          <View style={styles.statRow}>
            <PaceStatCard
              distanceMeters={currentRun.totalDistanceMeters}
              timeSeconds={currentRun.elapsedSeconds}
              unit={units}
              label="Average Pace"
              size="medium"
            />
          </View>
          
          <View style={styles.statRow}>
            <CaloriesStatCard
              calories={currentRun.calories}
              size="medium"
            />
          </View>
        </View>
        
        {/* Trivia Stats */}
        {currentRun.triviaResults.length > 0 && (
          <View style={styles.triviaSection}>
            <Text style={styles.sectionTitle}>Trivia Challenge</Text>
            
            <Surface style={styles.triviaCard} elevation={2}>
              <View style={styles.triviaStatsGrid}>
                <View style={styles.triviaStat}>
                  <Text style={styles.triviaStatValue}>{totalQuestions}</Text>
                  <Text style={styles.triviaStatLabel}>Questions</Text>
                </View>
                
                <View style={styles.triviaStat}>
                  <Text style={[styles.triviaStatValue, { color: theme.colors.success }]}>
                    {correctAnswers}
                  </Text>
                  <Text style={styles.triviaStatLabel}>Correct</Text>
                </View>
                
                <View style={styles.triviaStat}>
                  <Text style={[styles.triviaStatValue, { color: theme.colors.primary }]}>
                    {accuracy}%
                  </Text>
                  <Text style={styles.triviaStatLabel}>Accuracy</Text>
                </View>
              </View>
              
              {currentRun.totalPenaltySeconds > 0 && (
                <View style={styles.penaltySection}>
                  <Text style={styles.penaltyText}>
                    Total Penalty: {formatElapsedTime(currentRun.totalPenaltySeconds)}
                  </Text>
                </View>
              )}
            </Surface>
          </View>
        )}
        
        {/* Actions */}
        <View style={styles.actionsSection}>
          <BigButton
            title="New Run"
            onPress={handleNewRun}
            variant="primary"
            size="large"
            icon="play"
          />
          
          <View style={styles.secondaryActions}>
            <BigButton
              title="Save Locally"
              onPress={handleSaveLocally}
              variant="secondary"
              size="medium"
              icon="save"
            />
            
            <BigButton
              title="Upload to Strava"
              onPress={handleUploadToStrava}
              variant="secondary"
              size="medium"
              icon="upload"
            />
          </View>
          
          <BigButton
            title="Share Summary"
            onPress={handleShare}
            variant="secondary"
            size="medium"
            icon="share"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.screen.padding,
  },
  errorText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.error,
    marginBottom: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.screen.padding,
    paddingBottom: theme.spacing.xxxl,
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.card.borderRadius,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    ...theme.typography.headlineLarge,
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  mainStatsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.headlineSmall,
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  timeBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  timeCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.card.borderRadius,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  timeLabel: {
    ...theme.typography.labelMedium,
    color: theme.colors.onSurfaceVariant,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  timeValue: {
    ...theme.typography.titleLarge,
    color: theme.colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
  },
  statRow: {
    marginVertical: theme.spacing.sm,
  },
  triviaSection: {
    marginBottom: theme.spacing.xl,
  },
  triviaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.card.borderRadius,
    padding: theme.spacing.lg,
  },
  triviaStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  triviaStat: {
    alignItems: 'center',
  },
  triviaStatValue: {
    ...theme.typography.displaySmall,
    color: theme.colors.onSurface,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  triviaStatLabel: {
    ...theme.typography.labelMedium,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  penaltySection: {
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    alignItems: 'center',
  },
  penaltyText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.error,
    textAlign: 'center',
  },
  actionsSection: {
    marginTop: theme.spacing.lg,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
});