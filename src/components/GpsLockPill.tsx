import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { AccessibilityRole, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { GPSStatus } from '../state/useRunStore';
import { theme } from '../theme';

interface GpsLockPillProps {
  status: GPSStatus;
  accuracy?: number;
  style?: any;
}

export const GpsLockPill: React.FC<GpsLockPillProps> = ({
  status,
  accuracy,
  style,
}) => {
  const styles = createStyles(status);
  
  const getStatusInfo = () => {
    switch (status) {
      case 'good':
        return {
          icon: 'gps-fixed' as const,
          text: 'GPS Connected',
          accessibilityLabel: 'GPS signal is strong',
        };
      case 'medium':
        return {
          icon: 'gps-not-fixed' as const,
          text: 'GPS Weak',
          accessibilityLabel: 'GPS signal is weak',
        };
      case 'poor':
        return {
          icon: 'gps-off' as const,
          text: 'GPS Poor',
          accessibilityLabel: 'GPS signal is poor',
        };
      case 'disabled':
        return {
          icon: 'location-disabled' as const,
          text: 'GPS Disabled',
          accessibilityLabel: 'GPS is disabled',
        };
      default:
        return {
          icon: 'gps-off' as const,
          text: 'GPS Unknown',
          accessibilityLabel: 'GPS status unknown',
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  const accuracyText = accuracy ? ` (±${Math.round(accuracy)}m)` : '';
  const fullAccessibilityLabel = `${statusInfo.accessibilityLabel}${accuracyText}`;
  
  return (
    <Surface
      style={[styles.container, style]}
      elevation={2}
      accessible={true}
      accessibilityRole={"text" as AccessibilityRole}
      accessibilityLabel={fullAccessibilityLabel}
    >
      <View style={styles.content}>
        <MaterialIcons
          name={statusInfo.icon}
          size={16}
          color={styles.icon.color}
          style={styles.iconStyle}
        />
        <Text style={styles.text} numberOfLines={1}>
          {statusInfo.text}
          {accuracyText}
        </Text>
      </View>
    </Surface>
  );
};

const createStyles = (status: GPSStatus) => {
  let backgroundColor: string;
  let textColor: string;
  let iconColor: string;
  
  switch (status) {
    case 'good':
      backgroundColor = theme.colors.gpsGood + '20';
      textColor = theme.colors.gpsGood;
      iconColor = theme.colors.gpsGood;
      break;
    case 'medium':
      backgroundColor = theme.colors.gpsMedium + '20';
      textColor = theme.colors.gpsMedium;
      iconColor = theme.colors.gpsMedium;
      break;
    case 'poor':
      backgroundColor = theme.colors.gpsPoor + '20';
      textColor = theme.colors.gpsPoor;
      iconColor = theme.colors.gpsPoor;
      break;
    case 'disabled':
      backgroundColor = theme.colors.onSurfaceVariant + '20';
      textColor = theme.colors.onSurfaceVariant;
      iconColor = theme.colors.onSurfaceVariant;
      break;
    default:
      backgroundColor = theme.colors.onSurfaceVariant + '20';
      textColor = theme.colors.onSurfaceVariant;
      iconColor = theme.colors.onSurfaceVariant;
      break;
  }
  
  return StyleSheet.create({
    container: {
      backgroundColor,
      borderRadius: 20,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      alignSelf: 'flex-start',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconStyle: {
      marginRight: theme.spacing.xs,
    },
    icon: {
      color: iconColor,
    },
    text: {
      ...theme.typography.labelMedium,
      color: textColor,
      fontWeight: '500',
    },
  });
};

// Alternative compact version for smaller spaces
interface CompactGpsIndicatorProps {
  status: GPSStatus;
  size?: number;
}

export const CompactGpsIndicator: React.FC<CompactGpsIndicatorProps> = ({
  status,
  size = 20,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return theme.colors.gpsGood;
      case 'medium':
        return theme.colors.gpsMedium;
      case 'poor':
        return theme.colors.gpsPoor;
      case 'disabled':
        return theme.colors.onSurfaceVariant;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'good':
        return 'gps-fixed';
      case 'medium':
        return 'gps-not-fixed';
      case 'poor':
        return 'gps-off';
      case 'disabled':
        return 'location-disabled';
      default:
        return 'gps-off';
    }
  };
  
  const getAccessibilityLabel = () => {
    switch (status) {
      case 'good':
        return 'GPS signal strong';
      case 'medium':
        return 'GPS signal weak';
      case 'poor':
        return 'GPS signal poor';
      case 'disabled':
        return 'GPS disabled';
      default:
        return 'GPS status unknown';
    }
  };
  
  return (
    <MaterialIcons
      name={getStatusIcon() as any}
      size={size}
      color={getStatusColor()}
      accessible={true}
      accessibilityRole={"image" as AccessibilityRole}
      accessibilityLabel={getAccessibilityLabel()}
    />
  );
};

// Animated GPS searching indicator
export const GpsSearchingIndicator: React.FC = () => {
  const [currentDots, setCurrentDots] = React.useState(1);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDots(prev => (prev % 3) + 1);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  const dots = '.'.repeat(currentDots);
  
  return (
    <Surface
      style={[
        StyleSheet.create({
          container: {
            backgroundColor: theme.colors.gpsMedium + '20',
            borderRadius: 20,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            alignSelf: 'flex-start',
          },
        }).container,
      ]}
      elevation={2}
      accessible={true}
      accessibilityRole={"text" as AccessibilityRole}
      accessibilityLabel="Searching for GPS signal"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <MaterialIcons
          name="gps-not-fixed"
          size={16}
          color={theme.colors.gpsMedium}
          style={{ marginRight: theme.spacing.xs }}
        />
        <Text
          style={{
            ...theme.typography.labelMedium,
            color: theme.colors.gpsMedium,
            fontWeight: '500',
            minWidth: 60, // Prevent layout shift
          }}
          numberOfLines={1}
        >
          Searching{dots}
        </Text>
      </View>
    </Surface>
  );
};