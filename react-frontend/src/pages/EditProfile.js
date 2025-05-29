import React, { useState } from 'react';
import axios from '../axiosWithToken.js';             // Token-aware axios instance
import './PageStyles.css';                         // Import CSS for styling

function EditProfile({ user }) {
  // State for new bio and profile picture
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null);

  // Track success or error messages
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Update bio text
  const handleBioChange = evt => {
    setBio(evt.target.value);
  };

  // Update image file
  const handleImageChange = evt => {
    setImage(evt.target.files[0]);
  };

  // Send updated profile to the backend
  const handleSubmit = async evt => {
    evt.preventDefault();     // Prevent form refresh
    setError('');
    setSuccess('');

    const formData = new FormData();        // Needed for file upload
    formData.append('bio', bio);
    if (image) {
      formData.append('profile_picture', image);
    }

    try {
      const res = await axios.post('/edit-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'   // Tell Flask it’s a file upload
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
    <div className="page-container">
      <h2>Edit Profile</h2>

      {/* Feedback if update worked or not */}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Bio + image form */}
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
