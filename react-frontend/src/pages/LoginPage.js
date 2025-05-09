import React, { useState } from 'react';         // React and useState for managing form input and error state
import axios from 'axios';                       // Axios for sending HTTP requests
import { useNavigate } from 'react-router-dom';  // useNavigate is used to redirect after login

function LoginPage() {
  // State to store form input values
  const [formData, setFormData] = useState({ username: '', password: '' });

  // State to track error messages (like invalid credentials)
  const [error, setError] = useState('');

  // useNavigate lets us change the route
  const navigate = useNavigate();

  // Handle form input changes (update formData state)
  const handleChange = evt => {
    const { name, value } = evt.target;           // Destructure name and value from the input event
    setFormData(data => ({ ...data, [name]: value })); // Update only the changed field
  };

  // Handle form submission (send login request)
  const handleSubmit = async evt => {
    evt.preventDefault();                         // Prevent default form refresh
    setError('');                                  // Clear any previous errors

    try {
      // Send login data to Flask backend
      const res = await axios.post(
        '/login',                                 // Backend login endpoint
        formData,                                 // Form data with username and password
        { withCredentials: true }                 // Include cookies for session support
      );

      // If login is successful, redirect to the user homepage
      if (res.status === 200) {
        navigate(`/user/${formData.username}`);   // Go to /user/username
      }
    } catch (err) {
      // If there's an error (bad login), show a message
      console.error(err);
      setError('Invalid username or password.');
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {/* Show error message if one exists */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Login form */}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
            required                                // Make this field required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            name="password"
            type="password"                         // Hide password text
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit">Log In</button>       // Submit the form
      </form>
    </div>
  );
}

export default LoginPage;  // Export the component so it can be used in routing
