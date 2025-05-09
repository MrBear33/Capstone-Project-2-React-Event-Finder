from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
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

    # Initialize Flask-Login
    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "login"  # Redirect to 'login' route if not authenticated
    login_manager.login_message = "Please log in to access this page."
    login_manager.login_message_category = "info"

    # User loader callback
    from app.models import User

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    # Register blueprints/routes
    from app.routes import init_routes
    init_routes(app)

    # Inject year into templates
    @app.context_processor
    def inject_year():
        from datetime import datetime
        return {"current_year": lambda: datetime.now().year}

    return app
