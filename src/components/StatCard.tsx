import React from 'react';
import { AccessibilityRole, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { shadows, theme } from '../theme';
import { formatPaceWithUnits } from '../utils/pace';
import { formatElapsedTime, formatTimeWithUnits } from '../utils/time';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  variant = 'primary',
  size = 'medium',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const styles = createStyles(variant, size);
  
  const displayValue = typeof value === 'number' ? value.toFixed(2) : value;
  const accessibilityText = accessibilityLabel || `${title}: ${displayValue}${unit ? ` ${unit}` : ''}${subtitle ? `, ${subtitle}` : ''}`;
  
  return (
    <Card
      style={styles.card}
      contentStyle={styles.cardContent}
      accessible={true}
      accessibilityRole={"text" as AccessibilityRole}
      accessibilityLabel={accessibilityText}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.container}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          
          <View style={styles.valueContainer}>
            <Text style={styles.value} numberOfLines={1}>
              {displayValue}
            </Text>
            {unit && (
              <Text style={styles.unit} numberOfLines={1}>
                {unit}
              </Text>
            )}
          </View>
          
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

const createStyles = (variant: 'primary' | 'secondary' | 'accent', size: 'small' | 'medium' | 'large') => {
  const isLarge = size === 'large';
  const isSmall = size === 'small';
  
  let backgroundColor = theme.colors.surface;
  let titleColor: string = theme.colors.onSurfaceVariant;
  let valueColor: string = theme.colors.onSurface;
  
  if (variant === 'accent') {
    backgroundColor = theme.colors.primary + '20'; // 20% opacity
    titleColor = theme.colors.primary;
    valueColor = theme.colors.primary;
  }
  
  return StyleSheet.create({
    card: {
      backgroundColor,
      marginVertical: isSmall ? theme.spacing.xs : theme.spacing.sm,
      marginHorizontal: theme.spacing.xs,
      borderRadius: theme.spacing.card.borderRadius,
      ...shadows.small,
    },
    cardContent: {
      padding: isSmall ? theme.spacing.sm : isLarge ? theme.spacing.lg : theme.spacing.md,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      marginRight: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      ...theme.typography.labelMedium,
      color: titleColor,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    valueContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
    },
    value: {
      ...(isLarge ? theme.typography.displayMedium : isSmall ? theme.typography.headlineSmall : theme.typography.headlineLarge),
      color: valueColor,
      fontWeight: '700',
      textAlign: 'center',
    },
    unit: {
      ...theme.typography.titleMedium,
      color: titleColor,
      marginLeft: theme.spacing.xs,
      fontWeight: '500',
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: titleColor,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
  });
};

// Specialized stat cards for common use cases
interface TimeStatCardProps {
  elapsedSeconds: number;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  showUnits?: boolean;
}

export const TimeStatCard: React.FC<TimeStatCardProps> = ({
  elapsedSeconds,
  variant = 'primary',
  size = 'medium',
  showUnits = false,
}) => {
  const formattedTime = showUnits 
    ? formatTimeWithUnits(elapsedSeconds)
    : formatElapsedTime(elapsedSeconds);
  
  return (
    <StatCard
      title="Time"
      value={formattedTime}
      variant={variant}
      size={size}
      accessibilityLabel={`Elapsed time: ${formattedTime}`}
    />
  );
};

interface DistanceStatCardProps {
  distanceMeters: number;
  unit?: 'metric' | 'imperial';
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

export const DistanceStatCard: React.FC<DistanceStatCardProps> = ({
  distanceMeters,
  unit = 'metric',
  variant = 'primary',
  size = 'medium',
}) => {
  const distance = unit === 'imperial' 
    ? (distanceMeters * 0.000621371).toFixed(2)
    : (distanceMeters / 1000).toFixed(2);
  const unitLabel = unit === 'imperial' ? 'mi' : 'km';
  
  return (
    <StatCard
      title="Distance"
      value={distance}
      unit={unitLabel}
      variant={variant}
      size={size}
      accessibilityLabel={`Distance: ${distance} ${unitLabel}`}
    />
  );
};

interface PaceStatCardProps {
  distanceMeters: number;
  timeSeconds: number;
  unit?: 'metric' | 'imperial';
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  label?: string;
}

export const PaceStatCard: React.FC<PaceStatCardProps> = ({
  distanceMeters,
  timeSeconds,
  unit = 'metric',
  variant = 'primary',
  size = 'medium',
  label = 'Pace',
}) => {
  const pace = formatPaceWithUnits(distanceMeters, timeSeconds, unit);
  
  return (
    <StatCard
      title={label}
      value={pace}
      variant={variant}
      size={size}
      accessibilityLabel={`${label}: ${pace}`}
    />
  );
};

interface CaloriesStatCardProps {
  calories: number;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

export const CaloriesStatCard: React.FC<CaloriesStatCardProps> = ({
  calories,
  variant = 'primary',
  size = 'medium',
}) => {
  return (
    <StatCard
      title="Calories"
      value={calories.toString()}
      unit="cal"
      variant={variant}
      size={size}
      accessibilityLabel={`Calories burned: ${calories}`}
    />
  );
};

interface PenaltyStatCardProps {
  penaltySeconds: number;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
}

export const PenaltyStatCard: React.FC<PenaltyStatCardProps> = ({
  penaltySeconds,
  variant = 'accent',
  size = 'medium',
}) => {
  const formattedPenalty = formatElapsedTime(penaltySeconds);
  
  return (
    <StatCard
      title="Penalty"
      value={formattedPenalty}
      variant={variant}
      size={size}
      accessibilityLabel={`Time penalty: ${formattedPenalty}`}
    />
  );
};