import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../axiosWithToken';              // Axios instance with token already included
import './UserHomepage.css';                        // Styles for this page

function UserHomepage({ user }) {
  const { username } = useParams(); // Grab username from the URL

  // State for user profile data
  const [userData, setUserData] = useState(null);

  // State for location
  const [location, setLocation] = useState(null);

  // Loading and error handling
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Messages for feedback
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user info when component loads
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await axios.get(`/user/${username}`);
        setUserData(res.data);        // Save user info to state
        setLoading(false);            // Done loading
      } catch (err) {
        console.error("Couldn't load profile:", err);
        setError('Couldn’t load your profile right now.');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [username]);

  // Grab browser's location and send to backend
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setLocation(coords); // Save locally too (optional)

          // Send to backend so it can store or use it
          try {
            await axios.post('/api/save_location', coords);
            console.log("Location sent to backend:", coords);
          } catch (err) {
            console.warn("Could not send location:", err);
          }
        },
        err => {
          console.warn("Could not get location:", err.message);
        }
      );
    }
  }, []);

  // Remove an event from saved list
  async function handleRemove(savedEventId) {
    try {
      const res = await axios.post(`/remove_saved_event/${savedEventId}`);
      if (res.status === 200) {
        setMessage("Event removed!");
        setErrorMessage('');

        // Remove the event from the local UI
        setUserData(data => ({
          ...data,
          saved_events: data.saved_events.filter(
            event => event.saved_event_id !== savedEventId
          )
        }));

        setTimeout(() => setMessage(''), 3000); // Clear message
      }
    } catch (err) {
      console.error("Couldn't remove event:", err);
      setMessage('');
      setErrorMessage("Something went wrong. Try again?");
    }
  }

  if (loading) return <p>Loading your profile...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="user-homepage">
      <h2>Welcome, {userData.username}!</h2>

      {/* Profile picture and optional bio/location */}
      <div className="user-info-section">
        <div className="profile-picture-container">
          <img
            src={userData.profile_picture || "/static/default_user.png"}
            alt="Profile"
            className="profile-picture"
          />
        </div>

        <div className="user-details">
          {/* Show browser-retrieved location if available */}
          {location && (
            <p>
              <strong>Your Location (from browser):</strong>{' '}
              Latitude {location.lat.toFixed(4)}, Longitude {location.lng.toFixed(4)}
            </p>
          )}

          {/* Optional bio from backend */}
          {userData.bio && (
            <p><strong>Bio:</strong> {userData.bio}</p>
          )}
        </div>
      </div>

      <h3>Saved Events</h3>

      {/* Flash messages */}
      {message && <p className="success-message">{message}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Event list or fallback */}
      {userData.saved_events.length > 0 ? (
        <ul className="event-list">
          {userData.saved_events.map(event => (
            <li key={event.saved_event_id} className="event-card">
              <p><strong>{event.name}</strong></p>
              <p>{event.location}</p>
              <p>{new Date(event.date).toLocaleString()}</p>

              {/* Event image if available */}
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                />
              )}

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
