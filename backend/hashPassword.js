const bcrypt = require("bcrypt");

const testPassword = "Acadify@123"; // The password you expect to match
const storedHash = "$2b$10$DoqvUtAUa0hDSJD5Ed4wNOu0AKTIxHUfY02/5gIqpgym1imuV1fHi"; // Get this from MongoDB

async function testPasswordMatch() {
    const newHash = await bcrypt.hash(testPassword, 10);
    console.log("Newly Hashed Password:", newHash);

    const isMatch = await bcrypt.compare(testPassword, storedHash);
    console.log("Does it match?:", isMatch);
}

testPasswordMatch();
