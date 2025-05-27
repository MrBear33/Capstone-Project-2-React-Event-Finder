import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css'; // Styling for this page
function LandingPage() {
  const navigate = useNavigate();

  // Auto-redirect if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/check-auth', {
          withCredentials: true
        });
        if (res.data.username) {
          navigate(`/user/${res.data.username}`);
        }
      } catch (err) {
        console.log("Not logged in");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="landing-page">
      <h1>Welcome to Event Tracker!</h1>
      <p>
        Find local events near you, save your favorites, and connect with friends.
      </p>

      <div className="cta-buttons">
        <button onClick={() => navigate('/login')}>Log In</button>
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </div>
  );
}

export default LandingPage;
