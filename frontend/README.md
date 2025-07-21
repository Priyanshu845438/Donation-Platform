# DonationHub: An AI-Powered Donation Platform

[![React Badge](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Tailwind CSS Badge](https://img.shields.io/badge/Tailwind_CSS-3-cyan?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini API Badge](https://img.shields.io/badge/Gemini_API-Google-orange?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)

DonationHub is a professional, government-guideline-compliant web platform designed to foster transparency and trust in online charitable giving. It connects donors, NGOs, and corporate partners in a secure and verified ecosystem, leveraging the power of AI to create a seamless and intelligent user experience.

---

## ✨ Key Features

-   **Role-Based Dashboards**: Tailored experiences for **Admins**, **NGOs**, **Companies**, and **Donors**.
-   **Campaign Management**: NGOs can create, manage, and track their fundraising campaigns. Admins can verify and manage all campaigns on the platform.
-   **Secure Donations**: A streamlined and secure donation process for donors to contribute confidently to causes they care about.
-   **AI-Powered Smart Search**: Integrated with the Gemini API, users can find campaigns using natural language queries (e.g., "help children get books").
-   **AI Assistant Chatbot**: An intelligent chatbot powered by Gemini to answer user questions and provide guidance.
-   **Transparent Reporting**: Detailed reports for all user roles to track financial data and social impact.
-   **Dynamic Theming**: Admins can customize the platform's appearance, including color schemes and fonts, directly from their dashboard.
-   **Verification System**: A rigorous admin-led approval process for all registered NGOs and their campaigns to build donor trust.

---

## 🚀 Technology Stack

-   **Frontend**: React.js, React Router
-   **AI Integration**: Google Gemini API (`@google/genai`)
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **Data Visualization**: Chart.js & react-chartjs-2
-   **Icons**: React Icons

---

## 📁 Project Structure

The project follows a modular, feature-first structure to ensure scalability and maintainability.

```
/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable components (e.g., Button, Header) & role-specific components
│   ├── context/          # React Context providers (Auth, Theme, Toast)
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components, organized by user role
│   ├── services/         # API call logic (api.ts)
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main application component with routing
│   └── index.tsx         # Application entry point
└── documents/            # Project documentation and summaries
```

---

## ⚙️ Getting Started

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/donation-hub.git
    cd donation-hub
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables

For the AI features to work, create a `.env` file in the root of the project and add your Google Gemini API key:

```
API_KEY=YOUR_GEMINI_API_KEY
```

### Running the Application

```bash
npm start
```
The application will be available at `http://localhost:3000` (or another port if 3000 is in use).

---

## 📸 Screenshots

*(Placeholder for application screenshots)*

-   `[Screenshot of the Homepage hero section]`
-   `[Screenshot of the Explore Campaigns page with AI search]`
-   `[Screenshot of the Admin Dashboard showing KPIs and charts]`
-   `[Screenshot of the AI Chatbot overlay]`

---

## 👤 User Roles

The platform supports four distinct user roles:

1.  **Admin**: Has complete control over the platform, including user and campaign verification, content management, and system settings.
2.  **NGO**: Manages their profile, creates/manages fundraising campaigns, and tracks donation reports.
3.  **Company**: Can discover verified NGOs for CSR initiatives, donate to campaigns, and track their corporate social impact.
4.  **Donor**: Can explore campaigns, make secure donations, and view their personal donation history and impact.

---

## 🔮 Future Scope

-   **AI-Powered Impact Reporting**: Use Gemini to generate personalized, easy-to-read impact summaries for donors based on campaign reports.
-   **Gamification for Donors**: Introduce a system of badges and achievements to encourage repeat donations.
-   **Volunteer Matching Module**: Allow NGOs to post volunteering opportunities and users to sign up as volunteers.
-   **Advanced Admin Analytics**: Develop more in-depth reports and visualizations for user demographics and donation trends.
