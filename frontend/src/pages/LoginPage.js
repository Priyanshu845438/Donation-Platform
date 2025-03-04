import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [role, setRole] = useState(""); // User role (admin, company, ngo)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!role || !username || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: username,
        password: password,
        role: role,
      });
  
      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
  
        // Redirect based on role
        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "company") {
          navigate("/company-dashboard");
        } else if (role === "ngo") {
          navigate("/ngo-dashboard");
        }
      }
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.message : "Server error");
    }
  };
    
  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-control">
          <label>Select Role</label>
          <select
            className="select-dropdown"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="company">Company</option>
            <option value="ngo">NGO</option>
          </select>
        </div>
        
        <div className="form-control">
          <label>Username</label>
          <input
            type="text"
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div className="form-control">
          <label>Password</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
