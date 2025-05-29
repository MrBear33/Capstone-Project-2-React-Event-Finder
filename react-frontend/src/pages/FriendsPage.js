import React, { useEffect, useState } from 'react';
import axios from '../axiosWithToken.js';             // Use axios that auto-sends JWT
import './PageStyles.css';                         // Import CSS for styling

function FriendsPage({ user }) {
  const [friends, setFriends] = useState([]);        // User’s friend list
  const [newFriend, setNewFriend] = useState('');    // Input for adding a friend
  const [message, setMessage] = useState('');        // Success message
  const [error, setError] = useState('');            // Error message

  // On page load, get the current user's friends
  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await axios.get('/friends');     // Token auto-included
        setFriends(res.data.friends);                // Expect list of { username, email }
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Could not load friends.");
      }
    }

    fetchFriends();
  }, []);

  // Add a new friend by username
  async function handleAddFriend(evt) {
    evt.preventDefault();     // Stop the form from reloading the page
    setMessage('');
    setError('');

    try {
      const res = await axios.post('/add_friend', { username: newFriend });  // Token auto-included

      if (res.status === 201 || res.status === 200) {
        setMessage(res.data.message);                  // Show success message
        setNewFriend('');                              // Clear input field
        setFriends(f => [...f, { username: newFriend }]); // Optimistically update UI
      }
    } catch (err) {
      console.error("Error adding friend:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);             // Use server error if provided
      } else {
        setError("Could not add friend.");
      }
    }
  }

  return (
    <div className="page-container">
      <h2>Your Friends</h2>

      {/* Show friend list or a fallback */}
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

      {/* Show result messages */}
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
