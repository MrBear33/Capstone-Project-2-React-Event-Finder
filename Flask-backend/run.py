from flask import Flask
from app import create_app
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')

# Create the Flask app
app = Flask(__name__, static_url_path='/static', static_folder='app/static')
app = create_app()

# Force logging config to work under Gunicorn
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    force=True  # 🔥 Critical to override Gunicorn config
)

# Log that the app loaded and keys loaded
logging.debug("Flask app started with debug logging enabled")
logging.debug(f"Database URI: {app.config.get('SQLALCHEMY_DATABASE_URI')}")
logging.debug(f"Google API Key Loaded: {bool(GOOGLE_API_KEY)}")
logging.debug(f"Ticketmaster API Key Loaded: {bool(TICKETMASTER_API_KEY)}")

print("Loaded SUPABASE_DB_URL:", os.getenv("SUPABASE_DB_URL"))

# Run the application (used only in local dev; ignored by Gunicorn in prod)
if __name__ == "__main__":
    app.run()
