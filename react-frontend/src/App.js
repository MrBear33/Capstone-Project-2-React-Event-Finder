import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Page components
import LandingPage from './pages/LandingPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import EventsPage from './pages/EventsPage.js';
import UserHomepage from './pages/UserHomepage.js';
import FriendsPage from './pages/FriendsPage.js';
import EditProfile from './pages/EditProfile.js';

// Navbar component
import Navbar from './pages/Navbar.js';

function App() {
  const [user, setUser] = useState(null);       // Stores logged-in user's username
  const navigate = useNavigate();               // For redirecting users on logout

  // When the app loads, check for a saved token and decode it
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the token to get the username
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser(payload.username);
      } catch (err) {
        console.error("Failed to decode token:", err);
        setUser(null); // If decoding fails, clear user
      }
    } else {
      setUser(null); // No token found, no user
    }
  }, []);

  // Logs the user out by clearing the token and user state
  const handleLogout = () => {
    localStorage.removeItem('token'); // Get rid of the token
    setUser(null);                    // Reset app state
    navigate('/');                    // Redirect to landing page
  };

  return (
    <div>
      {/* Always show navbar and pass user info + logout handler */}
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        {/* Redirect to user homepage if logged in, otherwise show landing page */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={`/user/${user}`} replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/events" element={<EventsPage user={user} />} />
        <Route path="/friends" element={<FriendsPage user={user} />} />
        <Route path="/edit-profile" element={<EditProfile user={user} />} />
        <Route path="/user/:username" element={<UserHomepage user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
