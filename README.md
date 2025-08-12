TEAM NO. : 206


# QuickCourt

QuickCourt is a sports facility booking platform that allows users to find, book, and review sports venues and courts.  
It supports online payments, time slot management, and real-time notifications.

## ER Diagram

Below is the Entity-Relationship (ER) diagram representing the QuickCourt data model:

![QuickCourt ER Diagram](docs/quickcourt_er_diagram.png)

### Description of Entities
- **User** → Stores authentication & profile info (with avatar, roles: player, facility owner, admin).
- **Sport** → Categories like Cricket, Football, Badminton.
- **Venue** → Physical sports facilities owned by facility owners, tagged with sports.
- **VenuePhoto** → Multiple images for a venue.
- **Court** → Bookable units within a venue.
- **TimeSlot** → Available booking slots for courts.
- **Booking** → Links a user to a time slot and tracks payment & status.
- **Review** → Ratings and comments for venues.
- **Notification** → In-app messages for users.

---

## Development server

Run:
```bash
ng serve
Navigate to http://localhost:4200/.
The app will auto-reload when you change any source file.

Code scaffolding
Run:

bash
Copy
Edit
ng generate component component-name
You can also use:

bash
Copy
Edit
ng generate directive|pipe|service|class|guard|interface|enum|module
Build
Run:

bash
Copy
Edit
ng build
The build artifacts will be stored in the dist/ directory.

Running unit tests
Run:

bash
Copy
Edit
ng test
Executes unit tests via Karma.

Running end-to-end tests
Run:

bash
Copy
Edit
ng e2e
Executes end-to-end tests using a supported framework.
To use this command, first install the package that implements e2e testing.

Further help
For more help on Angular CLI:

bash
Copy
Edit
ng help
Or visit Angular CLI Overview and Command Reference.

Backend API
QuickCourt uses Django REST Framework as its backend, with endpoints for:

User authentication (JWT)

Venue & Court management

Booking & Payment processing (Razorpay)

Reviews & Notifications

Features
User roles: Player, Facility Owner, Admin.

Booking system with real-time slot availability.

Online payments via Razorpay.

SMS notifications via Twilio.

In-app notifications for booking updates.

Review system for venues.


VIDEO LINK : https://www.loom.com/share/a67a03fda46e49e789a8cbace01fa055?sid=946ceab2-918a-4875-a283-44c86198ea53
