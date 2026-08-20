/**
 * Quick Test Component
 * 
 * Temporarily add this to your home screen to quickly test the demo
 * 
 * Usage in index.tsx:
 * import { QuickDemoTest } from './demo/QuickTest';
 * 
 * Then add: <QuickDemoTest />
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { DEBUG_CONFIG } from '../config/debug';
import { runFullDemo } from './youtubeDemo';

export const QuickDemoTest: React.FC = () => {
  if (!DEBUG_CONFIG.DEMO_MODE) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎬 Quick Demo Test</Text>
      <Button 
        mode="contained" 
        onPress={runFullDemo}
        icon="play"
        style={styles.button}
      >
        Run Full Demo Now
      </Button>
      <Text style={styles.hint}>
        Or go to Settings → Demo Controls for all options
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FF9800',
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  button: {
    marginVertical: 8,
  },
  hint: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    color: '#000',
    fontStyle: 'italic',
  },
});
