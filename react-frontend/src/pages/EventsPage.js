import React, { useEffect, useState } from 'react';
import axios from '../axiosWithToken';             // Custom axios instance with token
import './PageStyles.css';                         // Page-specific styles

function EventsPage({ user }) {
  const [events, setEvents] = useState([]);              // Holds fetched event data
  const [error, setError] = useState('');                // Error message display
  const [loading, setLoading] = useState(true);          // Loading spinner toggle
  const [savedIds, setSavedIds] = useState(new Set());   // Track saved event IDs

  // Fetch events and saved events
  useEffect(() => {
    async function fetchData() {
      try {
        // Get all events near user
        const eventRes = await axios.get('/events');
        setEvents(eventRes.data);

        // Get list of saved event IDs
        const savedRes = await axios.get('/friends'); // Placeholder: replace this with correct saved-events endpoint if you have one
        const savedEventIds = new Set(savedRes.data.saved_event_ids || []); // Update this based on your actual response
        setSavedIds(savedEventIds);
      } catch (err) {
        console.error("Error loading events:", err);
        if (err.response?.data?.error === "User location not set.") {
          setError("You must allow location access first.");
        } else {
          setError("Unable to load events right now.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Save an event
  async function handleSave(apiEventId) {
    try {
      const res = await axios.post(`/save_event/${apiEventId}`);
      if (res.status === 200 || res.status === 201) {
        setSavedIds(prev => new Set(prev).add(apiEventId));
      }
    } catch (err) {
      console.error("Failed to save event:", err);
      setError("Could not save event. Please try again.");
    }
  }

  // Unsave an event
  async function handleUnsave(apiEventId) {
    try {
      const res = await axios.post(`/remove_saved_event_by_api_id/${apiEventId}`);
      if (res.status === 200) {
        const updated = new Set(savedIds);
        updated.delete(apiEventId);
        setSavedIds(updated);
      }
    } catch (err) {
      console.error("Failed to unsave event:", err);
      setError("Could not remove event. Please try again.");
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
              <p>{event._embedded?.venues?.[0]?.name || "Unknown location"}</p>
              <p>{new Date(event.dates?.start?.dateTime).toLocaleString()}</p>

              {event.images?.[0]?.url && (
                <img
                  src={event.images[0].url}
                  alt={event.name}
                  className="event-image"
                />
              )}

              <div>
                {savedIds.has(event.id) ? (
                  <button onClick={() => handleUnsave(event.id)} className="unsave-button">
                    Unsave
                  </button>
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
