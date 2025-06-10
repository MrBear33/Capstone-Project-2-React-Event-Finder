1. User
Represents an individual user of the application.

Fields: id, username, email, password, profile_picture, bio, latitude, longitude

Each user can:

Save multiple events (one-to-many with SavedEvent)

Have many friends through the Friendship association table (many-to-many, self-referential)

2. Event
Represents an individual event, typically pulled from the Ticketmaster API.

Fields: id, api_event_id, name, location, date, category, image_url

Each event can:

Be saved by many users (many-to-many via SavedEvent)

3. SavedEvent
Acts as a join table that connects users and the events they’ve saved.

Fields: id, user_id, event_id

Relationships:

user_id is a foreign key linking to User.id

event_id is a foreign key linking to Event.id

Each saved event instance connects one user to one event.

Enables functionality like saving and unsaving events.

4. Friendship
A self-referential association table representing user-to-user friendships.

Fields: user_id, friend_id (composite primary key)

Both fields are foreign keys pointing to User.id

This setup allows for a many-to-many relationship between users.

Used to build social features like friend lists and event sharing.

----------------------------------------------------------------
Relationships

User ↔ Event: Many-to-many (through SavedEvent)

User ↔ User: Many-to-many (through Friendship)

User → SavedEvent: One-to-many

Event → SavedEvent: One-to-many