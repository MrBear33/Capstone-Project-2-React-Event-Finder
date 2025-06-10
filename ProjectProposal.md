# Social Event Tracker & Planner

## Project Proposal

### The Idea

This app helps people find interesting events happening nearby. Whether it's a concert, community meetup, or weekend activity, users can browse events based on their current location, save ones they like, and connect with friends who are also using the app.

### Tech Stack

- Frontend: React
- Backend: Flask (Python)
- Database: PostgreSQL with SQLAlchemy
- Authentication: JWT-based system
- APIs:
  - Google Geolocation API for determining user location
  - Ticketmaster API for real-time event data



The app is built as a responsive web application and works across desktop and mobile browsers—no downloads or installs needed.

### Who it's for

The app is designed for people around 18 to 45 years old who enjoy social activities and want an easy way to explore local events. It's built for users who are comfortable with web apps and want to discover and plan events quickly.

### Data and APIs

- Google Geolocation API  identifies the user's current location using IP.
- Ticketmaster  API is used to search for and retrieve events based on location, date, and category.

## User Flow

1. **Landing Page**  
   The user can visit the hompage and can see any saved events they have, browse to friends, or find new events. 

2. **Search Events**  
   Based on the selected location, events are shown with filters for date, keyword, and category.

3. **Browse and Click**  
   Events are listed in a scrollable feed. Clicking one shows more details, including time, venue, and ticket options.

4. **Sign Up / Log In**  
   Users can register or log in to save events, adjust preferences, or manage their profile.

5. **Save Events**  
   Logged-in users can bookmark events for later, making it easy to keep track or share with friends.

6. **Buy Tickets**  
   Events with ticket links redirect users to purchase pages via Ticketmaster.




