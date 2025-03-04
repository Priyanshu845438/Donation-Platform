import React, { useState } from "react";
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, FormHelperText, Snackbar } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/SignupPage.css';  // Import the CSS file

const SignupPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !role) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/auth/signup", {
                name,
                email,
                password,
                role,
            });
            setSuccessMessage("Signup successful! Please login.");
            setOpenSnackbar(true);
            setTimeout(() => {
                navigate("/login"); // Redirect to login page after showing success message
            }, 2000);
        } catch (err) {
            setError(err.response ? err.response.data.message : "Error signing up");
        }
    };

    return (
        <div className="signup-container">
            <h2>Signup</h2>
            {error && <div className="error-message">{error}</div>}
            {successMessage && (
                <div className="success-message">{successMessage}</div>
            )}
            <form onSubmit={handleSubmit}>
            <FormControl fullWidth required className="form-control">
                    <InputLabel id="role-select-label" className="select-label">Role</InputLabel>
                    <Select
                        labelId="role-select-label"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        label="Role"
                        className="select-dropdown"
                    >
                        <MenuItem value="ngo">NGO</MenuItem>
                        <MenuItem value="company">Company</MenuItem>
                    </Select>
                    <FormHelperText>Select your role</FormHelperText>
                </FormControl>
                <TextField
                    label="Name"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-field"
                />
                <TextField
                    label="Email"
                    fullWidth
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-field"
                />
                <TextField
                    label="Password"
                    fullWidth
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="text-field"
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    Sign Up
                </Button>
            </form>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
                message={successMessage}
                className="snackbar-message"
            />
        </div>
    );
};

export default SignupPage;
