import pytest
from app.models import User, Event, SavedEvent, db

@pytest.fixture
def setup_test_user(init_database):
    """Fixture to create and return a test user."""
    user = User(username="testuser", email="test@example.com", password="hashedpassword")
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def setup_test_events(init_database):
    """Fixture to create test events."""
    event1 = Event(
        api_event_id="event1",
        name="Test Event 1",
        location="Venue 1, City 1, State 1",
        date="2025-01-20",
        category="Music",
        image_url="/static/event1_image.png",
    )
    event2 = Event(
        api_event_id="event2",
        name="Test Event 2",
        location="Venue 2, City 2, State 2",
        date="2025-01-25",
        category="Art",
        image_url=None,
    )
    db.session.add_all([event1, event2])
    db.session.commit()
    return [event1, event2]


@pytest.fixture
def setup_test_saved_events(setup_test_user, init_database):
    """Fixture to create saved events for a user."""
    user = setup_test_user
    event = Event(
        api_event_id="event3",
        name="Saved Test Event",
        location="Saved Venue, Saved City, Saved State",
        date="2025-02-15",
        category="Theatre",
        image_url="/static/saved_event_image.png",
    )
    db.session.add(event)
    db.session.commit()
    saved_event = SavedEvent(user_id=user.id, event_id=event.id)
    db.session.add(saved_event)
    db.session.commit()
    return user, [saved_event]


@pytest.fixture
def setup_test_friends(setup_test_user, init_database):
    """Fixture to create friends for a user."""
    user = setup_test_user
    friend1 = User(username="friend1", email="friend1@example.com", password="hashedpassword")
    friend2 = User(username="friend2", email="friend2@example.com", password="hashedpassword")
    db.session.add_all([friend1, friend2])
    db.session.commit()

    # Establish friendships
    user.friends.append(friend1)
    user.friends.append(friend2)
    db.session.commit()
    return [friend1, friend2]


# Base Template Tests
def test_base_template_renders_correctly(test_client):
    response = test_client.get('/')
    assert response.status_code == 200
    assert b"Event Tracker" in response.data
    assert b"&copy;" in response.data


# Index Template Tests
def test_index_template_rendering(test_client):
    response = test_client.get('/')
    assert response.status_code == 200
    assert b"Welcome to Event Tracker!" in response.data
    assert b'<button>Login</button>' in response.data
    assert b'<button>Create an Account</button>' in response.data


# Login Template Tests
def test_login_template_rendering(test_client):
    response = test_client.get('/login')
    assert response.status_code == 200
    assert b"<h1>Login</h1>" in response.data


# Register Template Tests
def test_register_template_rendering(test_client):
    response = test_client.get('/register')
    assert response.status_code == 200
    assert b"<h1>Create an Account</h1>" in response.data


# Events Template Tests
def test_events_template_rendering_with_events(test_client, setup_test_events, setup_test_user):
    user = setup_test_user
    events = setup_test_events
    with test_client.session_transaction() as sess:
        sess['user_id'] = user.id  # Authenticate the user

    response = test_client.get('/events', follow_redirects=True)  # Follow the redirect if any
    assert response.status_code == 200
    for event in events:
        assert event.name.encode('utf-8') in response.data


def test_events_template_rendering_without_events(test_client, setup_test_user):
    user = setup_test_user
    with test_client.session_transaction() as sess:
        sess['user_id'] = user.id  # Authenticate the user

    response = test_client.get('/events', follow_redirects=True)  # Follow the redirect if any
    assert response.status_code == 200
    assert b"No events found in your area." in response.data


# Edit Profile Template Tests
def test_edit_profile_template_rendering(test_client, setup_test_user):
    user = setup_test_user
    with test_client.session_transaction() as sess:
        sess['user_id'] = user.id  # Authenticate the user

    response = test_client.get('/edit-profile', follow_redirects=True)  # Follow the redirect if any
    assert response.status_code == 200
    assert b"Edit Profile" in response.data
    assert b"Current Profile Picture" in response.data
    assert b"Save Changes" in response.data


# Friends Template Tests
def test_friends_template_with_friends(test_client, setup_test_user, setup_test_friends):
    user = setup_test_user
    friends = setup_test_friends
    with test_client.session_transaction() as sess:
        sess['user_id'] = user.id  # Authenticate the user

    response = test_client.get('/friends', follow_redirects=True)  # Follow the redirect if any
    assert response.status_code == 200
    for friend in friends:
        assert friend.username.encode('utf-8') in response.data


def test_friends_template_no_friends(test_client, setup_test_user):
    user = setup_test_user
    with test_client.session_transaction() as sess:
        sess['user_id'] = user.id  # Authenticate the user

    response = test_client.get('/friends', follow_redirects=True)  # Follow the redirect if any
    assert response.status_code == 200
    assert b"You have no friends yet." in response.data



# User Homepage Template Tests
def test_user_homepage_rendering(test_client, setup_test_saved_events):
    user, saved_events = setup_test_saved_events
    with test_client.session_transaction() as sess:
        sess['user_id'] = user.id

    response = test_client.get(f'/user/{user.username}')
    assert response.status_code == 200
    for event in saved_events:
        assert event.event.name.encode('utf-8') in response.data


def test_user_homepage_template_add_friend_form(test_client, setup_test_user):
    user = setup_test_user
    with test_client.session_transaction() as sess:
        sess['user_id'] = user.id

    response = test_client.get(f'/user/{user.username}')
    assert b'<form action="/add_friend" method="POST">' in response.data
