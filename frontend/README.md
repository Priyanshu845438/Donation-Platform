
# CharityPlus - Modern Donation Platform Frontend

This is the frontend for CharityPlus, a modern donation platform built with React, TypeScript, and Tailwind CSS.

## Features

-   **Modern UI/UX**: Clean, responsive, and interactive design.
-   **Role-Based Access Control**: Separate dashboards for Admins, NGOs, Companies, and Donors.
-   **Dynamic Pages**: Home, About, Campaigns, Gallery, Reports, and Contact pages.
-   **Authentication**: Secure login and signup functionality using JWT.
-   **Component-Based Architecture**: Reusable and scalable components.
-   **Context API**: Global state management for authentication.
-   **Protected Routes**: Secure access to user-specific dashboards.
-   **Toast Notifications**: User-friendly feedback for actions.

## Tech Stack

-   **React 18**: Functional components with hooks.
-   **TypeScript**: For type safety.
-   **Vite**: As the development server and build tool (assumed environment).
-   **React Router (HashRouter)**: For client-side routing.
-   **Tailwind CSS**: For utility-first styling.
-   **Recharts**: For data visualization on the reports page.

---

## Frontend Setup (Development)

This project is designed to be run in a modern JavaScript development environment like Vite or Create React App.

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    Make sure you have Node.js and npm (or yarn) installed.
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    The application expects the backend API key to be available via `process.env.API_KEY` for any potential AI features, though it's not used in the core donation platform logic. The backend URL is hardcoded for simplicity but can be moved to an environment variable.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the development server, typically at `http://localhost:5173`.

---

## Backend Configuration (Required)

This frontend is designed to work with a specific backend API. You need to have a backend server running that exposes the following endpoints.

**Base URL:** `http://localhost:5000/api`

### CORS Configuration (Important!)

Because the frontend (e.g., from `http://localhost:5173`) and backend (from `http://localhost:5000`) run on different ports, you **must** enable Cross-Origin Resource Sharing (CORS) on your backend server. Otherwise, the browser will block all API requests for security reasons, resulting in a "Failed to fetch" error.

If you are using **Express.js** for your backend, you can do this easily with the `cors` middleware:

1.  **Install the `cors` package in your backend project:**
    ```bash
    npm install cors
    ```

2.  **Use it in your main server file (e.g., `server.js` or `index.js`):**
    ```javascript
    const express = require('express');
    const cors = require('cors');
    const app = express();

    // Option 1: Enable CORS for all origins (simple, for development)
    app.use(cors());
    
    // Option 2: For more security, allow only your frontend's origin
    /*
    const corsOptions = {
      origin: 'http://localhost:5173' // Your frontend's actual URL
    };
    app.use(cors(corsOptions));
    */

    // ... rest of your server setup (routes, middleware, etc.) ...
    
    // Example: app.use('/api/auth', authRoutes);

    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
    ```

### Auth Endpoints

1.  **Signup:**
    -   **URL:** `POST /auth/signup`
    -   **Body (JSON):**
        ```json
        {
          "fullName": "John Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "1234567890",
          "password": "yourpassword",
          "role": "Donor" // Can be 'Donor', 'NGO', 'Company'
        }
        ```
    -   **Success Response (201):**
        ```json
        {
          "message": "User registered successfully"
        }
        ```

2.  **Login:**
    -   **URL:** `POST /auth/login`
    -   **Body (JSON):**
        ```json
        {
          "email": "john.doe@example.com",
          "password": "yourpassword",
          "role": "Donor" // Can be 'Donor', 'NGO', 'Company', 'Admin'
        }
        ```
    -   **Success Response (200):**
        ```json
        {
          "token": "your_jwt_token",
          "user": {
            "id": "user_id",
            "fullName": "John Doe",
            "email": "john.doe@example.com",
            "role": "Donor"
          }
        }
        ```

### Notes

-   The backend should handle JWT creation, validation, and user management.
-   The `role` field is crucial for redirecting users to the correct dashboard upon login.
-   For a production build, run `npm run build` and serve the contents of the `dist` folder.