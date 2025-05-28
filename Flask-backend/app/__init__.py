from flask import Flask
from flask_migrate import Migrate
from app.db import db
from config import config
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def create_app(config_name="default"):
    app = Flask(__name__, static_folder="static")

    # ✅ Add JWT secret key config
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')

    # Enable CORS for all routes
    CORS(app, supports_credentials=True)

    # Load environment-specific config
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)

    # ✅ Initialize JWT manager
    jwt = JWTManager(app)

    # Register routes
    from app.routes import init_routes
    init_routes(app)

    # Add year into templates (optional but nice)
    @app.context_processor
    def inject_year():
        from datetime import datetime
        return {"current_year": lambda: datetime.now().year}

    return app
