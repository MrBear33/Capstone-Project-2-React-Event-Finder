import React, { useState } from 'react';
import axios from 'axios';

function EditProfile({ user }) {
  const [bio, setBio] = useState('');               // New bio input
  const [image, setImage] = useState(null);         // New profile picture file
  const [success, setSuccess] = useState('');       // Message for success
  const [error, setError] = useState('');           // Message for error

  // Handle bio text input
  const handleBioChange = evt => {
    setBio(evt.target.value);
  };

  // Handle file input (image upload)
  const handleImageChange = evt => {
    setImage(evt.target.files[0]);
  };

  // Submit bio and image to Flask backend
  const handleSubmit = async evt => {
    evt.preventDefault();
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('bio', bio);
    if (image) {
      formData.append('profile_picture', image);
    }

    try {
      const res = await axios.post('/edit-profile', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.status === 200) {
        setSuccess('Profile updated!');
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Could not update profile.');
    }
  };

  return (
    <div>
      <h2>Edit Profile</h2>

      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label htmlFor="bio">Bio:</label><br />
          <textarea
            id="bio"
            name="bio"
            rows="4"
            cols="50"
            value={bio}
            onChange={handleBioChange}
          />
        </div>

        <div>
          <label htmlFor="profile_picture">Profile Picture:</label><br />
          <input
            type="file"
            id="profile_picture"
            name="profile_picture"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
}

export default EditProfile;
