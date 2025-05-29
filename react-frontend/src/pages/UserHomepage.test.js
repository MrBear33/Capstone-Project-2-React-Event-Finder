// UserHomepage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import UserHomepage from './UserHomepage';
import axios from '../axiosWithToken';

jest.mock('../axiosWithToken');

describe('UserHomepage', () => {
  const mockUser = 'testuser';

  beforeEach(() => {
    axios.get.mockResolvedValueOnce({
      data: {
        user: {
          username: 'testuser',
          bio: 'This is a test bio.',
          image_url: '/static/default_user.png',
          saved_events: [
            {
              id: 1,
              name: 'Saved Event',
              venue: 'Event Hall',
              date: '2025-06-10T14:00:00',
              image_url: 'https://example.com/event.jpg'
            },
          ],
        },
      },
    });
  });

  test('loads and displays user profile with saved events', async () => {
    render(
      <MemoryRouter initialEntries={[`/user/${mockUser}`]}>
        <Routes>
          <Route path="/user/:username" element={<UserHomepage user={mockUser} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/loading your profile/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/welcome, testuser/i)).toBeInTheDocument();
      expect(screen.getAllByText(/saved event/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/event hall/i)).toBeInTheDocument();
    });
  });

  test('removes event when "Remove" is clicked', async () => {
    axios.delete.mockResolvedValueOnce({});

    render(
      <MemoryRouter initialEntries={[`/user/${mockUser}`]}>
        <Routes>
          <Route path="/user/:username" element={<UserHomepage user={mockUser} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/saved event/i).length).toBeGreaterThan(0);
    });

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(removeButton).not.toBeInTheDocument();
    });
  });
});