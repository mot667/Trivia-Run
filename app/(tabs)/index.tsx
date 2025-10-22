import { useRouter } from 'expo-router';
import React from 'react';
import { RunScreen } from '../../src/screens/RunScreen';

export default function HomeScreen() {
  const router = useRouter();
  return <RunScreen navigation={router} />;
}
