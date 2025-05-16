import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function UserHomepage({ user }) {
  // Extract the `:username` parameter from the route (e.g., /user/jacob)
  const { username } = useParams();

  // Store the user’s data and saved events from the backend
  const [userData, setUserData] = useState(null);

  // General error and loading states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Feedback messages for successful or failed event removal
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch user profile and saved events when this component mounts
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Request user data from the Flask backend
        const res = await axios.get(`/user/${username}`, {
          withCredentials: true  // Required to include Flask session cookies
        });

        setUserData(res.data);  // Save user info and events to state
        setLoading(false);      // Done loading
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Unable to load user profile.');
        setLoading(false);
      }
    }

    fetchUserData();
  }, [username]);

  // Called when the user clicks "Remove" on a saved event
  async function handleRemove(savedEventId) {
    try {
      // Call backend to remove the event for this user
      const res = await axios.post(`/remove_saved_event/${savedEventId}`, null, {
        withCredentials: true
      });

      if (res.status === 200) {
        // Success: show message and update the saved events list
        setMessage("Event removed successfully.");
        setErrorMessage('');

        // Remove event from the current state
        setUserData(data => ({
          ...data,
          saved_events: data.saved_events.filter(event => event.saved_event_id !== savedEventId)
        }));

        // Optional: auto-clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error("Error removing saved event:", err);
      setMessage('');
      setErrorMessage("Failed to remove event. Please try again.");
    }
  }

  // Show loading text while the API request is in progress
  if (loading) return <p>Loading user profile...</p>;

  // Show an error message if the request failed
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Welcome, {userData.username}!</h2>

      {/* Display bio if it exists */}
      {userData.bio && <p><strong>Bio:</strong> {userData.bio}</p>}

      <h3>Saved Events</h3>

      {/* Show feedback messages */}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* List of saved events, or a fallback message if none exist */}
      {userData.saved_events.length > 0 ? (
        <ul>
          {userData.saved_events.map((event) => (
            <li key={event.saved_event_id}>
              {/* Event name, location, and formatted date */}
              <p><strong>{event.name}</strong></p>
              <p>{event.location}</p>
              <p>{new Date(event.date).toLocaleString()}</p>

              {/* Display event image if provided */}
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                  style={{ maxWidth: "200px", marginBottom: "1rem" }}
                />
              )}

              {/* Remove button triggers handleRemove with the saved_event_id */}
              <button onClick={() => handleRemove(event.saved_event_id)}>
                Remove
              </button>
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
