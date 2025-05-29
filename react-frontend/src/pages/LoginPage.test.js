// LoginPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import axios from 'axios';

jest.mock('axios');

describe('LoginPage', () => {
  const mockSetUser = jest.fn();

  test('renders form and submits login', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt-token', user: { username: 'testuser' } },
    });

    render(
      <BrowserRouter>
        <LoginPage setUser={mockSetUser} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockSetUser).toHaveBeenCalledWith({ username: 'testuser' });
    });
  });
});
