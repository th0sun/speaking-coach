from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import logging
import base64
import io

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
    """Analyze speech using Gemini API with optional audio file support"""
    try:
        if not GEMINI_API_KEY:
            logger.error('API key not set')
            return jsonify({'error': 'API key not configured'}), 500
        
        # Handle both JSON and multipart form data
        data = None
        audio_base64 = None
        audio_mime_type = None
        
        if request.is_json:
            # JSON request (backward compatibility)
            data = request.json
        elif request.form:
            # Multipart form data with audio file
            data = {k: v for k, v in request.form.items()}
            
            if 'audio' in request.files:
                audio_file = request.files['audio']
                logger.info(f'📁 Audio file received: {audio_file.filename}')
                
                try:
                    # Read and encode audio to base64
                    audio_data = audio_file.read()
                    audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                    
                    # Determine MIME type
                    filename = audio_file.filename.lower()
                    if filename.endswith('.webm'):
                        audio_mime_type = 'audio/webm'
                    elif filename.endswith('.mp3'):
                        audio_mime_type = 'audio/mpeg'
                    elif filename.endswith('.wav'):
                        audio_mime_type = 'audio/wav'
                    elif filename.endswith('.ogg'):
                        audio_mime_type = 'audio/ogg'
                    else:
                        audio_mime_type = 'audio/webm'  # Default
                    
                    logger.info(f'✅ Audio decoded successfully: {len(audio_base64)} bytes, MIME: {audio_mime_type}')
                except Exception as e:
                    logger.error(f'❌ Failed to process audio file: {e}')
                    return jsonify({'error': f'Failed to process audio: {str(e)}'}), 400
        else:
            data = request.get_json(silent=True) or {}
        
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        logger.info(f'🤖 Analyzing speech... (prompt length: {len(prompt)} chars, audio: {"yes" if audio_base64 else "no"})')
        
        # Build request parts for Gemini API
        parts = []
        
        # Add audio if available
        if audio_base64:
            parts.append({
                'inline_data': {
                    'mime_type': audio_mime_type,
                    'data': audio_base64
                }
            })
            logger.info('🎙️ Audio part added to request')
        
        # Add text prompt
        parts.append({'text': prompt})
        
        # Call Gemini API
        response = requests.post(
            f'{GEMINI_API_BASE}?key={GEMINI_API_KEY}',
            json={
                'contents': [{
                    'parts': parts
                }]
            },
            headers={'Content-Type': 'application/json'},
            timeout=60  # Increased timeout for audio processing
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
        logger.info('✅ Analysis successful')
        
        return jsonify(result)
        
    except requests.exceptions.Timeout:
        logger.error('Request timeout')
        return jsonify({'error': 'Request timeout - audio analysis took too long'}), 504
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

# --- User Authentication & Data APIs ---

import sqlite3
import json

DB_NAME = "speaking_coach.db"

def init_db():
    """Initialize the database with users table"""
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                pin TEXT NOT NULL,
                data TEXT
            )
        ''')
        conn.commit()
        conn.close()
        logger.info(f"✅ Database initialized: {DB_NAME}")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")

# Initialize DB on startup
init_db()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    pin = data.get('pin')

    if not username or not pin:
        return jsonify({'error': 'Username and PIN are required'}), 400
    
    if len(str(pin)) != 6 or not str(pin).isdigit():
        return jsonify({'error': 'PIN must be 6 digits'}), 400

    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        # Initialize with empty data structure
        initial_data = json.dumps({
            'currentDay': 1,
            'sessions': [],
            'achievements': [],
            'settings': {'apiKeys': []}
        })
        c.execute("INSERT INTO users (username, pin, data) VALUES (?, ?, ?)", (username, pin, initial_data))
        conn.commit()
        user_id = c.lastrowid
        conn.close()
        return jsonify({'message': 'Registration successful', 'user_id': user_id, 'username': username}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Username already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    pin = data.get('pin')

    if not username or not pin:
        return jsonify({'error': 'Username and PIN are required'}), 400

    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("SELECT id, username, data FROM users WHERE username = ? AND pin = ?", (username, pin))
        user = c.fetchone()
        conn.close()

        if user:
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user[0],
                    'username': user[1]
                },
                'data': json.loads(user[2]) if user[2] else {}
            }), 200
        else:
            return jsonify({'error': 'Invalid username or PIN'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save_data', methods=['POST'])
def save_data():
    data = request.json
    user_id = data.get('user_id')
    user_data = data.get('data')

    if not user_id or not user_data:
        return jsonify({'error': 'User ID and Data are required'}), 400

    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("UPDATE users SET data = ? WHERE id = ?", (json.dumps(user_data), user_id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Data saved successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_data', methods=['GET'])
def get_data():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        c.execute("SELECT data FROM users WHERE id = ?", (user_id,))
        result = c.fetchone()
        conn.close()

        if result:
            return jsonify({'data': json.loads(result[0]) if result[0] else {}}), 200
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
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
    
    port = int(os.environ.get("PORT", 5001))
    logger.info(f'🚀 Starting Flask server on port {port}')
    app.run(host='0.0.0.0', port=port)
