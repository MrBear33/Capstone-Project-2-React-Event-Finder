import pytest
from app.models import User
from app.db import db


def test_database_url(test_app):
    """Ensure the app uses the test database during tests."""
    assert test_app.config["SQLALCHEMY_DATABASE_URI"] == "postgresql://mrbear:your_new_password@localhost/capstone_project_test"


def test_index_route(test_client):
    """Test the index route."""
    response = test_client.get('/')
    assert response.status_code == 200
    assert b"Welcome" in response.data  # Assuming "Welcome" is in your `index.html`


def test_login_route_get(test_client):
    """Test the GET request to the login route."""
    response = test_client.get('/login')
    assert response.status_code == 200
    assert b"Login" in response.data  # Assuming "Login" is in your `login.html`


def test_login_route_post_invalid(test_client):
    """Test an invalid POST request to the login route."""
    response = test_client.post('/login', data={"username": "wrong", "password": "wrong"})
    assert response.status_code == 200
    assert b"Invalid username or password." in response.data


def test_register_route_get(test_client):
    """Test the GET request to the register route."""
    response = test_client.get('/register')
    assert response.status_code == 200
    assert b"Register" in response.data  # Assuming "Register" is in your `register.html`


def test_register_route_post(test_client, init_database):
    """Test a valid POST request to the register route."""
    response = test_client.post('/register', data={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 302  # Redirect to success page
    user = User.query.filter_by(username="testuser").first()
    assert user is not None  # Verify the user was created
    assert user.email == "test@example.com"


def test_user_homepage_route(test_client, init_database):
    """Test the user homepage route."""
    # Add a test user
    user = User(username="testuser", email="test@example.com", password="password")
    db.session.add(user)
    db.session.commit()

    # Test accessing the user's homepage
    response = test_client.get(f'/user/{user.username}')
    assert response.status_code == 200
    assert b"testuser" in response.data  # Assuming username is displayed on the homepage
