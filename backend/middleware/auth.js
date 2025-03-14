const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "Donation_Priyanshu";

const authMiddleware = (roles) => {
    return (req, res, next) => {
        console.log("Incoming Request Headers:", req.headers);

        try {
            const authHeader = req.header("Authorization");
            console.log("Extracted Authorization Header:", authHeader);

            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(403).json({ success: false, message: "Access Denied. No token or invalid token format" });
            }

            const token = authHeader.split(" ")[1];
            console.log("Extracted Token:", token);

            const decoded = jwt.verify(token, JWT_SECRET);
            console.log("Decoded Token Data:", decoded);

            if (!roles.includes(decoded.role)) {
                return res.status(403).json({ success: false, message: "Access Denied. Insufficient privileges" });
            }

            req.user = decoded;
            next();
        } catch (error) {
            console.error("Token Verification Error:", error.message);
            res.status(401).json({ success: false, message: "Invalid token", error: error.message });
        }
    };
};

module.exports = authMiddleware;
