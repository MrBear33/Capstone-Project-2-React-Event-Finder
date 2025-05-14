import React, { useEffect, useState } from 'react'; // Import core React and hooks
import { Routes, Route, Navigate } from 'react-router-dom'; // React Router v6 components for route handling

// Import all page components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import UserHomepage from './pages/UserHomepage';
import FriendsPage from './pages/FriendsPage';
import EditProfile from './pages/EditProfile';

function App() {
  // Stores the logged-in user's username (null if not logged in)
  const [user, setUser] = useState(null);

  // useEffect runs once when the component mounts
  useEffect(() => {
    // Check if a user session already exists using Flask's /check-auth endpoint
    fetch("http://localhost:5000/check-auth", {
      credentials: "include" // Required to send cookies (Flask session cookie)
    })
      .then(res => {
        // If not authenticated, throw an error to trigger catch block
        if (!res.ok) throw new Error("Not authenticated");
        return res.json(); // Parse JSON if successful
      })
      .then(data => {
        // Save the logged-in user's username in state
        setUser(data.username);
      })
      .catch(() => {
        // Not logged in → reset user state to null
        setUser(null);
      });
  }, []);

  return (
    <div>
      <Routes>
        {/* Landing page: accessible to anyone */}
        <Route path="/" element={<LandingPage />} />

        {/* Login page: passes setUser to update state after successful login */}
        <Route path="/login" element={<LoginPage setUser={setUser} />} />

        {/* Register page: handles user registration */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Events page: user must be logged in to see personalized data */}
        <Route path="/events" element={<EventsPage user={user} />} />

        {/* Friends list page: view current user's friends */}
        <Route path="/friends" element={<FriendsPage user={user} />} />

        {/* Profile editing page: update bio and profile picture */}
        <Route path="/edit-profile" element={<EditProfile user={user} />} />

        {/* User homepage: show saved events, profile info, etc. */}
        <Route path="/user/:username" element={<UserHomepage user={user} />} />

        {/* Fallback route: redirect unknown paths to homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
