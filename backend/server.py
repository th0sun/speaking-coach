from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import requests
import logging
import base64
import sqlite3
import json
import sys

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

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
USE_POSTGRES = DATABASE_URL is not None and 'postgresql' in DATABASE_URL.lower()

psycopg2 = None
if USE_POSTGRES:
    try:
        import psycopg2  # type: ignore
        logger.info('✅ PostgreSQL mode enabled')

        # Download CockroachDB root certificate if needed (for Render)
        cert_path = '/tmp/root.crt'
        if not os.path.exists(cert_path):
            try:
                logger.info('📥 Downloading CockroachDB root certificate...')
                url = "https://cockroachlabs.cloud/clusters/d35acd16-d99a-4238-92cf-a50c45d83c8a/cert"
                response = requests.get(url, allow_redirects=True)
                if response.status_code == 200:
                    with open(cert_path, 'wb') as f:
                        f.write(response.content)
                    logger.info(f'✅ Certificate downloaded to {cert_path}')
                else:
                    logger.error(f'❌ Failed to download certificate. Status: {response.status_code}')
            except Exception as e:
                logger.error(f'❌ Failed to download certificate: {e}')

    except ImportError:
        logger.warning('⚠️ psycopg2 not installed, falling back to SQLite')
        USE_POSTGRES = False

DB_NAME = "speaking_coach.db"

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'api_key_set': bool(GEMINI_API_KEY),
        'version': '3.17'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        if not GEMINI_API_KEY:
            return jsonify({'error': 'API key not configured'}), 500
        
        data = None
        audio_base64 = None
        audio_mime_type = None
        
        if request.is_json:
            data = request.json
        elif request.form:
            data = {k: v for k, v in request.form.items()}
            if 'audio' in request.files:
                audio_file = request.files['audio']
                audio_data = audio_file.read()
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                filename = audio_file.filename.lower()
                audio_mime_type = 'audio/webm' if filename.endswith('.webm') else 'audio/mpeg'
        else:
            data = request.get_json(silent=True) or {}
        
        prompt = data.get('prompt')
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        parts = []
        if audio_base64:
            parts.append({'inline_data': {'mime_type': audio_mime_type, 'data': audio_base64}})
        parts.append({'text': prompt})
        
        response = requests.post(
            f'{GEMINI_API_BASE}?key={GEMINI_API_KEY}',
            json={'contents': [{'parts': parts}]},
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        if response.status_code != 200:
            return jsonify({'error': f'Gemini API error: {response.status_code}'}), response.status_code
        
        return jsonify(response.json())
    except Exception as e:
        logger.error(f'Error: {str(e)}')
        return jsonify({'error': str(e)}), 500

def init_db():
    try:
        if USE_POSTGRES:
            conn = psycopg2.connect(DATABASE_URL, sslrootcert='/tmp/root.crt')
            c = conn.cursor()
            c.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    pin TEXT NOT NULL,
                    data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            conn.commit()
            conn.close()
            logger.info('✅ Database initialized (PostgreSQL)')
        else:
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
            logger.info('✅ Database initialized (SQLite)')
    except Exception as e:
        logger.error(f"❌ DB Init failed: {e}")

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
        initial_data = json.dumps({'currentDay': 1, 'sessions': [], 'achievements': [], 'settings': {'apiKeys': []}})
        if USE_POSTGRES:
            conn = psycopg2.connect(DATABASE_URL, sslrootcert='/tmp/root.crt')
            c = conn.cursor()
            c.execute("INSERT INTO users (username, pin, data) VALUES (%s, %s, %s) RETURNING id", (username, pin, initial_data))
            user_id = c.fetchone()[0]
            conn.commit()
            conn.close()
        else:
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute("INSERT INTO users (username, pin, data) VALUES (?, ?, ?)", (username, pin, initial_data))
            conn.commit()
            user_id = c.lastrowid
            conn.close()
        
        return jsonify({'message': 'Success', 'user_id': str(user_id), 'username': username}), 201
    except Exception as e:
        if 'duplicate' in str(e).lower() or 'unique' in str(e).lower():
            return jsonify({'error': 'Username already exists. Please login.'}), 409
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    pin = data.get('pin')

    try:
        if USE_POSTGRES:
            conn = psycopg2.connect(DATABASE_URL, sslrootcert='/tmp/root.crt')
            c = conn.cursor()
            c.execute("SELECT id, username, data FROM users WHERE username = %s AND pin = %s", (username, pin))
            user = c.fetchone()
            conn.close()
        else:
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute("SELECT id, username, data FROM users WHERE username = ? AND pin = ?", (username, pin))
            user = c.fetchone()
            conn.close()

        if user:
            return jsonify({'message': 'Ok', 'user': {'id': str(user[0]), 'username': user[1]}, 'data': json.loads(user[2]) if user[2] else {}}), 200
        return jsonify({'error': 'Invalid username or PIN'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save_data', methods=['POST'])
def save_data():
    data = request.json
    user_id = data.get('user_id')
    user_data = data.get('data')
    username = data.get('username')

    if not user_id or not user_data:
        return jsonify({'error': 'Required fields missing'}), 400

    try:
        if USE_POSTGRES:
            conn = psycopg2.connect(DATABASE_URL, sslrootcert='/tmp/root.crt')
            c = conn.cursor()
            c.execute("UPDATE users SET data = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s", (json.dumps(user_data), user_id))
            if c.rowcount == 0 and username:
                 c.execute("SELECT id FROM users WHERE username = %s", (username,))
                 existing = c.fetchone()
                 if existing:
                     real_id = existing[0]
                     c.execute("UPDATE users SET data = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s", (json.dumps(user_data), real_id))
                     conn.commit()
                     conn.close()
                     return jsonify({'message': 'Synced', 'new_user_id': str(real_id)}), 200
            conn.commit()
            conn.close()
        else:
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute("UPDATE users SET data = ? WHERE id = ?", (json.dumps(user_data), user_id))
            if c.rowcount == 0 and username:
                 c.execute("SELECT id FROM users WHERE username = ?", (username,))
                 existing = c.fetchone()
                 if existing:
                     real_id = existing[0]
                     c.execute("UPDATE users SET data = ? WHERE id = ?", (json.dumps(user_data), real_id))
                     conn.commit()
                     conn.close()
                     return jsonify({'message': 'Synced', 'new_user_id': str(real_id)}), 200
            conn.commit()
            conn.close()
        return jsonify({'message': 'Saved'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_data', methods=['GET'])
def get_data():
    user_id = request.args.get('user_id')
    if not user_id: return jsonify({'error': 'UID missing'}), 400
    try:
        if USE_POSTGRES:
            conn = psycopg2.connect(DATABASE_URL, sslrootcert='/tmp/root.crt')
            c = conn.cursor()
            c.execute("SELECT data FROM users WHERE id = %s", (user_id,))
            result = c.fetchone()
            conn.close()
        else:
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            c.execute("SELECT data FROM users WHERE id = ?", (user_id,))
            result = c.fetchone()
            conn.close()
        if result: return jsonify({'data': json.loads(result[0]) if result[0] else {}}), 200
        return jsonify({'error': 'Not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({'model': GEMINI_MODEL, 'api_key_set': bool(GEMINI_API_KEY)})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5001))
    host = os.environ.get("HOST", "0.0.0.0")
    logger.info(f'🚀 Server starting on {host}:{port}')
    app.run(host=host, port=port, debug=False)
