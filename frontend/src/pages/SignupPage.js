import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/SignupPage.css";

const SignupForm = () => {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Validation Schema
    const validationSchema = Yup.object({
        fullName: Yup.string().required("Full Name is required"),
        email: Yup.string().email("Invalid email format").required("Email is required"),
        password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
        phoneNumber: Yup.string()
            .matches(/^[0-9]{10}$/, "Invalid phone number (10 digits required)")
            .required("Phone number is required"),
        role: Yup.string().oneOf(["NGO", "Company", "Donor"], "Invalid role").required("Role is required"),
    });

    // Handle Form Submission
    const handleSubmit = async (values, { setSubmitting }) => {
        let payload = {
            fullName: values.fullName,
            email: values.email,
            phoneNumber: values.phoneNumber,
            password: values.password,
            role: values.role,
        };
    
        console.log("Submitting form values:", payload); // Debug log
    
        try {
            const API_URL = "http://localhost:5000"; // Ensure this is correct
            const response = await axios.post(`${API_URL}/api/auth/signup`, payload);
    
            console.log("API Response:", response.data);
            setMessage("Account created successfully!");
            setError("");
            navigate("/login"); // Redirect after successful signup
        } catch (error) {
            console.error("Signup error:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Something went wrong.");
            setMessage("");
        }
    
        setSubmitting(false);
    };
    

    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">Create an Account</h2>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                <Formik
                    initialValues={{
                        fullName: "",
                        email: "",
                        password: "",
                        phoneNumber: "",
                        role: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, values, setFieldValue }) => (
                        <Form className="form">
                            {/* Role Selection */}
                            <div className="form-group">
                                <label>Role</label>
                                <Field
                                    as="select"
                                    name="role"
                                    className="input-field"
                                    onChange={(e) => {
                                        const selectedRole = e.target.value;
                                        setFieldValue("role", selectedRole);

                                        // Reset role-dependent fields
                                        setFieldValue("ngoName", selectedRole === "NGO" ? values.fullName : null);
                                        setFieldValue("companyName", selectedRole === "Company" ? values.fullName : null);
                                    }}
                                >
                                    <option value="">Select Role</option>
                                    <option value="NGO">NGO</option>
                                    <option value="Company">Company</option>
                                    <option value="Donor">Donor</option>
                                </Field>
                                <ErrorMessage name="role" component="p" className="error-text" />
                            </div>

                            {/* Full Name Field */}
                            <div className="form-group">
                                <label>{values.role === "NGO" ? "NGO Name" : "Full Name"}</label>
                                <Field type="text" name="fullName" className="input-field" />
                                <ErrorMessage name="fullName" component="p" className="error-text" />
                            </div>

                            {/* Email Field */}
                            <div className="form-group">
                                <label>Email</label>
                                <Field type="email" name="email" className="input-field" />
                                <ErrorMessage name="email" component="p" className="error-text" />
                            </div>

                            {/* Password Field */}
                            <div className="form-group">
                                <label>Password</label>
                                <Field type="password" name="password" className="input-field" />
                                <ErrorMessage name="password" component="p" className="error-text" />
                            </div>

                            {/* Phone Number Field */}
                            <div className="form-group">
                                <label>Phone Number</label>
                                <Field type="text" name="phoneNumber" className="input-field" />
                                <ErrorMessage name="phoneNumber" component="p" className="error-text" />
                            </div>

                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? "Creating Account..." : "Sign Up"}
                            </button>
                            <button className="btn-secondary" onClick={() => navigate("/login")}>
    Already have an account? Login
</button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default SignupForm;
