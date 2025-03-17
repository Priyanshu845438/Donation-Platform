import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("Admin"); // Default role
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
    
        if (!email || !password || !role) {
            setErrorMessage("Please fill in all fields.");
            return;
        }
    
        setLoading(true);
    
        try {
            console.log("Sending Data:", { email, password, role }); // Debugging
    
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                { email, password, role },  // ✅ Fixed: Send role as it is
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );
    
            if (response.status === 200 && response.data.token) {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("userRole", role);
                setErrorMessage("");
    
                // Redirect user based on role
                switch (role) {
                    case "Admin":
                        navigate("/admin-dashboard");
                        break;
                    case "Company":
                        navigate("/company-dashboard");
                        break;
                    case "NGO":
                        navigate("/ngo-dashboard");
                        break;
                    case "Donor":
                        navigate("/donor-dashboard");
                        break;
                    default:
                        navigate("/");
                }
            } else {
                setErrorMessage("Invalid response from server.");
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Server error, try again.");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <label>Select Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Admin">Admin</option>
                    <option value="Company">Company</option>
                    <option value="NGO">NGO</option>
                    <option value="Donor">Donor</option>
                </select>

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label>Password</label>
                <div className="password-input-container">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="eye-button"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {errorMessage && <p className="error">{errorMessage}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <div className="login-footer">
                <p onClick={() => navigate("/forgot-password")} className="forgot-password">
                    Forgot Password?
                </p>
                <p>
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/signup")} className="signup-link">
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
