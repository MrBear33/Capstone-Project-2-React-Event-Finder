import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './PageStyles.css'; // Import CSS for styling

// Base URL for the Flask backend
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

function LoginPage({ setUser }) {
  // Store form inputs
  const [formData, setFormData] = useState({ username: '', password: '' });

  // Show any error messages if login fails
  const [error, setError] = useState('');

  // Used to redirect user after login
  const navigate = useNavigate();

  // Update form fields as the user types
  const handleChange = evt => {
    const { name, value } = evt.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async evt => {
    evt.preventDefault();    // Stop page from reloading
    setError('');            // Clear any previous errors

    try {
      // Call the backend with username and password
      const res = await axios.post(
        `${BASE_URL}/login`,
        formData
      );

      // If login worked, we get a token back
      if (res.status === 200 && res.data.token) {
        const token = res.data.token;

        // Save token in localStorage so we can use it on other pages
        localStorage.setItem('token', token);

        // Set the logged in user for React state
        setUser(formData.username);

        // Send them to their homepage
        navigate(`/user/${formData.username}`);
      } else {
        setError('Login failed — please try again.');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="page-container">
      <h2>Login</h2>

      {/* If there’s an error, show it up top */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Simple login form */}
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

        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default LoginPage;
