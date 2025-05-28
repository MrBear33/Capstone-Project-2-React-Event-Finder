import os
import jwt
import requests
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify

# Get the JWT secret key from environment
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "847204925487452kjffha0df98fwrfwkljhkh487f8")  
# -------------------------
# Generate JWT for a user
# -------------------------
def generate_token(user):
    """
    Create a JWT token for the user that lasts 24 hours.
    """
    payload = {
        "username": user.username,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")

# -------------------------
# Verify a JWT token
# -------------------------
def verify_token(token):
    """
    Decode a JWT token and return the username if valid, otherwise None.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        return payload["username"]
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# -------------------------
# Require token for a route
# -------------------------
# def require_token(f):
#     """
#     Decorator that locks down a route to token-authenticated users.
#     Attaches the username to request.username.
#     """
#     @wraps(f)
#     def wrapper(*args, **kwargs):
#         auth_header = request.headers.get("Authorization")

#         if not auth_header or not auth_header.startswith("Bearer "):
#             return jsonify({"error": "Missing or invalid token"}), 401

#         token = auth_header.split(" ")[1]
#         username = verify_token(token)

#         if not username:
#             return jsonify({"error": "Invalid or expired token"}), 401

#         request.username = username
#         return f(*args, **kwargs)
#     return wrapper
# No longer using require_token decorator, as it was not used in the codebase
# -------------------------
# Geolocation via Google API
# -------------------------
def get_geolocation():
    """
    Get geolocation based on IP address using Google Geolocation API.
    Returns a dict with latitude and longitude if successful.
    """
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    url = f"https://www.googleapis.com/geolocation/v1/geolocate?key={GOOGLE_API_KEY}"

    try:
        response = requests.post(url, json={})
        response.raise_for_status()
        data = response.json()
        return {
            "latitude": data['location']['lat'],
            "longitude": data['location']['lng']
        }
    except requests.exceptions.RequestException as e:
        print(f"Error fetching geolocation: {e}")
        return None
