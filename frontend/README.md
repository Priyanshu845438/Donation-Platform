
# CharityPlus - Serenity Edition | Professional Donation Platform

This is the frontend for CharityPlus, a modern donation platform. This "Serenity" edition features a complete UI/UX overhaul, focusing on a clean, professional, and trustworthy user experience suitable for the non-profit sector.

## Serenity Theme Features

-   **Professional & Clean UI**: A light, airy design with a calming color palette of blues, teals, and soft grays to inspire trust and confidence.
-   **User-Friendly & Accessible**: Focus on readability with high-contrast text, ample whitespace, and intuitive layouts. All components are designed to be simple and easy to use.
-   **Responsive Design**: Meticulously crafted to provide a seamless experience on all devices, from mobile phones to large desktops.
-   **Role-Tailored Dashboards**: Clean, data-focused dashboards for Admins, NGOs, Companies, and Donors.
-   **Dynamic & Live Data**: All dashboards and campaign pages are powered by live API data, providing a real-time view of the platform's activity.
-   **Robust Functionality**: Secure authentication (Login/Signup), profile management with image uploads, campaign creation/management, and admin moderation tools are all fully functional within the new design.

## Tech Stack

-   **React 18**: Functional components with hooks.
-   **TypeScript**: For type safety.
-   **Vite**: As the development server and build tool (assumed environment).
-   **React Router (HashRouter)**: For client-side routing.
-   **Tailwind CSS**: For utility-first styling with a custom "Serenity" theme configuration.
-   **Recharts**: For data visualization.
-   **Context API**: For global state management for authentication.

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

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the development server, typically at `http://localhost:5173`.

---

## Backend Configuration (Required)

This frontend is designed to work with a specific backend API. You need to have a backend server running that exposes the API endpoints as documented in the Postman collection.

**Base URL:** `http://localhost:5000/api`

### CORS Configuration (Crucial!)

Because the frontend (e.g., from `http://localhost:5173`) and backend (from `http://localhost:5000`) run on different origins, you **must** enable Cross-Origin Resource Sharing (CORS) on your backend server. Otherwise, the browser will block all API requests for security reasons, resulting in a "Failed to fetch" error.

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

    // IMPORTANT: For security, be specific about the origin in production.
    // For local development, you can allow your local frontend's origin.
    const corsOptions = {
      origin: 'http://localhost:5173' // Your frontend's actual URL
    };
    app.use(cors(corsOptions));

    // For a quick-and-dirty development setup, you can allow all origins,
    // but do not use this in production.
    // app.use(cors());
    
    // ... rest of your server setup (routes, middleware, etc.) ...
    
    // Example: app.use('/api/auth', authRoutes);

    app.listen(5000, () => {
      console.log('Server is running on port 5000');
    });
    ```
### API Endpoints

The frontend is built according to the provided Postman collection, including endpoints for:
- Authentication (`/auth/register`, `/auth/login`, etc.)
- Campaign Management (`/campaigns`, `/campaigns/my-campaigns`, etc.)
- Donation Management (`/donations`, etc.)
- User, NGO, and Company Profile Management (`/auth/profile`, `/ngo/profile`, etc.)
- File Uploads (`/auth/upload-profile-image`, etc.)
- Admin Dashboard functionality (`/admin/dashboard/...`)