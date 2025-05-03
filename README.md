# 🌍 Donation Platform (All-in-One Solution)

A comprehensive MERN stack-based donation platform designed for NGOs, companies, and individual donors. This project serves as a B.Tech final year project, offering a real-time, role-based donation and campaign management system with secure payment integration via Cashfree.

---

## 🚀 Features

### 🔐 Role-Based Access
- **Admin**
  - Manage NGOs, Companies, and Campaigns (CRUD)
  - View all donation and activity reports
  - Access and edit own profile

- **NGO**
  - Create and manage campaigns
  - Donate to other campaigns
  - View reports related to own activities
  - View company profiles
  - Edit own profile

- **Company**
  - View NGO profiles
  - Access donation reports
  - Edit own profile

### 💳 Donation & Payment
- Cashfree Payment Gateway Integration
- Public sharable donation form for external users
- Track all donation transactions

### 📊 Reports & Logs
- Donation reports
- Campaign performance
- User activity logs

### 📂 Profile Management
- View and edit user profiles
- NGO profile displays all related campaigns
- Secure password change feature

---

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Payment Gateway**: Cashfree
- **API Testing**: Postman

---

## 📁 Project Structure

```bash
backend/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
└── server.js

frontend/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── App.js
└── package.json
```

---

## 📌 Installation & Setup

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📄 API Documentation

All backend APIs are tested using **Postman** and follow RESTful principles.

---

## 📚 Development Roadmap

- [x] Setup backend with role-based schemas
- [x] Implement login/signup with JWT auth
- [x] Build campaign and donation APIs
- [x] Integrate Cashfree payment gateway
- [x] Admin panel for managing modules
- [ ] Build frontend dashboard (React.js)
- [ ] Finalize testing & deployment

---

## 🙌 Contributing

Contributions are welcome! Feel free to fork this repo, raise issues, and submit PRs.

---

## 🧑‍💻 Author

**Your Name** – [LinkedIn](https://www.linkedin.com/) | [GitHub](https://github.com/)

---

## 📃 License

This project is licensed under the MIT License.
