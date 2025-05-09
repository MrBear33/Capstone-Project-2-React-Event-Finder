import pytest
from app import create_app, db



@pytest.fixture
def init_database(test_app):
    """Initialize the database."""
    with test_app.app_context():
        db.create_all()  # Create all tables
        yield db  # Provide the initialized database to the tests
        db.session.remove()
        db.drop_all()  # Clean up the database after tests


@pytest.fixture
def test_app():
    """Create and configure the test app."""
    app = create_app(config_name="testing")
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def test_client(test_app):
    """Provide a test client for the app."""
    return test_app.test_client()
