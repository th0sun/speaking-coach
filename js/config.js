// Configuration
const CONFIG = {
    // Backend API URL
    BACKEND_URL: 'https://speaking-coach.onrender.com',

    // AI Model
    GEMINI_MODEL: 'gemini-2.0-flash',

    // App settings
    APP_VERSION: '2.0',
    APP_NAME: 'Speaking Coach Pro',

    // Debug mode
    DEBUG: true,

    // LocalStorage keys
    STORAGE_KEYS: {
        API_KEY: 'gemini_api_key',
        CURRENT_DAY: 'current_day',
        SESSIONS: 'sessions',
        ACHIEVEMENTS: 'achievements'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
