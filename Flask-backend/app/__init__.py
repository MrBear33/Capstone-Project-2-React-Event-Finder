from flask import Flask
from flask_migrate import Migrate
from app.db import db
from config import config
from flask_cors import CORS

def create_app(config_name="default"):
    app = Flask(__name__, static_folder="static")

    # Enable CORS for all routes
    CORS(app, supports_credentials=True)

    # Load configuration dynamically based on the environment
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    Migrate(app, db)

    # Register routes
    from app.routes import init_routes
    init_routes(app)

    # Add year into templates
    @app.context_processor
    def inject_year():
        from datetime import datetime
        return {"current_year": lambda: datetime.now().year}

    return app
