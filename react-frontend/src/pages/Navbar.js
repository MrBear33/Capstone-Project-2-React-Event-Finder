import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Import the new CSS

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleClick = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/">Home</Link>
        {user && <Link to={`/user/${user}`}>My Page</Link>}
        {user && <Link to="/events">Events</Link>}
        {user && <Link to="/friends">Friends</Link>}
        {user && <Link to="/edit-profile">Edit Profile</Link>}
      </div>
      <div className="navbar-right">
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/register">Register</Link>}
        {user && <button onClick={handleClick}>Log Out</button>}
      </div>
    </nav>
  );
}

export default Navbar;
