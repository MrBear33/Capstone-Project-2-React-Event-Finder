from app.db import db  # Correct import
from flask_login import UserMixin  # Import UserMixin for Flask-Login

# Association Table for Friendship
class Friendship(db.Model):
    __tablename__ = 'friendship'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    friend_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)

# User Model
class User(db.Model, UserMixin):  # Add UserMixin here
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    profile_picture = db.Column(db.Text, nullable=True)  # Store Base64-encoded image data
    bio = db.Column(db.Text, nullable=True)

    friends = db.relationship(
        'User',
        secondary='friendship',
        primaryjoin=(id == Friendship.user_id),
        secondaryjoin=(id == Friendship.friend_id),
        backref='friend_of'
    )
    saved_events = db.relationship('SavedEvent', backref='user', lazy=True)

# Event Model
class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    api_event_id = db.Column(db.String(200), unique=True, nullable=False)
    name = db.Column(db.String(200), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    category = db.Column(db.String(100))
    image_url = db.Column(db.String(500), nullable=True)

# Saved Event Model
class SavedEvent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)

    # Establish relationship for easier access
    event = db.relationship('Event', backref='saved_events')
