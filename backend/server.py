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
                # Official CockroachDB cert URL (Cluster specific)
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
                    # Debug info
                    logger.info(f'   🔍 File size (base64): {len(audio_base64):,} characters')
                    logger.info(f'   🔍 Estimated audio size: ~{len(audio_base64) * 3 / 4 / 1024:.1f} KB')
                except Exception as e:
                    logger.error(f'❌ Failed to process audio file: {e}')
                    return jsonify({'error': f'Failed to process audio: {str(e)}'}), 400
        else:
            data = request.get_json(silent=True) or {}
        
        prompt = data.get('prompt')
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        logger.info('🤖 Analyzing speech...')
        logger.info(f'   📝 Prompt length: {len(prompt):,} characters')
        logger.info(f'   🎙️ Audio included: {"✅ YES" if audio_base64 else "❌ NO (text-only)"}')
        
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
        
        logger.info(f'📤 Sending to Gemini API with {len(parts)} parts: {"[Audio + Text]" if audio_base64 else "[Text only]"}')
        
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

DB_NAME = "speaking_coach.db"

def init_db():
    """Initialize the database with users table (PostgreSQL or SQLite)"""
    try:
        if USE_POSTGRES:
            # Handle SSL for CockroachDB
            db_config = {'dsn': DATABASE_URL}
            if 'sslrootcert' not in DATABASE_URL and os.path.exists('/tmp/root.crt'):
                db_config['sslrootcert'] = '/tmp/root.crt'
            
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
            logger.info('✅ PostgreSQL database initialized')
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
            logger.info('✅ SQLite database initialized: ' + DB_NAME)
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
        # Initialize with empty data structure
        initial_data = json.dumps({
            'currentDay': 1,
            'sessions': [],
            'achievements': [],
            'settings': {'apiKeys': []}
        })
        
        if USE_POSTGRES:
            conn = psycopg2.connect(DATABASE_URL, sslrootcert='/tmp/root.crt')
            c = conn.cursor()
            # 🛡️ UPSERT: If user exists, update PIN. This allows "Emergency Account Recovery" 
            # by just re-registering with the same username.
            c.execute('''
                INSERT INTO users (username, pin, data) 
                VALUES (%s, %s, %s) 
                ON CONFLICT (username) 
                DO UPDATE SET pin = EXCLUDED.pin 
                RETURNING id
            ''', (username, pin, initial_data))
            user_id = c.fetchone()[0]
            conn.commit()
            conn.close()
        else:
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            # SQLite version of Upsert
            c.execute('''
                INSERT INTO users (username, pin, data) 
                VALUES (?, ?, ?)
                ON CONFLICT(username) DO UPDATE SET pin = excluded.pin
            ''', (username, pin, initial_data))
            conn.commit()
            # For SQLite, it's slightly different to get the ID on conflict
            c.execute("SELECT id FROM users WHERE username = ?", (username,))
            user_id = c.fetchone()[0]
            conn.close()
        
        logger.info(f"✅ User registered/recovered: {username}")
        return jsonify({'message': 'Registration successful', 'user_id': str(user_id), 'username': username}), 201
    except Exception as e:
        logger.error(f"❌ Registration error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    pin = data.get('pin')

    if not username or not pin:
        return jsonify({'error': 'Username and PIN are required'}), 400

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
            logger.info(f"✅ User logged in: {username}")
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': str(user[0]),
                    'username': user[1]
                },
                'data': json.loads(user[2]) if user[2] else {}
            }), 200
        else:
            logger.warning(f"❌ Failed login attempt for: {username}")
            return jsonify({'error': 'Invalid username or PIN'}), 401
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/save_data', methods=['POST'])
def save_data():
    data = request.json
    user_id = data.get('user_id')
    user_data = data.get('data')
    username = data.get('username') # Optional, for auto-recovery

    if not user_id or not user_data:
        return jsonify({'error': 'User ID and Data are required'}), 400

    # 🛡️ Protection: Check for Integer Overflow
    # CockroachDB/Postgres BIGINT is 64-bit (up to 9,223,372,036,854,775,807)
    # JS Number is safe only up to 9,007,199,254,740,991 (53-bit)
    # So we must treat IDs as STRINGS in JS, but they are safe in Python/DB.
    MAX_BIGINT = 9223372036854775807
    is_id_safe = True
    try:
        # If ID is numeric string, check range. If it's garbage string, it fails int()
        if int(user_id) > MAX_BIGINT:
            logger.warning(f"⚠️ User ID {user_id} exceeds 64-bit INT. Skipping DB lookup.")
            is_id_safe = False
    except:
         is_id_safe = False

    try:
        if USE_POSTGRES:
            conn = psycopg2.connect(DATABASE_URL, sslrootcert='/tmp/root.crt')
            c = conn.cursor()
            
            # Only try UPDATE if ID is safe
            rows_affected = 0
            if is_id_safe:
                c.execute("UPDATE users SET data = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s", 
                         (json.dumps(user_data), user_id))
                rows_affected = c.rowcount
            
            if rows_affected == 0:
                 # ⚠️ User not found (Ghost Session). Try Auto-Recovery if username provided.
                 # ⚠️ User not found OR ID unsafe. Try Auto-Recovery.
                 if username:
                     logger.warning(f"👻 Ghost Session/Bad ID detected for {username} (ID: {user_id}). Recovery mode...")
                     
                     # Check if we can/should try to reuse the ID
                     can_reuse_id = is_id_safe
                     
                     if can_reuse_id:
                         try:
                             # Attempt 1: Try to restore with original ID
                             c.execute('''
                                INSERT INTO users (id, username, pin, data) 
                                VALUES (%s, %s, '000000', %s)
                             ''', (user_id, username, json.dumps(user_data)))
                             logger.info(f"✅ Auto-recovered user {username} (ID: {user_id})")
                             conn.commit()
                             conn.close()
                             return jsonify({'message': 'Data saved (restored)'}), 200
                         except Exception as insert_err:
                             logger.warning(f"⚠️ Restore with original ID failed: {insert_err}")
                             conn.rollback()
                     
                     # Attempt 2: Check logic (Find by username OR Create New)
                     try:
                         # Check if username exists
                         c.execute("SELECT id FROM users WHERE username = %s", (username,))
                         existing_user = c.fetchone()
                         
                         if existing_user:
                             real_id = existing_user[0]
                             # 🆔 ID from DB might be BIGINT (Mockroach/Postgres)
                             # We TRUST it. Just ensure we send it as STRING to JS to avoid precision loss.
                             
                             logger.info(f"✅ Found map for {username} -> ID {real_id}. Updating...")
                             c.execute("UPDATE users SET data = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s", 
                                      (json.dumps(user_data), real_id))
                             conn.commit()
                             conn.close()
                             # 🔑 KEY FIX: Send ID as STRING
                             return jsonify({'message': 'Recovered', 'new_user_id': str(real_id)}), 200
                         else:
                             # Create NEW user
                             logger.info(f"🆕 Creating user {username} with NEW ID...")
                             c.execute('''
                                 INSERT INTO users (username, pin, data) 
                                 VALUES (%s, '000000', %s) RETURNING id
                             ''', (username, json.dumps(user_data)))
                             new_id = c.fetchone()[0]
                             conn.commit()
                             conn.close()
                             # 🔑 KEY FIX: Send ID as STRING
                             return jsonify({'message': 'Created', 'new_user_id': str(new_id)}), 200
                     except Exception as e:
                         logger.error(f"❌ Critical Recovery Failure: {e}")
                         conn.rollback()
                         conn.close()
                         return jsonify({'error': 'Recovery failed'}), 500
            
            conn.commit()
            conn.close()
        else:
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            # Try UPDATE first
            c.execute("UPDATE users SET data = ? WHERE id = ?", (json.dumps(user_data), user_id))
            
            if c.rowcount == 0:
                 if username:
                     logger.warning(f"👻 Ghost Session detected for ID {user_id} ({username}). Attempting auto-restore...")
                     try:
                         # Attempt 1: Try to restore with original ID
                         c.execute('INSERT INTO users (id, username, pin, data) VALUES (?, ?, ?, ?)', 
                                  (user_id, username, '000000', json.dumps(user_data)))
                         logger.info(f"✅ Auto-recovered user {username} (ID: {user_id})")
                     except Exception as insert_err:
                         logger.warning(f"⚠️ Restore with original ID failed ({insert_err})...")
                         
                         # Attempt 2: Check by username
                         c.execute("SELECT id FROM users WHERE username = ?", (username,))
                         existing_user = c.fetchone()
                         
                         if existing_user:
                             real_id = existing_user[0]
                             c.execute("UPDATE users SET data = ? WHERE id = ?", (json.dumps(user_data), real_id))
                             conn.commit()
                             conn.close()
                             return jsonify({'message': 'Recovered', 'new_user_id': real_id}), 200
                         else:
                             # Attempt 3: Create NEW user
                             c.execute('INSERT INTO users (username, pin, data) VALUES (?, ?, ?)', 
                                      (username, '000000', json.dumps(user_data)))
                             new_id = c.lastrowid
                             conn.commit()
                             conn.close()
                             return jsonify({'message': 'Recreated', 'new_user_id': new_id}), 200
                 else:
                     conn.close()
                     return jsonify({'error': 'User not found and no username for recovery'}), 404
            
            conn.commit()
            conn.close()
        
        logger.info(f"💾 Data saved successfully for user {user_id}")
        return jsonify({'message': 'Data saved successfully'}), 200
    except Exception as e:
        logger.error(f"❌ Save error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_data', methods=['GET'])
def get_data():
    user_id = request.args.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

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

        if result:
            return jsonify({'data': json.loads(result[0]) if result[0] else {}}), 200
        else:
            logger.warning(f"User not found: {user_id}")
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        logger.error(f"Get data error: {e}")
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
    logger.info(f'📊 Database: {"PostgreSQL (Render)" if USE_POSTGRES else "SQLite (Local)"}')
    
    if USE_POSTGRES:
        logger.info('✅ PostgreSQL connection ready for persistent global data')
    else:
        logger.info('💾 Using SQLite (local development or fallback mode)')
    
    port = int(os.environ.get("PORT", 5001))
    host = os.environ.get("HOST", "0.0.0.0")
    
    logger.info(f'🚀 Starting Flask server on {host}:{port}')
    
    try:
        app.run(host=host, port=port, debug=False)
    except Exception as e:
        logger.error(f'❌ Failed to start server: {e}')
        sys.exit(1)

