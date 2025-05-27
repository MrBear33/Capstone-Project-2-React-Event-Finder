import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosWithToken';              // Custom axios instance with token
import './UserHomepage.css';                         // Styling for this page

function UserHomepage({ user }) {
  // Grab the username from the URL 
  const { username } = useParams();

  // Store user data like bio, saved events, etc.
  const [userData, setUserData] = useState(null);

  // For tracking loading/error states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Feedback messages after removing an event
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user info on component mount
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await axios.get(`/user/${username}`);
        setUserData(res.data);        // Store what the backend sent
        setLoading(false);            // Stop showing "loading"
      } catch (err) {
        console.error("Couldn't load profile:", err);
        setError('Couldn’t load your profile right now.');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [username]);

  // Remove an event from the user's saved list
  async function handleRemove(savedEventId) {
    try {
      const res = await axios.post(`/remove_saved_event/${savedEventId}`);
      if (res.status === 200) {
        setMessage("Event removed!");
        setErrorMessage('');

        // Update UI by removing the deleted event
        setUserData(data => ({
          ...data,
          saved_events: data.saved_events.filter(
            event => event.saved_event_id !== savedEventId
          )
        }));

        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      }
    } catch (err) {
      console.error("Couldn't remove event:", err);
      setMessage('');
      setErrorMessage("Something went wrong. Try again?");
    }
  }

  // While we wait for the backend
  if (loading) return <p>Loading your profile...</p>;

  // Show error if one occurred
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="user-homepage">
      <h2>Welcome, {userData.username}!</h2>

      {/* Profile section with image and location/bio info */}
      <div className="user-info-section">
        <div className="profile-picture-container">
          <img
            src={userData.profile_picture || "/static/default_user.png"}
            alt="Profile"
            className="profile-picture"
          />
        </div>

        <div className="user-details">
          {userData.latitude && userData.longitude && (
            <p>
              <strong>Your Location:</strong>{' '}
              Latitude {userData.latitude.toFixed(4)}, Longitude {userData.longitude.toFixed(4)}
            </p>
          )}

          {userData.bio && (
            <p><strong>Bio:</strong> {userData.bio}</p>
          )}
        </div>
      </div>

      <h3>Saved Events</h3>

      {/* Feedback messages */}
      {message && <p className="success-message">{message}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Show list of saved events or fallback */}
      {userData.saved_events.length > 0 ? (
        <ul className="event-list">
          {userData.saved_events.map(event => (
            <li key={event.saved_event_id} className="event-card">
              <p><strong>{event.name}</strong></p>
              <p>{event.location}</p>
              <p>{new Date(event.date).toLocaleString()}</p>

              {/* Show event image if it exists */}
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                />
              )}

              {/* Button to remove the saved event */}
              <button onClick={() => handleRemove(event.saved_event_id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>You haven’t saved any events yet.</p>
      )}
    </div>
  );
}

export default UserHomepage;
