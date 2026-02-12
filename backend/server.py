from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes (Allow all origins for flexibility in deployment)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API key from environment
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
GEMINI_API_BASE = f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent'

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint - verify API key is set"""
    return jsonify({
        'status': 'ok',
        'api_key_set': bool(GEMINI_API_KEY),
        'api_key_preview': GEMINI_API_KEY[:10] + '...' if GEMINI_API_KEY else 'NOT_SET',
        'model': GEMINI_MODEL,
        'version': '2.0'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Analyze speech using Gemini API"""
    try:
        if not GEMINI_API_KEY:
            logger.error('API key not set')
            return jsonify({'error': 'API key not configured'}), 500
        
        data = request.json
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        logger.info(f'Analyzing speech... (prompt length: {len(prompt)} chars)')
        
        # Call Gemini API
        response = requests.post(
            f'{GEMINI_API_BASE}?key={GEMINI_API_KEY}',
            json={
                'contents': [{
                    'parts': [{'text': prompt}]
                }]
            },
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        # Log response status
        logger.info(f'Gemini API response: {response.status_code}')
        
        if response.status_code != 200:
            logger.error(f'Gemini API error: {response.text}')
            return jsonify({
                'error': f'Gemini API error: {response.status_code}',
                'details': response.json() if response.text else {}
            }), response.status_code
        
        result = response.json()
        logger.info('Analysis successful')
        
        return jsonify(result)
        
    except requests.exceptions.Timeout:
        logger.error('Request timeout')
        return jsonify({'error': 'Request timeout'}), 504
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get current configuration (for debugging)"""
    return jsonify({
        'model': GEMINI_MODEL,
        'api_base': GEMINI_API_BASE.split('?')[0],  # Hide API key
        'api_key_set': bool(GEMINI_API_KEY)
    })

if __name__ == '__main__':
    if not GEMINI_API_KEY:
        logger.warning('⚠️  GEMINI_API_KEY not set in .env file!')
        logger.warning('⚠️  Create a .env file with: GEMINI_API_KEY=your_key_here')
    else:
        logger.info(f'✅ API Key loaded: {GEMINI_API_KEY[:10]}...')
        logger.info(f'✅ Model: {GEMINI_MODEL}')
    
    logger.info(f'✅ Model: {GEMINI_MODEL}')
    
    port = int(os.environ.get("PORT", 5001))
    logger.info(f'🚀 Starting Flask server on port {port}')
    app.run(host='0.0.0.0', port=port)
