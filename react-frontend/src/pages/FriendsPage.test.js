// FriendsPage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FriendsPage from './FriendsPage';
import axios from '../axiosWithToken';

jest.mock('../axiosWithToken');

describe('FriendsPage', () => {
  const mockUser = { username: 'testuser' };

  test('shows message when no friends are found', async () => {
    axios.get.mockResolvedValueOnce({ data: { friends: [] } });

    render(
      <BrowserRouter>
        <FriendsPage user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/you have no friends added yet/i)).toBeInTheDocument();
    });
  });
});
