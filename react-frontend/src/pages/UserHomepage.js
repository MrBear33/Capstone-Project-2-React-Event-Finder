import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function UserHomepage({ user }) {
  // Extract the `:username` from the URL
  const { username } = useParams();

  // Store the user's data and their saved events
  const [userData, setUserData] = useState(null);

  // Error and loading states for feedback
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch user info and saved events when the page loads
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Call the Flask backend to get this user's info
        const res = await axios.get(`/user/${username}`, {
          withCredentials: true // Include cookies for session-based login
        });

        setUserData(res.data);  // Set the returned user data in state
        setLoading(false);      // Stop showing loading indicator
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Unable to load user profile.');
        setLoading(false);
      }
    }

    fetchUserData(); // Run the async function
  }, [username]);

  // Handle removing a saved event by its `saved_event_id`
  async function handleRemove(savedEventId) {
    try {
      // Tell the backend to remove this saved event
      await axios.post(`/remove_saved_event/${savedEventId}`, null, {
        withCredentials: true
      });

      // Update the saved events list in the UI by filtering it out
      setUserData(data => ({
        ...data,
        saved_events: data.saved_events.filter(event => event.saved_event_id !== savedEventId)
      }));
    } catch (err) {
      console.error("Error removing saved event:", err);
    }
  }

  // Show loading message while data is being fetched
  if (loading) return <p>Loading user profile...</p>;

  // Show error message if data couldn't be loaded
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Welcome, {userData.username}!</h2>

      {/* Show the user's bio if they have one */}
      {userData.bio && <p><strong>Bio:</strong> {userData.bio}</p>}

      <h3>Saved Events</h3>

      {/* Render a list of saved events, or a fallback message if none exist */}
      {userData.saved_events.length > 0 ? (
        <ul>
          {userData.saved_events.map((event) => (
            <li key={event.saved_event_id}>
              {/* Event details */}
              <p><strong>{event.name}</strong></p>
              <p>{event.location}</p>
              <p>{new Date(event.date).toLocaleString()}</p>

              {/* Show event image if one is available */}
              {event.image_url && (
                <img
                  src={event.image_url}
                  alt={event.name}
                  style={{ maxWidth: "200px", marginBottom: "1rem" }}
                />
              )}

              {/* Button to remove the event from user's saved list */}
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
