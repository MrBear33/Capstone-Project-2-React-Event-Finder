import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EventsPage from './EventsPage';
import axios from '../axiosWithToken';
import { BrowserRouter } from 'react-router-dom';

//  Mock axios
jest.mock('../axiosWithToken');

describe('EventsPage', () => {
  const mockUser = 'testuser';

  const sampleEvent = {
    id: 'event1',
    name: 'Sample Concert',
    dates: {
      start: {
        dateTime: '2025-06-01T20:00:00Z'
      }
    },
    _embedded: {
      venues: [{ name: 'Big Arena' }]
    },
    images: [{ url: 'https://example.com/image.jpg' }],
    url: 'https://ticketmaster.com/sample-event'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches and displays events', async () => {
    axios.get.mockImplementation(url => {
      if (url === '/events') {
        return Promise.resolve({ data: [sampleEvent] });
      }
      if (url === '/friends') {
        return Promise.resolve({ data: { saved_event_ids: [] } });
      }
    });

    render(
      <BrowserRouter>
        <EventsPage user={mockUser} />
      </BrowserRouter>
    );

    expect(screen.getByText(/loading events/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Sample Concert')).toBeInTheDocument();
      expect(screen.getByText('Big Arena')).toBeInTheDocument();
      expect(screen.getByText(/view on ticketmaster/i)).toBeInTheDocument();
    });
  });

  test('save button triggers API and shows flash message', async () => {
    axios.get.mockImplementation(url => {
      if (url === '/events') {
        return Promise.resolve({ data: [sampleEvent] });
      }
      if (url === '/friends') {
        return Promise.resolve({ data: { saved_event_ids: [] } });
      }
    });

    axios.post.mockResolvedValue({ status: 201 });

    render(
      <BrowserRouter>
        <EventsPage user={mockUser} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sample Concert')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(screen.getByText(/event saved/i)).toBeInTheDocument();
    });
  });
});
