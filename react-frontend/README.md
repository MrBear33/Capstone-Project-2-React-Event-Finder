# EVENT TRACKER  

## Project Overview  
Event Tracker is a full-stack web application that helps users discover events near them, save their favorites, and manage their profile and friend list.

Features include:

- User Profiles – Create, update, and customize your own profile  
- Save/Unsave Events – Keep track of events that catch your interest  
- Real-Time Event Discovery – Fetches nearby event data using the Ticketmaster API  
- Geolocation-Based Recommendations – Uses Google Geolocation API to show you what's happening nearby  
- Friend System – Add friends and view their saved events  
- Profile Pictures – Upload your own image or use a default avatar  
- Ticket Links – Events include a direct link to view on Ticketmaster when available  

### Deployment Link:  
 https://capstone-project-2-react-front-end.onrender.com

### Backend Link(Just in case):  
https://capstone-project-2-react-event-finder.onrender.com

---

## Technologies Used  

### Backend:  
Flask – Lightweight Python web framework  
Flask-SQLAlchemy – ORM to manage and query the database  
PostgreSQL – Hosted via Supabase for easy cloud access  
Flask-JWT-Extended – Handles token-based authentication  
Bcrypt – Password hashing for secure storage  

### Frontend:  
React – Rewritten from Flask templates to a modern SPA frontend  
React Router v5 – Client-side routing  
Axios – Communicates with the Flask API  
CSS – Clean custom styling with responsive layout  

### APIs:  
Google Geolocation API – Finds your location for better recommendations  
Ticketmaster API – Pulls event data like concerts, sports, and more  

---

## ERD (Entity Relationship Diagram)  
Click to view database diagram (insert diagram link or file reference if needed)  

---

## Installation Instructions  

### 1️ Clone the Repository  
```
git clone https://github.com/MrBear33/Event-Tracker-React-Flask.git  
cd Event-Tracker-React-Flask  
```

### 2️ Set up the Backend  
```
cd Flask-backend

# Create a virtual environment  
python -m venv venv  
source venv/bin/activate  # On Windows: venv\Scripts\activate  

# Install backend dependencies  
pip install -r requirements.txt  

# Initialize the database  
flask db init  
flask db migrate -m "Initial migration"  
flask db upgrade  

# Run the backend  
flask run  
```

### 3️ Set up the Frontend  
```
cd ../react-frontend

# Install frontend dependencies  
npm install  

# Start the React development server  
npm start  
```

---

## Usage  

Sign up or log in to access your personalized dashboard  

Browse events near your location pulled from the Ticketmaster API  

Save events you're interested in, and remove them later if needed  

Edit your profile to include a bio or upload a profile picture  

Add friends by username and view their saved events  

A default profile image will be shown if no image is uploaded  

Events that include a Ticketmaster URL will display a "View on Ticketmaster" link  
If an event has no ticket link, a message will display to inform the user  

---

## Key Features  

User authentication (signup / login / logout)  
Personalized event discovery  
Save & unsave events  
Upload or fallback profile picture  
Add/view friends  
External Ticketmaster links for event detail pages  

---

## To Contribute  

Fork the repository  

Create a new branch:  
```
git checkout -b feature-branch  
```

Make your changes and commit:  
```
git commit -m "Add new feature"  
```

Push the branch:  
```
git push origin feature-branch  
```

Open a Pull Request  

---

## Contact Info  

jacob33sandoval33@gmail.com  
GitHub: https://github.com/MrBear33  
