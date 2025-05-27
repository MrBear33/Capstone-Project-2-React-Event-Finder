import React, { useState } from 'react';
import axios from 'axios';
import './PageStyles.css'; // Import CSS for styling

// Set base URL for backend (live or local)
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

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
    evt.preventDefault();        // Prevent full page reload
    setError('');                // Clear old error
    setSuccess('');              // Clear old success message

    const formData = new FormData();         // Use FormData for file upload
    formData.append('bio', bio);             // Add bio to payload
    if (image) {
      formData.append('profile_picture', image);  // Add image if one is selected
    }

    try {
      const res = await axios.post(`${BASE_URL}/edit-profile`, formData, {
        withCredentials: true,               // Needed for auth
        headers: {
          'Content-Type': 'multipart/form-data'   // Required for file upload
        }
      });

      if (res.status === 200) {
        setSuccess('Profile updated!');      // Show success message
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError('Could not update profile.'); // Show error if failed
    }
  };

  return (
    <div className="page-container">
      <h2>Edit Profile</h2>

      {/* Success or error message display */}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Form to update bio and profile picture */}
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
