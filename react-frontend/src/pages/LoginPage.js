import React, { useState } from 'react';               // useState for handling form and error state
import axios from 'axios';                             // Axios for making HTTP requests
import { useNavigate } from 'react-router-dom';        // For redirecting after login

function LoginPage({ setUser }) {
  // Stores form input values
  const [formData, setFormData] = useState({ username: '', password: '' });

  // Stores any login error messages
  const [error, setError] = useState('');

  // Used to redirect the user after login
  const navigate = useNavigate();

  // Updates form values as user types
  const handleChange = evt => {
    const { name, value } = evt.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  // Handles form submission
  const handleSubmit = async evt => {
    evt.preventDefault();            // Prevent full page reload
    setError('');                    // Clear previous errors

    try {
      // Send login request to Flask backend
      const res = await axios.post(
        '/login',                    // Flask login route
        formData,                    // Includes username and password
        { withCredentials: true }    // Needed to include session cookie
      );

      // If login is successful
      if (res.status === 200) {
        const { username } = res.data;   // Get username from response
        setUser(username);               // Save to App state
        navigate(`/user/${username}`);   // Redirect to user's homepage
      }
    } catch (err) {
      // Show error if login fails
      console.error(err);
      setError('Invalid username or password.');
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {/* Show error message if present */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Login form */}
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

export default LoginPage;   // Make the component usable in App.js
