import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { stravaService } from '../src/services/strava';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      console.log('🔗 Deep link OAuth callback params:', params);
      
      const code = params.code as string;
      const error = params.error as string;

      if (error) {
        console.log('❌ OAuth error:', error);
        router.replace('/(tabs)/explore'); // Navigate back to settings
        return;
      }

      if (code) {
        console.log('✅ OAuth code received, exchanging for token...');
        
        // Exchange code for tokens (this will be handled by the service)
        const success = await stravaService.handleOAuthCallback(code);
        
        if (success) {
          console.log('✅ Strava authentication completed successfully');
        } else {
          console.log('❌ Failed to complete Strava authentication');
        }
      }

      // Navigate back to settings screen
      router.replace('/(tabs)/explore');
    } catch (error) {
      console.error('OAuth callback error:', error);
      router.replace('/(tabs)/explore');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
      <ActivityIndicator size="large" color="#FC4C02" />
      <Text style={{ color: 'white', marginTop: 16, fontSize: 16 }}>
        Completing Strava authentication...
      </Text>
    </View>
  );
}