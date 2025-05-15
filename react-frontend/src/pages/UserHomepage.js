import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function UserHomepage({ user }) {
  // Grab the :username from the URL
  const { username } = useParams();

  // State to hold fetched user data
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user info and saved events on mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await axios.get(`/user/${username}`, {
          withCredentials: true
        });

        setUserData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Unable to load user profile.');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [username]);

  // Show loading spinner or message
  if (loading) return <p>Loading user profile...</p>;

  // Show error if data couldn’t be fetched
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Welcome, {userData.username}!</h2>

      {/* Show user's bio if available */}
      {userData.bio && <p><strong>Bio:</strong> {userData.bio}</p>}

      <h3>Saved Events</h3>

      {/* Render saved events */}
      {userData.saved_events.length > 0 ? (
        <ul>
          {userData.saved_events.map((event, idx) => (
            <li key={idx}>
              <p><strong>{event.name}</strong></p>
              <p>{event.location}</p>
              <p>{new Date(event.date).toLocaleString()}</p>
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                  style={{ maxWidth: "200px", marginBottom: "1rem" }}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No saved events yet.</p>
      )}
    </div>
  );
}

export default UserHomepage;
