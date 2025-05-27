import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PageStyles.css'; // Import CSS for styling

// Base URL for Flask backend (live or local fallback)
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function FriendsPage({ user }) {
  const [friends, setFriends] = useState([]);     // List of current friends
  const [newFriend, setNewFriend] = useState(''); // Input for adding a friend
  const [message, setMessage] = useState('');     // Success message
  const [error, setError] = useState('');         // Error message

  // Fetch current user's friends on mount
  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await axios.get(`${BASE_URL}/friends`, {
          withCredentials: true
        });
        setFriends(res.data.friends); // List of { username, email }
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Could not load friends.");
      }
    }

    fetchFriends();
  }, []);

  // Handle adding a new friend by username
  async function handleAddFriend(evt) {
    evt.preventDefault();     // Stop page from reloading
    setMessage('');           // Clear previous success
    setError('');             // Clear previous error

    try {
      const res = await axios.post(`${BASE_URL}/add_friend`, { username: newFriend }, {
        withCredentials: true
      });

      if (res.status === 201 || res.status === 200) {
        setMessage(res.data.message);                           // Show success
        setNewFriend('');                                       // Clear input
        setFriends(f => [...f, { username: newFriend }]);       // Optimistically update UI
      }
    } catch (err) {
      console.error("Error adding friend:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);                      // Specific error message
      } else {
        setError("Could not add friend.");                      // Generic fallback
      }
    }
  }

  return (
    <div className="page-container">
      <h2>Your Friends</h2>

      {/* Show list of current friends */}
      {friends.length > 0 ? (
        <ul>
          {friends.map((friend, idx) => (
            <li key={idx}>
              {friend.username}
              {friend.email ? ` (${friend.email})` : ''}
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no friends added yet.</p>
      )}

      <h3>Add a Friend</h3>

      {/* Show messages for success or error */}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Friend add form */}
      <form onSubmit={handleAddFriend}>
        <input
          name="username"
          placeholder="Friend's username"
          value={newFriend}
          onChange={e => setNewFriend(e.target.value)}
          required
        />
        <button type="submit">Add Friend</button>
      </form>
    </div>
  );
}

export default FriendsPage;
