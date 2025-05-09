import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LandingPage() {
  const navigate = useNavigate();

  // check if the user is already logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/check-auth', { withCredentials: true });
        if (res.data.username) {
          navigate(`/user/${res.data.username}`);
        }
      } catch (err) {
        // not logged in — do nothing and show the landing content
        console.log("Not logged in");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div>
      <h1>Welcome to Event Tracker!</h1>
      <p>Find local events near you, save your favorites, and connect with friends.</p>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => navigate('/login')}>Log In</button>
        <button onClick={() => navigate('/register')} style={{ marginLeft: '1rem' }}>Register</button>
      </div>
    </div>
  );
}

export default LandingPage;
