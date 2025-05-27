import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Custom styling for the navbar

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  // Called when the user clicks the logout button
  const handleClick = async () => {
    await onLogout();        // Run logout logic passed down from App
    navigate('/login');      // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>

        {/* Show these links only if user is logged in */}
        {user && <Link to={`/user/${user}`}>My Page</Link>}
        {user && <Link to="/events">Events</Link>}
        {user && <Link to="/friends">Friends</Link>}
        {user && <Link to="/edit-profile">Edit Profile</Link>}
      </div>

      <div className="navbar-right">
        {/* Show login/register when not logged in */}
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}

        {/* Show logout button when user is logged in */}
        {user && (
          <button onClick={handleClick} className="logout-button">
            Log Out
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
