# Sports Social App

A sports-focused social media web application designed to help users connect, organize, and participate in local sports events. The platform enables users to create and join sports teams, schedule matches, and track performance through a streamlined interface.

## Overview

Unlike traditional social media, this app is strictly for communication and event coordination, eliminating unnecessary content distractions. Users can find local sports events, join teams, and communicate with other athletes in their area.

## Project Structure

```
node-app-template/
├── public/                    # Frontend code
│   ├── css/                   # Stylesheets
│   │   ├── main.css           # Main stylesheet
│   │   ├── auth.css           # Authentication pages styling
│   │   └── components.css     # Reusable components styling
│   ├── js/                    # JavaScript files
│   │   ├── controllers/       # MVC controllers
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   └── profileController.js
│   │   ├── models/            # MVC models
│   │   │   └── userModel.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── apiClient.js   # API requests handler
│   │   │   ├── authUtils.js   # Authentication utilities
│   │   │   └── validators.js  # Form validation utilities
│   ├── dashboard.html         # Main dashboard page
│   ├── logon.html             # Login page
│   ├── register.html          # Registration page
│   ├── profile.html           # User profile page
│   ├── events.html            # Event discovery page
│   └── create-event.html      # Event creation page
├── server/                    # Backend code
│   ├── config/                # Configuration files
│   │   └── db.js              # Database configuration
│   ├── controllers/           # API controllers
│   │   ├── authController.js  # Authentication controller
│   │   └── userController.js  # User management controller
│   ├── middleware/            # Middleware functions
│   │   └── authMiddleware.js  # JWT validation middleware
│   ├── models/                # Database models
│   │   └── userModel.js       # User model
│   ├── routes/                # API routes
│   │   ├── authRoutes.js      # Authentication routes
│   │   └── userRoutes.js      # User management routes
│   └── utils/                 # Utility functions
│       └── jwtUtils.js        # JWT helper functions
├── database/                  # Database scripts
│   └── user_table.sql         # User table schema
├── .env                       # Environment variables (not in git)
├── .gitignore                 # Git ignore file
├── package.json               # Node.js dependencies
├── README.md                  # Project documentation
└── server.js                  # Main server entry point
```

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML, CSS (MVC pattern)
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Sprint 1 Requirements

- Database that supports user management
- Back-end routes supporting account creation and authentication
  - Authentication must return a JWT token
  - Passwords must be salted and hashed before being stored in the database
- Front-end logon and account creation pages
  - Successful logon must store the returned JWT token in browser storage and redirect to an internal page
- All front-end internal pages needed to support planned features
  - Basic layouts with HTML and CSS
  - Each internal page should check for JWT token in browser storage on load
  - Redirect to logon page if token is not found
- Minimum of one route requiring JWT token validation before execution
- Minimum of one invocation of a protected route on an internal page

## System Components

### Features

1. **User Authentication**
   - Login/Register UI
   - Profile page UI
   - API for login/signup
   - Password reset logic
   - Store user credentials
   - Maintain session tokens

2. **Event Creation**
   - Event creation form UI
   - List available events UI
   - Invite link generation
   - API to create/join events
   - Manage event participants
   - Validate event details
   - Store event details

3. **Location-Based Event Discovery**
   - Display events filtered by city UI
   - Map integration
   - API for fetching events by location
   - Search & filter logic
   - Store user-set locations
   - Store event locations

4. **Scorecard**
   - Score entry UI
   - Leaderboard UI
   - API to update event results
   - Compute win/loss records
   - Store individual & team scores
   - Maintain performance history

5. **In-App Chat/Direct Messaging**
   - Chat UI
   - Event-based chat rooms
   - Real-time chat handling
   - Store chat history per event

## Implementation Plan

### Sprint 1: Core Authentication & Framework
- Implement database schema
- Create user authentication endpoints
- Build login & registration pages
- Set up JWT token system
- Create basic page layouts for all features
- Implement protected route access

## Installation & Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file with proper credentials
4. Set up MySQL database using schema in `database/user_table.sql`
5. Run `npm run dev` to start the development server

## API Endpoints
- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login and get JWT token
- **GET /api/auth/me** - Get current user's profile (protected)
- **GET /api/users** - Get all users (protected)
- **GET /api/users/:userId** - Get a user by ID (protected)
- **PUT /api/users/:userId** - Update a user's profile (protected)