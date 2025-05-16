import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FriendsPage({ user }) {
  const [friends, setFriends] = useState([]);   // List of current friends
  const [newFriend, setNewFriend] = useState(''); // Input for adding a friend
  const [message, setMessage] = useState('');   // Success or error message
  const [error, setError] = useState('');       // Separate error message

  // Fetch current user's friends on mount
  useEffect(() => {
    async function fetchFriends() {
      try {
        const res = await axios.get('/friends', {
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
    evt.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await axios.post('/add_friend', { username: newFriend }, {
        withCredentials: true
      });

      if (res.status === 201 || res.status === 200) {
        setMessage(res.data.message);
        setNewFriend('');
        setFriends(f => [...f, { username: newFriend }]); // Optimistically update UI
      }
    } catch (err) {
      console.error("Error adding friend:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Could not add friend.");
      }
    }
  }

  return (
    <div>
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
