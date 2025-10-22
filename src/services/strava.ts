import * as WebBrowser from 'expo-web-browser';
import type { RunData } from '../state/useRunStore';
import { useSettingsStore } from '../state/useSettingsStore';

// Configure WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

// Strava OAuth Configuration - Using environment variables
const STRAVA_CLIENT_ID = '182067';
const STRAVA_CLIENT_SECRET = 'd9d8077bbd2d2f7481f7da5b39f9f1e9b1c650b6';

// Strava API endpoints
const STRAVA_AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  elapsed_time: number;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

class StravaService {
  private redirectUri: string;
  
  constructor() {
    // For web-based OAuth with Strava, we'll set this in the auth method
    this.redirectUri = '';
  }

  /**
   * Initialize OAuth authentication with Strava
   */
  async authenticateWithStrava(): Promise<boolean> {
    try {
      console.log('🔐 Starting Strava OAuth...');
      console.log('Client ID:', STRAVA_CLIENT_ID);
      
      // For now, use httpbin.org and implement manual code entry
      // This is a temporary solution until we set up proper redirect handling
      const redirectUri = 'https://httpbin.org/get';
      
      console.log('Using redirect URI:', redirectUri);
      console.log('⚠️  Make sure your Strava app Authorization Callback Domain is set to: httpbin.org');
      
      // Build OAuth URL manually since Strava has strict requirements
      const authUrl = `${STRAVA_AUTHORIZE_URL}?` +
        `client_id=${STRAVA_CLIENT_ID}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=activity%3Awrite&` +
        `approval_prompt=force`;
      
      console.log('Auth URL:', authUrl);
      console.log('📱 Opening Strava authorization...');
      console.log('💡 After authorization, copy the code from the browser and paste it in the app');
      
      // Open the browser for OAuth
      await WebBrowser.openBrowserAsync(authUrl);
      
      // For now, return false and let user manually handle
      // TODO: Implement proper code capture mechanism
      return false;
      
    } catch (error) {
      console.error('Strava authentication error:', error);
      return false;
    }
  }

  /**
   * Manually complete OAuth with authorization code (for development)
   * Use this method with the code from httpbin.org response
   */
  async completeOAuthWithCode(code: string): Promise<boolean> {
    try {
      console.log('🔗 Manually completing OAuth with code:', code.substring(0, 10) + '...');
      
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      if (tokenResponse) {
        // Store tokens and athlete info
        const settings = useSettingsStore.getState();
        settings.setStravaTokens(
          tokenResponse.access_token,
          tokenResponse.refresh_token,
          tokenResponse.expires_in,
          tokenResponse.athlete.id.toString(),
          `${tokenResponse.athlete.firstname} ${tokenResponse.athlete.lastname}`
        );
        
        console.log('✅ Strava authentication successful via manual code entry');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Manual OAuth completion error:', error);
      return false;
    }
  }

  /**
   * Handle OAuth callback from deep link (for production builds)
   */
  async handleOAuthCallback(code: string): Promise<boolean> {
    try {
      console.log('🔗 Handling OAuth callback with code:', code.substring(0, 10) + '...');
      
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      if (tokenResponse) {
        // Store tokens and athlete info
        const settings = useSettingsStore.getState();
        settings.setStravaTokens(
          tokenResponse.access_token,
          tokenResponse.refresh_token,
          tokenResponse.expires_in,
          tokenResponse.athlete.id.toString(),
          `${tokenResponse.athlete.firstname} ${tokenResponse.athlete.lastname}`
        );
        
        console.log('✅ Strava authentication successful via deep link');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('OAuth callback handling error:', error);
      return false;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  private async exchangeCodeForToken(
    code: string
  ): Promise<StravaTokenResponse | null> {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
        }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Token exchange failed:', response.status, await response.text());
        return null;
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      return null;
    }
  }

  /**
   * Refresh expired access token
   */
  async refreshAccessToken(): Promise<boolean> {
    const settings = useSettingsStore.getState();
    
    if (!settings.stravaRefreshToken) {
      console.error('No refresh token available');
      return false;
    }

    try {
      const response = await fetch(STRAVA_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: settings.stravaRefreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (response.ok) {
        const tokenData: StravaTokenResponse = await response.json();
        
        settings.setStravaTokens(
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in,
          settings.stravaAthleteId || '',
          settings.stravaAthleteName || ''
        );
        
        console.log('✅ Strava token refreshed successfully');
        return true;
      } else {
        console.error('Token refresh failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  /**
   * Check if access token is valid (not expired)
   */
  isTokenValid(): boolean {
    const settings = useSettingsStore.getState();
    
    if (!settings.stravaAccessToken || !settings.stravaTokenExpiry) {
      return false;
    }
    
    // Check if token expires in the next 5 minutes
    return settings.stravaTokenExpiry > Date.now() + (5 * 60 * 1000);
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    const settings = useSettingsStore.getState();
    
    if (!settings.stravaConnected) {
      return null;
    }
    
    if (this.isTokenValid()) {
      return settings.stravaAccessToken || null;
    }
    
    // Token is expired, try to refresh
    const refreshed = await this.refreshAccessToken();
    if (refreshed) {
      return useSettingsStore.getState().stravaAccessToken || null;
    }
    
    return null;
  }

  /**
   * Upload a run to Strava
   */
  async uploadRun(runData: RunData): Promise<StravaActivity | null> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      if (!accessToken) {
        console.error('No valid Strava access token');
        return null;
      }

      // Convert run data to Strava activity format
      const activityData = this.convertRunToStravaActivity(runData);
      
      const response = await fetch(`${STRAVA_API_BASE}/activities`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        const activity: StravaActivity = await response.json();
        console.log('✅ Run uploaded to Strava:', activity.id);
        return activity;
      } else {
        console.error('Strava upload failed:', response.status, await response.text());
        return null;
      }
    } catch (error) {
      console.error('Strava upload error:', error);
      return null;
    }
  }

  /**
   * Convert RunData to Strava activity format
   */
  private convertRunToStravaActivity(runData: RunData) {
    const settings = useSettingsStore.getState();
    
    // Create activity name with trivia stats
    const triviaStats = runData.triviaResults.length > 0 
      ? ` | ${runData.triviaResults.filter(r => r.correct).length}/${runData.triviaResults.length} trivia correct`
      : '';
    
    const penaltyTime = runData.totalPenaltySeconds > 0 
      ? ` | +${runData.totalPenaltySeconds}s penalties`
      : '';
    
    const activityName = `Trivia Run${triviaStats}${penaltyTime}`;
    
    // Create description with detailed stats
    const description = this.createRunDescription(runData);
    
    return {
      name: activityName,
      type: 'Run',
      sport_type: 'Run',
      start_date_local: new Date(runData.startTime).toISOString(),
      elapsed_time: runData.elapsedSeconds + runData.totalPenaltySeconds,
      distance: runData.totalDistanceMeters,
      description,
      trainer: false,
      commute: false,
    };
  }

  /**
   * Create detailed run description
   */
  private createRunDescription(runData: RunData): string {
    const lines = [];
    
    // Basic stats
    lines.push('🏃‍♂️ Trivia Run Summary');
    lines.push('');
    lines.push(`📍 Distance: ${(runData.totalDistanceMeters / 1000).toFixed(2)} km`);
    lines.push(`⏱️ Running Time: ${this.formatTime(runData.elapsedSeconds)}`);
    lines.push(`⚡ Average Pace: ${this.formatPace(runData.averageSpeed)}`);
    
    if (runData.triviaResults.length > 0) {
      lines.push('');
      lines.push('🧠 Trivia Challenge:');
      
      const correct = runData.triviaResults.filter(r => r.correct).length;
      const total = runData.triviaResults.length;
      const accuracy = ((correct / total) * 100).toFixed(1);
      
      lines.push(`   Questions: ${correct}/${total} correct (${accuracy}%)`);
      
      if (runData.totalPenaltySeconds > 0) {
        lines.push(`   Penalties: +${runData.totalPenaltySeconds}s for wrong answers`);
        lines.push(`   Final Time: ${this.formatTime(runData.elapsedSeconds + runData.totalPenaltySeconds)}`);
      }
    }
    
    lines.push('');
    lines.push('Generated by Trivia Run App 🏃‍♂️🧠');
    
    return lines.join('\n');
  }

  /**
   * Format time in MM:SS format
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format pace in min/km format
   */
  private formatPace(speedMs: number): string {
    if (speedMs <= 0) return '--:--';
    
    const paceSeconds = 1000 / speedMs; // seconds per kilometer
    const mins = Math.floor(paceSeconds / 60);
    const secs = Math.floor(paceSeconds % 60);
    
    return `${mins}:${secs.toString().padStart(2, '0')}/km`;
  }

  /**
   * Disconnect from Strava
   */
  async disconnectStrava(): Promise<void> {
    const settings = useSettingsStore.getState();
    
    // Optional: Revoke token on Strava's side
    try {
      const accessToken = settings.stravaAccessToken;
      if (accessToken) {
        await fetch(`${STRAVA_API_BASE}/oauth/deauthorize`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.warn('Failed to revoke Strava token:', error);
    }
    
    // Clear local tokens
    settings.clearStravaTokens();
    console.log('✅ Disconnected from Strava');
  }

  /**
   * Get athlete profile from Strava
   */
  async getAthleteProfile(): Promise<StravaAthlete | null> {
    try {
      const accessToken = await this.getValidAccessToken();
      
      if (!accessToken) {
        return null;
      }

      const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch athlete profile:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Athlete profile fetch error:', error);
      return null;
    }
  }
}

// Singleton instance
export const stravaService = new StravaService();

// Helper function to check if user should be prompted to connect Strava
export function shouldPromptStravaConnection(): boolean {
  const settings = useSettingsStore.getState();
  return settings.autoUploadToStrava && !settings.stravaConnected;
}