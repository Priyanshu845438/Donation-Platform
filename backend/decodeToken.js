const jwt = require("jsonwebtoken");

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzMzMmJkOTJhYzI0OWM3MGFkODRhZSIsInJvbGUiOiJuZ28iLCJpYXQiOjE3NDA4NTA1MDksImV4cCI6MTc0MDkzNjkwOX0.-_58a_VCnCCLRfukddzBcwFyRlsUYEeJMCGVxdzm-4Q"; // Replace with your token
const decoded = jwt.decode(token);

console.log(decoded);
