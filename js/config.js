// Configuration
const CONFIG = {
    // Backend API URL
    BACKEND_URL: 'http://localhost:5001',

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
