import React, { useEffect, useState } from 'react';
import axios from '../axiosWithToken';             // Custom axios instance with token
import './PageStyles.css';                         // Page-specific styles

function EventsPage({ user }) {
  const [events, setEvents] = useState([]);              // Holds fetched event data
  const [error, setError] = useState('');                // Error message display
  const [loading, setLoading] = useState(true);          // Loading spinner toggle
  const [savedIds, setSavedIds] = useState(new Set());   // Track which events were saved

  // Fetch nearby events on component mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axios.get('/events');          // Backend uses stored DB location
        setEvents(res.data);                             // Save results in state
      } catch (err) {
        console.error("Failed to fetch events:", err);
        if (err.response?.data?.error === "User location not set.") {
          setError("You must allow location access first.");
        } else {
          setError("Unable to load events right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Trigger backend save event handler
  async function handleSave(apiEventId) {
    try {
      const res = await axios.post(`/save_event/${apiEventId}`);
      if (res.status === 201 || res.status === 200) {
        setSavedIds(new Set([...savedIds, apiEventId])); // Mark as saved locally
      }
    } catch (err) {
      console.error("Failed to save event:", err);
      setError("Could not save event. Please try again.");
    }
  }

  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="page-container">
      <h2>Nearby Events</h2>

      {events.length === 0 ? (
        <p>No events found near your location.</p>
      ) : (
        <ul className="event-list">
          {events.map(event => (
            <li key={event.id} className="event-card">
              <h3>{event.name}</h3>
              <p>
                {event._embedded?.venues?.[0]?.name || "Unknown location"}
              </p>
              <p>
                {new Date(event.dates?.start?.dateTime).toLocaleString()}
              </p>

              {event.images?.[0]?.url && (
                <img
                  src={event.images[0].url}
                  alt={event.name}
                  className="event-image"
                />
              )}

              <div>
                {savedIds.has(event.id) ? (
                  <button disabled className="saved-button">Saved</button>
                ) : (
                  <button onClick={() => handleSave(event.id)}>
                    Save
                  </button>
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
