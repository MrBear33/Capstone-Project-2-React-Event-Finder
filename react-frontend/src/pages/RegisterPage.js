import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PageStyles.css'; // Import CSS for styling

// Base URL for Flask backend (use env variable or fallback to local)
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function RegisterPage() {
  // Stores form input values for registration
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // Holds any error messages returned from the backend
  const [error, setError] = useState('');

  // Redirect user after successful registration
  const navigate = useNavigate();

  // Update form values as user types
  const handleChange = evt => {
    const { name, value } = evt.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  // Submit registration form to Flask backend
  const handleSubmit = async evt => {
    evt.preventDefault();  // Prevent page reload
    setError('');          // Clear any previous error messages

    try {
      const res = await axios.post(
        `${BASE_URL}/register`,  // Updated to full backend path
        formData,
        { withCredentials: true }
      );

      if (res.status === 201) {
        // If registration successful, redirect to login page
        navigate('/login');
      }
    } catch (err) {
      // If backend returns an error, display it
      console.error(err);
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="page-container">
      <h2>Register</h2>

      {/* Show error if one exists */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Registration form */}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Email:
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <label>
          Password:
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegisterPage;
