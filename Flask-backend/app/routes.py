import logging
import os
import base64
import requests
from flask import request, jsonify
from app.models import User, Event, Friendship, SavedEvent
from app.db import db
from bcrypt import hashpw, gensalt, checkpw
from dotenv import load_dotenv
from flask_jwt_extended import get_jwt_identity, jwt_required, create_access_token

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')

logging.basicConfig(level=logging.DEBUG, force=True)

def init_routes(app):
    # ----------------------------
    # LOGIN
    # ----------------------------
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        logging.debug(f"[LOGIN] Incoming data: {data}")
        username = data.get('username')
        password = data.get('password', '').encode('utf-8')

        user = User.query.filter_by(username=username).first()
        if user and checkpw(password, user.password.encode('utf-8')):
            try:
                token = create_access_token(identity=str(user.id))
                return jsonify({"token": token, "username": user.username}), 200
            except Exception as e:
                logging.error(f"[LOGIN] Error generating token: {e}")
                return jsonify({"error": "Login failed"}), 500

        return jsonify({"error": "Invalid username or password"}), 401

    # ----------------------------
    # REGISTER
    # ----------------------------
    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        logging.debug(f"[REGISTER] Incoming data: {data}")
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already taken"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already in use"}), 400

        errors = []
        if len(password) < 8:
            errors.append("at least 8 characters")
        if not any(c.isdigit() for c in password): errors.append("a number")
        if not any(c.isupper() for c in password): errors.append("an uppercase letter")
        if not any(c.islower() for c in password): errors.append("a lowercase letter")
        if not any(c in "!@#$%^&*()-_+=<>?/|{}[]~`" for c in password): errors.append("a special character")

        if errors:
            return jsonify({"error": "Password must include " + ", ".join(errors) + "."}), 400

        try:
            hashed_password = hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')
            new_user = User(username=username, email=email, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            return jsonify({"message": "Registration successful"}), 201
        except Exception as e:
            db.session.rollback()
            logging.error(f"[REGISTER] Error: {e}")
            return jsonify({"error": "Internal server error"}), 500

    # ----------------------------
    # USER HOMEPAGE
    # ----------------------------
    @app.route('/user/<username>')
    @jwt_required()
    def user_homepage(username):
        user_id = get_jwt_identity()
        logging.debug(f"[USER] JWT identity: {user_id}")

        user = User.query.get(user_id)
        logging.debug(f"[USER] DB user match: {user}")

        if not user or user.username != username:
            logging.warning(f"[USER] Unauthorized: token user_id {user_id}, requested {username}")
            return jsonify({"error": "Unauthorized access"}), 403

        saved_events = [{
            "name": e.event.name,
            "location": e.event.location,
            "date": e.event.date.isoformat(),
            "image_url": e.event.image_url,
            "saved_event_id": e.id
        } for e in user.saved_events]

        return jsonify({
            "username": user.username,
            "bio": user.bio,
            "profile_picture": user.profile_picture,
            "latitude": user.latitude,
            "longitude": user.longitude,
            "saved_events": saved_events
        }), 200

    # ----------------------------
    # EVENTS
    # ----------------------------
    @app.route('/events')
    @jwt_required()
    def events():
        user = User.query.get(get_jwt_identity())
        if not user or user.latitude is None or user.longitude is None:
            return jsonify({"error": "User location not set."}), 400

        try:
            res = requests.get(
                "https://app.ticketmaster.com/discovery/v2/events.json",
                params={
                    'apikey': TICKETMASTER_API_KEY,
                    'latlong': f"{user.latitude},{user.longitude}",
                    'radius': 50,
                    'unit': 'miles',
                    'size': 10
                }
            )
            res.raise_for_status()
            events = res.json().get('_embedded', {}).get('events', [])
            return jsonify(events), 200
        except Exception as e:
            logging.error(f"[EVENTS] Fetch error: {e}")
            return jsonify({"error": "Unable to fetch events"}), 500

    # ----------------------------
    # SAVE LOCATION
    # ----------------------------
    @app.route('/api/save_location', methods=['POST'])
    @jwt_required()
    def save_location():
        user_id = get_jwt_identity()
        logging.debug(f"[SAVE_LOCATION] JWT identity: {user_id}")

        data = request.get_json()
        logging.debug(f"[SAVE_LOCATION] Incoming JSON: {data}")

        if not data or 'lat' not in data or 'lng' not in data:
            logging.warning("[SAVE_LOCATION] Invalid or missing lat/lng")
            return jsonify({'error': 'Invalid location data'}), 400

        try:
            user = User.query.get(user_id)
            logging.debug(f"[SAVE_LOCATION] Found user: {user}")

            if not user:
                return jsonify({'error': 'User not found'}), 404

            user.latitude = data['lat']
            user.longitude = data['lng']
            db.session.commit()

            return jsonify({'status': 'Location saved'}), 200
        except Exception as e:
            db.session.rollback()
            logging.error(f"[SAVE_LOCATION] Error saving location: {e}")
            return jsonify({'error': 'Internal server error'}), 500

    # ----------------------------
    # Additional routes (save_event, remove_saved_event, etc.)
    # ----------------------------
    # ✅ Keep your remaining routes as-is — they look clean and secure

