import logging
import os
import base64
import requests
from flask import request, jsonify, session
from flask_login import login_required, current_user, login_user, logout_user
from app.models import User, Event, Friendship, SavedEvent
from app.db import db
from bcrypt import hashpw, gensalt, checkpw
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')

# Configure logging for debugging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)



def init_routes(app):
    # User login route
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password', '').encode('utf-8')

        user = User.query.filter_by(username=username).first()
        if user and checkpw(password, user.password.encode('utf-8')):
            login_user(user)
            session['user_id'] = user.id
            try:
                # Get geolocation from Google API
                geo_res = requests.post(
                    f"https://www.googleapis.com/geolocation/v1/geolocate?key={GOOGLE_API_KEY}",
                    json={"considerIp": True}
                )
                if geo_res.status_code == 200:
                    location_data = geo_res.json().get('location')
                    if location_data:
                        session['geolocation'] = location_data
                        logging.debug(f"Saved geolocation to session: {session['geolocation']}")

                else:
                    logging.error(f"Geolocation request failed: {geo_res.status_code} - {geo_res.text}")
            
            except Exception as e:
                logging.error(f"Geolocation error: {e}")
            return jsonify({"message": "Login successful", "username": user.username}), 200

        return jsonify({"error": "Invalid username or password"}), 401
    
    @app.route('/check-auth')
    def check_auth():
        if current_user.is_authenticated:
            return jsonify({
                "authenticated": True,
                "username": current_user.username
            }), 200
        return jsonify({
            "authenticated": False
        }), 401

    # User registration route
    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Check for duplicates and password strength
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already taken"}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already in use"}), 400

        if len(password) < 8 or not any(c.isdigit() for c in password) or not any(c.isupper() for c in password) \
            or not any(c.islower() for c in password) or not any(c in "!@#$%^&*()-_+=<>?/|{}[]~`" for c in password):
            return jsonify({"error": "Password does not meet complexity requirements."}), 400

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

    # Get user profile and saved events
    @app.route('/user/<username>')
    def user_homepage(username):
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
        } for e in user.saved_events
]
        geolocation = session.get('geolocation', {})
        lat = geolocation.get('lat')
        lng = geolocation.get('lng')

        logging.debug(f"Session geolocation on homepage: {session.get('geolocation')}")
        logging.debug(f"Geolocation for {user.username}: lat={lat}, lng={lng}")


        return jsonify({
            "username": user.username,
            "bio": user.bio,
            "saved_events": saved_events,
            "latitude": lat,
            "longitude": lng,
        }), 200

    # Fetch nearby events using Ticketmaster API
    @app.route('/events')
    def events():
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401

        geolocation = session.get('geolocation')
        events = []

        if geolocation:
            try:
                latitude = geolocation.get('lat')
                longitude = geolocation.get('lng')
                if not latitude or not longitude:
                    raise ValueError("Missing geolocation data")

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
                    events_data = res.json()
                    events = events_data.get('_embedded', {}).get('events', [])
            except Exception as e:
                logging.error(f"Ticketmaster error: {e}")

        return jsonify(events), 200

    # Save an event to user's account
    @app.route('/save_event/<string:api_event_id>', methods=['POST'])
    @login_required
    def save_event(api_event_id):
        try:
            response = requests.get(
                f"https://app.ticketmaster.com/discovery/v2/events/{api_event_id}.json",
                params={"apikey": TICKETMASTER_API_KEY}
            )
            if response.status_code != 200:
                return jsonify({"error": "Failed to fetch event details"}), 400

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

            saved_event = SavedEvent.query.filter_by(user_id=current_user.id, event_id=event.id).first()
            if saved_event:
                return jsonify({"message": "Event already saved"}), 200

            new_saved_event = SavedEvent(user_id=current_user.id, event_id=event.id)
            db.session.add(new_saved_event)
            db.session.commit()
            return jsonify({"message": "Event saved successfully"}), 201
        except Exception as e:
            db.session.rollback()
            logging.error(f"Error saving event: {e}")
            return jsonify({"error": "An error occurred"}), 500

    # Check if a specific event is saved
    @app.route('/is_event_saved/<string:api_event_id>', methods=['GET'])
    @login_required
    def is_event_saved(api_event_id):
        event = Event.query.filter_by(api_event_id=api_event_id).first()
        if event:
            saved_event = SavedEvent.query.filter_by(user_id=current_user.id, event_id=event.id).first()
            return jsonify({'saved': bool(saved_event)}), 200
        return jsonify({'saved': False}), 200

    # Remove a saved event
    @app.route('/remove_saved_event/<int:saved_event_id>', methods=['POST'])
    @login_required
    def remove_saved_event(saved_event_id):
        try:
            saved_event = SavedEvent.query.filter_by(id=saved_event_id, user_id=current_user.id).first()
            if not saved_event:
                return jsonify({"error": "Event not found or not authorized"}), 404

            db.session.delete(saved_event)
            db.session.commit()
            return jsonify({"message": "Event removed successfully"}), 200
        except Exception as e:
            db.session.rollback()
            logging.error(f"Error removing event: {e}")
            return jsonify({"error": "An error occurred"}), 500

    # Add a new friend
    @app.route('/add_friend', methods=['POST'])
    @login_required
    def add_friend():
        friend_username = request.get_json().get('username')
        friend = User.query.filter_by(username=friend_username).first()

        if not friend or friend.id == current_user.id:
            return jsonify({"error": "Invalid friend username"}), 400

        existing = Friendship.query.filter_by(user_id=current_user.id, friend_id=friend.id).first()
        if existing:
            return jsonify({"message": "Already friends"}), 200

        try:
            new_friendship = Friendship(user_id=current_user.id, friend_id=friend.id)
            db.session.add(new_friendship)
            db.session.commit()
            return jsonify({"message": f"Friend added: {friend.username}"}), 201
        except Exception as e:
            db.session.rollback()
            logging.error(f"Error adding friend: {e}")
            return jsonify({"error": "An error occurred"}), 500

    # Get current user's friends
    @app.route('/friends')
    @login_required
    def friends():
        friends = User.query.join(Friendship, User.id == Friendship.friend_id)\
                            .filter(Friendship.user_id == current_user.id).all()
        friends_list = [{"username": friend.username, "email": friend.email} for friend in friends]
        return jsonify({"friends": friends_list}), 200

    # Update user profile
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
                encoded_image = base64.b64encode(profile_picture.read()).decode('utf-8')
                user.profile_picture = f"data:image/png;base64,{encoded_image}"
            except Exception as e:
                logging.error(f"Profile image error: {e}")
                return jsonify({"error": "Error processing profile image"}), 500

        try:
            db.session.commit()
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": "Failed to update profile"}), 500

    # Log out the current user
    @app.route('/logout')
    def logout():
        logout_user()
        session.clear()
        return jsonify({"message": "Logged out"}), 200
