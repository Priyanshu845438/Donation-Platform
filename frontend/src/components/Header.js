import React from 'react';
import '../styles/Header.css'; // Import the header's custom CSS file

const Header = () => {
  const openInNewTab = (url) => {
    window.open(url, '_blank'); // Open the URL in a new tab
  };

  return (
    <header className="header">
      <div className="logo">
        <img src="/images/logo1.png" alt="Logo" className="logo-image" />
      </div>
      <nav className="nav-menu">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/campaigns">Campaigns</a></li>
          <li><a href="/reports">report</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
      <div className="auth-buttons">
        <button 
          className="signup-btn" 
          onClick={() => openInNewTab('/signup')} // Open the signup page in a new tab
        >
          Sign Up
        </button>
        <button 
          className="login-btn" 
          onClick={() => openInNewTab('/login')} // Open the login page in a new tab
        >
          Login
        </button>
      </div>
    </header>
  );
};

export default Header;
