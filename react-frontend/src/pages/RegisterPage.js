import React, { useState } from 'react';         // for managing form state
import axios from 'axios';                       // to send POST request to backend
import { useNavigate } from 'react-router-dom';  // lets us redirect after successful register

function RegisterPage() {
  // state for form input fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // to display error/success messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();  // used for redirecting

  // updates form values as the user types
  const handleChange = evt => {
    const { name, value } = evt.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  // runs when the form is submitted
  const handleSubmit = async evt => {
    evt.preventDefault();  // stop page reload
    setError('');
    setSuccess('');

    try {
      // send form data to backend to register user
      const res = await axios.post(
        '/register',
        formData,
        { withCredentials: true }  // make sure cookies (like session) are included
      );

      // if backend returns success, show message and go to login page
      if (res.status === 200) {
        setSuccess('Registration successful!');
        navigate('/login');
      }
    } catch (err) {
      // if something goes wrong, show an error message
      console.error(err);
      setError('Registration failed. Please check your input.');
    }
  };

  return (
    <div>
      <h2>Register</h2>

      {/* show any error */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* show success message */}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      {/* registration form */}
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
