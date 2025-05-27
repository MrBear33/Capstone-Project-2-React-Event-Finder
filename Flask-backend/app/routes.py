import logging
import os
import base64
import requests
import jwt
import datetime
from flask import request, jsonify, session
from flask_login import login_required, current_user
from app.models import User, Event, Friendship, SavedEvent
from app.db import db
from bcrypt import hashpw, gensalt, checkpw
from dotenv import load_dotenv
from app.utils import require_token

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')

# Set up logging for easier debugging
logging.basicConfig(level=logging.DEBUG)


def init_routes(app):
    # LOGIN - JWT-based
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password', '').encode('utf-8')

        user = User.query.filter_by(username=username).first()
        if user and checkpw(password, user.password.encode('utf-8')):
            try:
                # Generate a JWT that lasts 1 hour
                token = jwt.encode({
                    'username': user.username,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
                }, JWT_SECRET_KEY, algorithm='HS256')

                # Optionally get location from Google
                geo_res = requests.post(
                    f"https://www.googleapis.com/geolocation/v1/geolocate?key={GOOGLE_API_KEY}",
                    json={"considerIp": True}
                )
                if geo_res.status_code == 200:
                    location_data = geo_res.json().get('location')
                    if location_data:
                        session['geolocation'] = location_data

                return jsonify({"token": token, "username": user.username}), 200

            except Exception as e:
                logging.error(f"Login error: {e}")
                return jsonify({"error": "Login failed"}), 500

        return jsonify({"error": "Invalid username or password"}), 401

    # REGISTER - with password requirement messages
    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already taken"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already in use"}), 400

        # Password complexity rules
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

    # USER HOMEPAGE - token protected
    @app.route('/user/<username>')
    @require_token
    def user_homepage(username):
        if username != request.username:
            return jsonify({"error": "Unauthorized access"}), 403

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        saved_events = [
            {
                "name": e.event.name,
                "location": e.event.location,
                "date": e.event.date.isoformat(),
                "image_url": e.event.image_url,
                "saved_event_id": e.id
            }
            for e in user.saved_events
        ]

        geo = session.get('geolocation', {})
        return jsonify({
            "username": user.username,
            "bio": user.bio,
            "profile_picture": user.profile_picture,
            "saved_events": saved_events,
            "latitude": geo.get('lat'),
            "longitude": geo.get('lng')
        }), 200

    # EVENTS (public)
    @app.route('/events')
    def events():
        geolocation = session.get('geolocation')
        if not geolocation:
            return jsonify({"error": "Geolocation not set"}), 400

        latitude = geolocation.get('lat')
        longitude = geolocation.get('lng')
        events = []

        try:
            res = requests.get(
                "https://app.ticketmaster.com/discovery/v2/events.json",
                params={
                    'apikey': TICKETMASTER_API_KEY,
                    'latlong': f"{latitude},{longitude}",
                    'radius': 50,
                    'unit': 'miles',
                    'size': 10
                }
            )
            if res.status_code == 200:
                data = res.json()
                events = data.get('_embedded', {}).get('events', [])
        except Exception as e:
            logging.error(f"Error fetching events: {e}")

        return jsonify(events), 200

    # SAVE EVENT
    @app.route('/save_event/<string:api_event_id>', methods=['POST'])
    @login_required
    def save_event(api_event_id):
        try:
            response = requests.get(
                f"https://app.ticketmaster.com/discovery/v2/events/{api_event_id}.json",
                params={"apikey": TICKETMASTER_API_KEY}
            )
            if response.status_code != 200:
                return jsonify({"error": "Event lookup failed"}), 400

            event_data = response.json()
            event = Event.query.filter_by(api_event_id=api_event_id).first()
            if not event:
                image_url = event_data.get('images', [{}])[0].get('url', '')
                event = Event(
                    api_event_id=api_event_id,
                    name=event_data.get('name', 'Unknown Event'),
                    location=event_data.get('_embedded', {}).get('venues', [{}])[0].get('name', 'Unknown Location'),
                    date=event_data.get('dates', {}).get('start', {}).get('dateTime'),
                    category=event_data.get('classifications', [{}])[0].get('segment', {}).get('name', 'Unknown Category'),
                    image_url=image_url
                )
                db.session.add(event)
                db.session.commit()

            if SavedEvent.query.filter_by(user_id=current_user.id, event_id=event.id).first():
                return jsonify({"message": "Already saved"}), 200

            new_saved_event = SavedEvent(user_id=current_user.id, event_id=event.id)
            db.session.add(new_saved_event)
            db.session.commit()
            return jsonify({"message": "Event saved"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Could not save event"}), 500

    # REMOVE EVENT
    @app.route('/remove_saved_event/<int:saved_event_id>', methods=['POST'])
    @login_required
    def remove_saved_event(saved_event_id):
        try:
            saved_event = SavedEvent.query.filter_by(id=saved_event_id, user_id=current_user.id).first()
            if not saved_event:
                return jsonify({"error": "Event not found"}), 404

            db.session.delete(saved_event)
            db.session.commit()
            return jsonify({"message": "Event removed"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to remove event"}), 500

    # ADD FRIEND
    @app.route('/add_friend', methods=['POST'])
    @login_required
    def add_friend():
        friend_username = request.get_json().get('username')
        friend = User.query.filter_by(username=friend_username).first()

        if not friend or friend.id == current_user.id:
            return jsonify({"error": "Invalid friend"}), 400

        if Friendship.query.filter_by(user_id=current_user.id, friend_id=friend.id).first():
            return jsonify({"message": "Already friends"}), 200

        try:
            new_friendship = Friendship(user_id=current_user.id, friend_id=friend.id)
            db.session.add(new_friendship)
            db.session.commit()
            return jsonify({"message": f"Friend added: {friend.username}"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Could not add friend"}), 500

    # FRIENDS LIST
    @app.route('/friends')
    @login_required
    def friends():
        friends = User.query.join(Friendship, User.id == Friendship.friend_id)\
            .filter(Friendship.user_id == current_user.id).all()

        friends_list = [{"username": f.username, "email": f.email} for f in friends]
        return jsonify({"friends": friends_list}), 200

    # EDIT PROFILE
    @app.route('/edit-profile', methods=['POST'])
    @login_required
    def edit_profile():
        data = request.form
        bio = data.get('bio')
        profile_picture = request.files.get('profile_picture')
        user = current_user

        user.bio = bio
        if profile_picture and profile_picture.filename:
            try:
                encoded = base64.b64encode(profile_picture.read()).decode('utf-8')
                user.profile_picture = f"data:image/png;base64,{encoded}"
            except Exception as e:
                return jsonify({"error": "Failed to process image"}), 500

        try:
            db.session.commit()
            return jsonify({"message": "Profile updated"}), 200
        except:
            db.session.rollback()
            return jsonify({"error": "Update failed"}), 500

    # LOGOUT (debug only)
    @app.route('/logout')
    def logout():
        session.clear()
        return jsonify({"message": "Logged out"}), 200
