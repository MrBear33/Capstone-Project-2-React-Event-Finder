import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './UserHomepage.css'; // Custom styling for this page

function UserHomepage({ user }) {
  // Grab the username from the URL (like /user/jacob)
  const { username } = useParams();

  // State to hold all user data returned from the backend
  const [userData, setUserData] = useState(null);

  // Track loading and error status while fetching data
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Used to display messages when an event is removed
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load user profile + saved events when the component mounts
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await axios.get(`/user/${username}`, {
          withCredentials: true // Needed for session-based auth
        });
        setUserData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Couldn't load profile:", err);
        setError('Couldn’t load your profile right now.');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [username]);

  // Handle removing an event from the saved list
  async function handleRemove(savedEventId) {
    try {
      const res = await axios.post(`/remove_saved_event/${savedEventId}`, null, {
        withCredentials: true
      });

      if (res.status === 200) {
        setMessage("Event removed!");
        setErrorMessage('');

        // Update local state to remove the event from the list
        setUserData(data => ({
          ...data,
          saved_events: data.saved_events.filter(event => event.saved_event_id !== savedEventId)
        }));

        // Clear message after a few seconds
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error("Couldn't remove event:", err);
      setMessage('');
      setErrorMessage("Something went wrong. Try again?");
    }
  }

  // Show a simple message while we load data
  if (loading) return <p>Loading your profile...</p>;

  // Show an error if something failed
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="user-homepage">
      <h2>Welcome, {userData.username}!</h2>

      {/* Show profile picture on the left, info on the right */}
      <div className="user-info-section">
        <div className="profile-picture-container">
          <img
            src={userData.profile_picture || "/static/default_user.png"} // Use uploaded pic or fallback
            alt="Profile"
            className="profile-picture"
          />
        </div>

        <div className="user-details">
          {/* Show geolocation if available */}
          {(userData.latitude && userData.longitude) && (
            <p>
              <strong>Your Location:</strong>{' '}
              Latitude {userData.latitude.toFixed(4)}, Longitude {userData.longitude.toFixed(4)}
            </p>
          )}

          {/* Show user bio if it's been set */}
          {userData.bio && <p><strong>Bio:</strong> {userData.bio}</p>}
        </div>
      </div>

      <h3>Saved Events</h3>

      {/* Pop-up messages after actions like removing events */}
      {message && <p className="success-message">{message}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Display all saved events or a note if none exist */}
      {userData.saved_events.length > 0 ? (
        <ul className="event-list">
          {userData.saved_events.map((event) => (
            <li key={event.saved_event_id} className="event-card">
              <p><strong>{event.name}</strong></p>
              <p>{event.location}</p>
              <p>{new Date(event.date).toLocaleString()}</p>

              {/* Only show image if one exists */}
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                />
              )}

              {/* Let user remove the saved event */}
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
