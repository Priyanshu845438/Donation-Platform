const bcrypt = require("bcrypt");

const password = "company@123"; // Change this to your desired password
bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
    } else {
        console.log("Hashed Password:", hash);
    }
});
