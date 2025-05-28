import logging
import os
import base64
import requests
import jwt
import datetime
from flask import request, jsonify
from app.models import User, Event, Friendship, SavedEvent
from app.db import db
from bcrypt import hashpw, gensalt, checkpw
from dotenv import load_dotenv
from app.utils import require_token

# Load secrets and API keys from .env
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

# Enable basic logging
logging.basicConfig(level=logging.DEBUG)

def init_routes(app):
    # ----------------------------
    # LOGIN - JWT auth + geolocation
    # ----------------------------
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password', '').encode('utf-8')

        user = User.query.filter_by(username=username).first()
        if user and checkpw(password, user.password.encode('utf-8')):
            try:
                # Generate JWT token
                token = jwt.encode({
                    'username': user.username,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
                }, JWT_SECRET_KEY, algorithm='HS256')

                return jsonify({"token": token, "username": user.username}), 200

            except Exception as e:
                logging.error(f"Login error: {e}")
                return jsonify({"error": "Login failed"}), 500

        return jsonify({"error": "Invalid username or password"}), 401

    # ----------------------------
    # REGISTER - with password rules
    # ----------------------------
    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Uniqueness checks
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already taken"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already in use"}), 400

        # Password strength validation
        errors = []
        if len(password) < 8:
            errors.append("at least 8 characters")
        if not any(c.isdigit() for c in password):
            errors.append("at least one number")
        if not any(c.isupper() for c in password):
            errors.append("at least one uppercase letter")
        if not any(c.islower() for c in password):
            errors.append("at least one lowercase letter")
        if not any(c in "!@#$%^&*()-_+=<>?/|{}[]~`" for c in password):
            errors.append("at least one special character")

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
            logging.error(f"Registration error: {e}")
            return jsonify({"error": "Internal server error"}), 500

    # ----------------------------
    # USER HOMEPAGE - Protected
    # ----------------------------
    @app.route('/user/<username>')
    @require_token
    def user_homepage(username):
        if username != request.username:
            return jsonify({"error": "Unauthorized access"}), 403

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

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
            "saved_events": saved_events
        }), 200

    # ----------------------------
    # EVENTS - Live geolocation
    # ----------------------------
    @app.route('/events')
    @require_token
    def events():
        try:
            geo_res = requests.post(
                f"https://www.googleapis.com/geolocation/v1/geolocate?key={GOOGLE_API_KEY}",
                json={"considerIp": True}
            )
            geo_res.raise_for_status()
            location = geo_res.json().get('location')
            if not location:
                return jsonify({"error": "No location data"}), 400

            lat = location.get('lat')
            lng = location.get('lng')

            tm_res = requests.get(
                "https://app.ticketmaster.com/discovery/v2/events.json",
                params={
                    'apikey': TICKETMASTER_API_KEY,
                    'latlong': f"{lat},{lng}",
                    'radius': 50,
                    'unit': 'miles',
                    'size': 10
                }
            )
            tm_res.raise_for_status()
            events = tm_res.json().get('_embedded', {}).get('events', [])
            return jsonify(events), 200

        except Exception as e:
            logging.error(f"Error getting events: {e}")
            return jsonify({"error": "Unable to fetch events"}), 500

    # ----------------------------
    # SAVE EVENT - Protected
    # ----------------------------
    @app.route('/save_event/<string:api_event_id>', methods=['POST'])
    @require_token
    def save_event(api_event_id):
        user = User.query.filter_by(username=request.username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        try:
            res = requests.get(
                f"https://app.ticketmaster.com/discovery/v2/events/{api_event_id}.json",
                params={"apikey": TICKETMASTER_API_KEY}
            )
            res.raise_for_status()
            data = res.json()

            event = Event.query.filter_by(api_event_id=api_event_id).first()
            if not event:
                event = Event(
                    api_event_id=api_event_id,
                    name=data.get('name'),
                    location=data.get('_embedded', {}).get('venues', [{}])[0].get('name'),
                    date=data.get('dates', {}).get('start', {}).get('dateTime'),
                    category=data.get('classifications', [{}])[0].get('segment', {}).get('name'),
                    image_url=data.get('images', [{}])[0].get('url')
                )
                db.session.add(event)
                db.session.commit()

            if SavedEvent.query.filter_by(user_id=user.id, event_id=event.id).first():
                return jsonify({"message": "Already saved"}), 200

            new_saved = SavedEvent(user_id=user.id, event_id=event.id)
            db.session.add(new_saved)
            db.session.commit()
            return jsonify({"message": "Event saved"}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Could not save event"}), 500

    # ----------------------------
    # REMOVE SAVED EVENT
    # ----------------------------
    @app.route('/remove_saved_event/<int:saved_event_id>', methods=['POST'])
    @require_token
    def remove_saved_event(saved_event_id):
        user = User.query.filter_by(username=request.username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        try:
            saved = SavedEvent.query.filter_by(id=saved_event_id, user_id=user.id).first()
            if not saved:
                return jsonify({"error": "Not found"}), 404

            db.session.delete(saved)
            db.session.commit()
            return jsonify({"message": "Event removed"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to remove event"}), 500

    # ----------------------------
    # ADD FRIEND
    # ----------------------------
    @app.route('/add_friend', methods=['POST'])
    @require_token
    def add_friend():
        user = User.query.filter_by(username=request.username).first()
        friend_username = request.get_json().get('username')
        friend = User.query.filter_by(username=friend_username).first()

        if not friend or friend.id == user.id:
            return jsonify({"error": "Invalid friend"}), 400

        if Friendship.query.filter_by(user_id=user.id, friend_id=friend.id).first():
            return jsonify({"message": "Already friends"}), 200

        try:
            new_link = Friendship(user_id=user.id, friend_id=friend.id)
            db.session.add(new_link)
            db.session.commit()
            return jsonify({"message": f"Friend added: {friend.username}"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Could not add friend"}), 500

    # ----------------------------
    # GET FRIENDS LIST
    # ----------------------------
    @app.route('/friends')
    @require_token
    def friends():
        user = User.query.filter_by(username=request.username).first()
        friends = User.query.join(Friendship, User.id == Friendship.friend_id)\
            .filter(Friendship.user_id == user.id).all()
        return jsonify({"friends": [{"username": f.username, "email": f.email} for f in friends]}), 200

    # ----------------------------
    # EDIT PROFILE
    # ----------------------------
    @app.route('/edit-profile', methods=['POST'])
    @require_token
    def edit_profile():
        user = User.query.filter_by(username=request.username).first()
        data = request.form
        bio = data.get('bio')
        pic = request.files.get('profile_picture')

        user.bio = bio
        if pic and pic.filename:
            try:
                encoded = base64.b64encode(pic.read()).decode('utf-8')
                user.profile_picture = f"data:image/png;base64,{encoded}"
            except Exception as e:
                return jsonify({"error": "Image error"}), 500

        try:
            db.session.commit()
            return jsonify({"message": "Profile updated"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Update failed"}), 500

    # ----------------------------
    # OPTIONAL: DEBUG LOGOUT
    # ----------------------------
    @app.route('/logout')
    def logout():
        return jsonify({"message": "Logged out (noop for JWT)"}), 200
