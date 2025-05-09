import pytest
from app.models import User, Event, SavedEvent, Friendship
from app.db import db
from datetime import datetime

# Test User Model
def test_create_user(init_database):
    """Test creating a user."""
    user = User(username="testuser", email="test@example.com", password="password")
    db.session.add(user)
    db.session.commit()

    assert user.id is not None
    assert user.username == "testuser"
    assert user.email == "test@example.com"

def test_unique_username(init_database):
    """Test unique constraint on username."""
    user1 = User(username="testuser", email="test1@example.com", password="password")
    user2 = User(username="testuser", email="test2@example.com", password="password")
    db.session.add(user1)
    db.session.commit()

    with pytest.raises(Exception):
        db.session.add(user2)
        db.session.commit()

def test_user_friends_relationship(init_database):
    """Test the friendship relationship."""
    user1 = User(username="user1", email="user1@example.com", password="password")
    user2 = User(username="user2", email="user2@example.com", password="password")
    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()

    # Add user2 as a friend of user1
    friendship = Friendship(user_id=user1.id, friend_id=user2.id)
    db.session.add(friendship)
    db.session.commit()

    assert user2 in user1.friends
    assert user1 in user2.friend_of

# Test Event Model
def test_create_event(init_database):
    """Test creating an event."""
    event = Event(
        api_event_id="event123",
        name="Test Event",
        location="Test Location",
        date=datetime(2025, 1, 1, 12, 0, 0),
        category="Music",
        image_url="https://example.com/event.jpg"
    )
    db.session.add(event)
    db.session.commit()

    assert event.id is not None
    assert event.name == "Test Event"

def test_unique_api_event_id(init_database):
    """Test unique constraint on api_event_id."""
    event1 = Event(
        api_event_id="event123",
        name="Event 1",
        location="Location 1",
        date=datetime(2025, 1, 1, 12, 0, 0),
    )
    event2 = Event(
        api_event_id="event123",
        name="Event 2",
        location="Location 2",
        date=datetime(2025, 1, 2, 12, 0, 0),
    )
    db.session.add(event1)
    db.session.commit()

    with pytest.raises(Exception):
        db.session.add(event2)
        db.session.commit()

# Test SavedEvent Model
def test_saved_event_relationship(init_database):
    """Test saving an event for a user."""
    user = User(username="testuser", email="test@example.com", password="password")
    event = Event(
        api_event_id="event123",
        name="Test Event",
        location="Test Location",
        date=datetime(2025, 1, 1, 12, 0, 0)
    )
    db.session.add(user)
    db.session.add(event)
    db.session.commit()

    saved_event = SavedEvent(user_id=user.id, event_id=event.id)
    db.session.add(saved_event)
    db.session.commit()

    assert saved_event.id is not None
    assert saved_event.event.name == "Test Event"
    assert saved_event.user.username == "testuser"
