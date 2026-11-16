import os

# Base directory is the root of the plant-disease-extraction folder
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BACKEND_DIR, ".."))

# Configurable paths with default fallback to portable local directories
MODEL_DIR = os.environ.get('MODEL_DIR', os.path.join(ROOT_DIR, 'models'))
DATA_DIR = os.environ.get('DATA_DIR', os.path.join(ROOT_DIR, 'data'))
UPLOAD_DIR = os.environ.get('UPLOAD_DIR', os.path.join(ROOT_DIR, 'uploads'))

# Model filenames
PRIMARY_MODEL = os.environ.get('PRIMARY_MODEL', 'plant_disease_model_final.keras')
FALLBACK_MODEL = os.environ.get('FALLBACK_MODEL', 'agro_disease_model.h5')

# Inference configuration
IMG_SIZE = (224, 224)
MAX_TEXT_LEN = 50
VOCAB_SIZE = 5000

# Server settings
HOST = os.environ.get('HOST', '0.0.0.0')
PORT = int(os.environ.get('PORT', 5001))
DEBUG = os.environ.get('DEBUG', 'false').lower() in ('true', '1', 'yes')
MAX_CONTENT_LENGTH = int(os.environ.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))  # 10MB
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
