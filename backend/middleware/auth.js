const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
    return (req, res, next) => {
        const token = req.header("Authorization");
        if (!token) return res.status(401).json({ message: "Access Denied" });

        try {
            const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: "Invalid Token" });
        }
    };
};