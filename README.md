# 💝 Donation Platform – MERN-Based Multi-Role Crowdfunding Web Application

Are you looking for a **secure, scalable, and user-friendly donation platform** built with modern web technologies? You're in the right place! This project is a full-stack **MERN application** (MongoDB, Express.js, React, Node.js) that simplifies charitable giving while ensuring transparency, accountability, and accessibility for all users.

---

## 📌 Table of Contents

- [🌟 About the Project](#-about-the-project)
- [🚀 Live Demo](#-live-demo)
- [🛠️ Technologies Used](#️-technologies-used)
- [🔐 Supported User Roles](#-supported-user-roles)
- [✨ Key Features](#-key-features)
- [📦 Folder Structure](#-folder-structure)
- [🧪 Testing & QA Strategy](#-testing--qa-strategy)
- [🧠 System Architecture](#-system-architecture)
- [📈 API Documentation](#-api-documentation)
- [🖼️ Screenshots](#️-screenshots)
- [📚 Setup & Installation](#-setup--installation)
- [🔒 Security Measures](#-security-measures)
- [📍 Future Enhancements](#-future-enhancements)
- [📬 Contact & Contribution](#-contact--contribution)
- [📄 License](#-license)

---

## 🌟 About the Project

The **Donation Platform** is a robust, production-grade web application designed to connect **Donors**, **NGOs**, **Companies (CSR)**, and **Admins** in a transparent, accountable, and efficient way.

The goal is simple yet powerful: **make fundraising smarter and donation tracking more transparent**.

### Why This Project?

Today, most online donation platforms lack:
- Real-time tracking,
- Multi-role functionality,
- Comprehensive reporting, and
- Seamless donor experience.

This project solves all of these problems by delivering:
- Razorpay payment gateway integration ✅  
- JWT-secured multi-role authentication system ✅  
- Campaign creation with media uploads ✅  
- Role-specific dashboards & analytics ✅  
- Mobile-first responsive UI ✅

---

## 🚀 Live Demo

> 🌐 Coming Soon – Deployment on **Vercel + Render** with MongoDB Atlas. Stay tuned!

---

## 🛠️ Technologies Used

This platform is built using modern tools optimized for **performance, security, and scalability**.

### 🔹 Frontend
- **React 18 + TypeScript** – Component-based, strongly typed
- **Vite** – Lightning-fast builds
- **Tailwind CSS** – Utility-first styling
- **Recharts** – Interactive data visualization
- **React Router** – Client-side routing

### 🔸 Backend
- **Node.js (v18+)** – Asynchronous, event-driven server
- **Express.js (v4.18+)** – Lightweight web framework
- **MongoDB + Mongoose (v7+)** – Flexible NoSQL database
- **JWT + bcrypt.js** – Secure user authentication
- **Helmet, CORS, Multer** – Enhanced security and file uploads

### 💳 Payment Integration
- **Razorpay** – Real-time, secure donation processing with payment verification and order tracking

---

## 🔐 Supported User Roles

The platform supports **4 distinct roles**, ensuring every stakeholder has a tailored experience:

| User Type | Description |
|-----------|-------------|
| **Admin** | Manages the platform, users, campaigns, and system reports |
| **NGO**   | Creates campaigns, tracks donations, uploads proof |
| **Company** | Participates in CSR campaigns and donation activities |
| **Donor** | Browses campaigns, donates securely, and views history |

---

## ✨ Key Features

- ✅ **Multi-role login & dashboards**
- 📂 **Campaign creation with document/image upload**
- 🔎 **Campaign filtering, tags & categories**
- 💳 **Razorpay-powered payment processing**
- 📧 **Donation receipts and confirmation emails**
- 🛡️ **JWT-based secure login**
- 📊 **Real-time analytics and dashboards**
- 🔒 **Role-based access control**
- 🗂️ **Modular file structure (MVC)**

---

## 📦 Folder Structure

```bash
Donation-Platform/
├── backend/           # Node.js + Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
├── frontend/          # React + Vite frontend
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   └── services/
└── README.md
