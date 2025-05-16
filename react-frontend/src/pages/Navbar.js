import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  // When logout is clicked, call App's logout function and redirect
  const handleClick = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <Link to="/">Home</Link>{" | "}

      {user ? (
        <>
          <Link to={`/user/${user}`}>My Page</Link>{" | "}
          <Link to="/events">Events</Link>{" | "}
          <Link to="/friends">Friends</Link>{" | "}
          <Link to="/edit-profile">Edit Profile</Link>{" | "}
          <button onClick={handleClick}>Log Out</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>{" | "}
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
