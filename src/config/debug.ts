/**
 * Debug configuration for YouTube video demo
 * Set DEMO_MODE to true to enable verbose logging and fun errors
 */

export const DEBUG_CONFIG = {
  DEMO_MODE: true, // Set to false for production
  VERBOSE_LOGGING: true,
  SIMULATE_ERRORS: true,
  FUNNY_MESSAGES: true,
  SPAM_CONSOLE: true, // Makes terminal scroll like crazy
};

export const logDemo = (...args: any[]) => {
  if (DEBUG_CONFIG.DEMO_MODE && DEBUG_CONFIG.VERBOSE_LOGGING) {
    console.log('🎬 [DEMO]', ...args);
  }
};

export const logError = (...args: any[]) => {
  if (DEBUG_CONFIG.DEMO_MODE) {
    console.error('💥 [ERROR]', ...args);
  }
};

export const logSuccess = (...args: any[]) => {
  if (DEBUG_CONFIG.DEMO_MODE) {
    console.log('✅ [SUCCESS]', ...args);
  }
};

export const logWarning = (...args: any[]) => {
  if (DEBUG_CONFIG.DEMO_MODE) {
    console.warn('⚠️ [WARNING]', ...args);
  }
};

export const spamConsole = (message: string, count: number = 10) => {
  if (DEBUG_CONFIG.DEMO_MODE && DEBUG_CONFIG.SPAM_CONSOLE) {
    for (let i = 0; i < count; i++) {
      console.log(`${message} [${i + 1}/${count}]`);
    }
  }
};
