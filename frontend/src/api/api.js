import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const signupUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/signup`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Signup failed";
    }
};
