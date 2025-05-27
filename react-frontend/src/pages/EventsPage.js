import React, { useEffect, useState } from 'react';
import axios from '../axiosWithToken';             // Use custom axios instance with token
import './PageStyles.css';                         // Import CSS for styling

function EventsPage({ user }) {
  const [events, setEvents] = useState([]);        // Fetched event list
  const [error, setError] = useState('');          // Error state
  const [loading, setLoading] = useState(true);    // Loading state
  const [savedIds, setSavedIds] = useState(new Set()); // Track saved event IDs

  // When the page loads, go fetch events from the backend
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axios.get('/events');    // Token gets auto-attached
        setEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError('Unable to load events.');
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Save an event to the user's account
  async function handleSave(apiEventId) {
    try {
      const res = await axios.post(`/save_event/${apiEventId}`);  // Token auto-added
      if (res.status === 201 || res.status === 200) {
        // Keep track of which event IDs were saved
        setSavedIds(new Set([...savedIds, apiEventId]));
      }
    } catch (err) {
      console.error("Failed to save event:", err);
      setError('Could not save event.');
    }
  }

  // Simple loading and error states
  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="page-container">
      <h2>Nearby Events</h2>

      {/* If there are no events at all */}
      {events.length === 0 ? (
        <p>No events found in your area.</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event.id} style={{ marginBottom: '2rem' }}>
              <p><strong>{event.name}</strong></p>
              <p>{event._embedded?.venues?.[0]?.name || "Unknown location"}</p>
              <p>{new Date(event.dates.start.dateTime).toLocaleString()}</p>

              {/* Show image if one exists */}
              {event.images?.[0]?.url && (
                <img
                  src={event.images[0].url}
                  alt={event.name}
                  style={{ maxWidth: "200px" }}
                />
              )}

              {/* Save button gets disabled if already saved */}
              <div>
                {savedIds.has(event.id) ? (
                  <button disabled>Saved</button>
                ) : (
                  <button onClick={() => handleSave(event.id)}>Save</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EventsPage;
