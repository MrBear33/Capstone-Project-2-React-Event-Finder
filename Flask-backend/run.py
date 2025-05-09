from app import create_app
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')  # Fetch the API key from the .env file
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')

# Create the Flask app
app = create_app()

# Set up logging
logging.basicConfig(
    level=logging.DEBUG,  # Log level
    format='%(asctime)s - %(levelname)s - %(message)s',  # Log format
)

# Log the database URI for debugging
logging.debug(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
logging.debug(f"Google API Key Loaded: {bool(GOOGLE_API_KEY)}")  # Log whether the API key was loaded

print("Loaded SUPABASE_DB_URL:", os.getenv("SUPABASE_DB_URL"))


if __name__ == "__main__":
    # Run the application
    app.run()  # Remove `debug=True` in production
