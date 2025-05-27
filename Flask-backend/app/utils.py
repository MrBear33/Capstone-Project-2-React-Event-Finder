import os
import jwt
import requests
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

# Get your secret key from the environment for signing tokens
SECRET_KEY = os.getenv("SECRET_KEY", "default-secret")  # Change this in production

# -------------------------
# Generate JWT for a user
# -------------------------
def generate_token(user):
    """
    Create a JWT token for the user that lasts 24 hours.
    """
    payload = {
        "username": user.username,  # Attach username in the token
        "exp": datetime.utcnow() + timedelta(hours=24)  # Token will expire in 24 hours
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


# -------------------------
# Check and decode a token
# -------------------------
def verify_token(token):
    """
    Decode a JWT token and return the username if valid, otherwise None.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["username"]  # Return the embedded username
    except jwt.ExpiredSignatureError:
        return None  # Token is expired
    except jwt.InvalidTokenError:
        return None  # Token is just bad


# -------------------------
# Require token for a route
# -------------------------
def require_token(f):
    """
    Decorator that locks down a route to token-authenticated users.
    Attaches the username to `request.username`.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth = request.headers.get("Authorization")  # Looks like "Bearer <token>"

        # If the header is missing or doesn't start right
        if not auth or not auth.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid token"}), 401

        token = auth.split(" ")[1]  # Pull out just the token part
        username = verify_token(token)

        if not username:
            return jsonify({"error": "Invalid or expired token"}), 401

        request.username = username  # Attach username to the request
        return f(*args, **kwargs)

    return wrapper


# -------------------------
# Geolocation via Google API
# -------------------------
def get_geolocation():
    """
    Get geolocation based on IP address using Google Geolocation API.
    Returns a diction with latitude and longitude if successful, otherwise None.
    """
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    url = f"https://www.googleapis.com/geolocation/v1/geolocate?key={GOOGLE_API_KEY}"

    try:
        response = requests.post(url, json={})  # Sending an empty request for approximate location
        response.raise_for_status()
        data = response.json()
        return {
            "latitude": data['location']['lat'],
            "longitude": data['location']['lng']
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching geolocation: {e}")
        return None
