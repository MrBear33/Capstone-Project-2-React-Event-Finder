import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PageStyles.css'; // Import CSS for styling

function EventsPage({ user }) {
  const [events, setEvents] = useState([]);       // Fetched event list
  const [error, setError] = useState('');         // Error state
  const [loading, setLoading] = useState(true);   // Loading state
  const [savedIds, setSavedIds] = useState(new Set()); // Tracks saved event IDs

  // Fetch events from backend on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await axios.get('/events', {
          withCredentials: true
        });
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

  // Handle saving an event
  async function handleSave(apiEventId) {
    try {
      const res = await axios.post(`/save_event/${apiEventId}`, null, {
        withCredentials: true
      });

      if (res.status === 201 || res.status === 200) {
        setSavedIds(new Set([...savedIds, apiEventId])); // Update saved set
      }
    } catch (err) {
      console.error("Failed to save event:", err);
      setError('Could not save event.');
    }
  }

  if (loading) return <p>Loading events...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="page-container">
      <h2>Nearby Events</h2>

      {events.length === 0 ? (
        <p>No events found in your area.</p>
      ) : (
        <ul>
          {events.map(event => (
            <li key={event.id} style={{ marginBottom: '2rem' }}>
              <p><strong>{event.name}</strong></p>
              <p>{event._embedded?.venues?.[0]?.name || "Unknown location"}</p>
              <p>{new Date(event.dates.start.dateTime).toLocaleString()}</p>

              {/* Show event image if available */}
              {event.images?.[0]?.url && (
                <img
                  src={event.images[0].url}
                  alt={event.name}
                  style={{ maxWidth: "200px" }}
                />
              )}

              {/* Save button */}
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
