import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './UserHomepage.css'; // Styling for this page

function UserHomepage({ user }) {
  // Grab the username from the URL (like /user/jacob)
  const { username } = useParams();

  // Holds all the user info we get from the backend
  const [userData, setUserData] = useState(null);

  // Track if we're still waiting for the data or if something went wrong
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // These show little messages when someone removes an event
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // This runs when the page first loads to fetch the user's info
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Ask the backend for user info + saved events
        const res = await axios.get(`/user/${username}`, {
          withCredentials: true // Make sure session data is sent
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

  // Called when the user clicks “Remove” on an event
  async function handleRemove(savedEventId) {
    try {
      const res = await axios.post(`/remove_saved_event/${savedEventId}`, null, {
        withCredentials: true
      });

      if (res.status === 200) {
        // Success – update the UI and show a message
        setMessage("Event removed!");
        setErrorMessage('');

        setUserData(data => ({
          ...data,
          saved_events: data.saved_events.filter(event => event.saved_event_id !== savedEventId)
        }));

        setTimeout(() => setMessage(''), 3000); // Message disappears after 3 seconds
      }
    } catch (err) {
      console.error("Couldn't remove event:", err);
      setMessage('');
      setErrorMessage("Something went wrong. Try again?");
    }
  }

  // Show while we're waiting for the server to respond
  if (loading) return <p>Loading your profile...</p>;

  // If something failed, show a simple error
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="user-homepage">
      <h2>Welcome, {userData.username}!</h2>

      {/* Show location if we have it */}
      {(userData.latitude && userData.longitude) && (
        <p>
          <strong>Your Location:</strong>{' '}
          Latitude {userData.latitude.toFixed(4)}, Longitude {userData.longitude.toFixed(4)}
        </p>
      )}

      {/* Only show the bio if the user has one */}
      {userData.bio && <p><strong>Bio:</strong> {userData.bio}</p>}

      <h3>Saved Events</h3>

      {/* Any feedback messages after removing an event */}
      {message && <p className="success-message">{message}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* Show the list of saved events, or a note if it's empty */}
      {userData.saved_events.length > 0 ? (
        <ul className="event-list">
          {userData.saved_events.map((event) => (
            <li key={event.saved_event_id} className="event-card">
              <p><strong>{event.name}</strong></p>
              <p>{event.location}</p>
              <p>{new Date(event.date).toLocaleString()}</p>

              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                />
              )}

              {/* Remove button for this event */}
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
