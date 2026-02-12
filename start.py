#!/usr/bin/env python3
"""
Start script for Speaking Coach backend
Works on both localhost and Render.com
"""

import os
import sys

# Add backend to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Import after path is set
from server import app, logger  # noqa: E402

if __name__ == '__main__':
    # Get port from environment or default to 5001
    port = int(os.environ.get('PORT', 5001))
    
    # Get host
    host = os.environ.get('HOST', '0.0.0.0')
    
    logger.info('🚀 Starting Speaking Coach Backend')
    logger.info(f'📍 Host: {host}:{port}')
    logger.info('🌍 Environment: ' + ('Render.com' if 'RENDER' in os.environ else 'Local'))
    
    # Run Flask app
    app.run(
        host=host,
        port=port,
        debug=False  # Always False in production
    )

