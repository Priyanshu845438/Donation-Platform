const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ensure you have access to the User model
const SECRET_KEY = process.env.JWT_SECRET || "Donation_Priyanshu"; // Use .env for security

const authMiddleware = (allowedRoles) => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Access denied. No token provided." });
        }

        // Extract the token
        const token = authHeader.split(" ")[1];

        // Decode the token
        const decoded = jwt.verify(token, SECRET_KEY);
        console.log("✅ Decoded Token:", decoded); // Debugging log

        // Fetch user from DB to verify existence
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid token. User not found." });
        }

        // Attach user data to req
        req.user = {
            id: user._id.toString(),
            role: user.role
        };

        console.log("🔹 Authenticated User:", req.user); // Debugging log
        next();
    } catch (error) {
        console.error("❌ Auth Middleware Error:", error);
        return res.status(401).json({ success: false, message: "Invalid token." });
    }
};

module.exports = authMiddleware;
