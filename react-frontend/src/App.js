import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Page components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventsPage from './pages/EventsPage';
import UserHomepage from './pages/UserHomepage';
import FriendsPage from './pages/FriendsPage';
import EditProfile from './pages/EditProfile';

// Navbar component
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);       // Stores logged-in user
  const navigate = useNavigate();               // Navigation hook for redirects

  // Check login session on page load
  useEffect(() => {
    fetch("http://localhost:5000/check-auth", {
      credentials: "include"
    })
      .then(res => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(data => {
        setUser(data.username);  // Save user if logged in
      })
      .catch(() => {
        setUser(null);           // Clear user if not logged in
      });
  }, []);

  // Logs the user out and clears session
  const handleLogout = async () => {
    try {
      await fetch('/logout', {
        method: 'GET',
        credentials: 'include'
      });

      setUser(null);           // Clear user state
      navigate('/');           // Redirect to landing or login
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div>
      {/* Always show navbar and pass user + logout handler */}
      <Navbar user={user} onLogout={handleLogout} />

      <Routes>
        <Route path="/" element={<LandingPage />} />
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
