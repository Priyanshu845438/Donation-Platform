import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NGODashboardPage from './pages/NGODashboardPage';
import CompanyDashboardPage from './pages/CompanyDashboardPage';
import CampaignPage from './pages/CampaignPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/ngo-dashboard" element={<NGODashboardPage />} />
        <Route path="/company-dashboard" element={<CompanyDashboardPage />} />
        <Route path="/campaign/:id" element={<CampaignPage />} />
      </Routes>
    </Router>
  );
}

export default App;
