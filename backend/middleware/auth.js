
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = (allowedRoles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            
            if (!token) {
                return res.status(401).json({ message: "Access denied. No token provided." });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId || decoded.id).select("-password");
            
            if (!user) {
                return res.status(401).json({ message: "Invalid token. User not found." });
            }

            if (!user.isActive) {
                return res.status(403).json({ message: "Account is deactivated." });
            }

            // Check role permissions
            if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
                console.log(`Permission denied - Required: ${allowedRoles}, User has: ${user.role}`);
                return res.status(403).json({ 
                    message: "Access denied. Insufficient permissions.",
                    requiredRoles: allowedRoles,
                    userRole: user.role
                });
            }

            console.log(`Access granted - User: ${user.email}, Role: ${user.role}`);

            req.user = user;
            next();

        } catch (error) {
            console.error("Auth middleware error:", error);
            res.status(401).json({ message: "Invalid token." });
        }
    };
};

module.exports = authMiddleware;
