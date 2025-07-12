const User = require("../models/User");
const Company = require("../models/Company");
const NGO = require("../models/NGO"); // ✅ Import NGO model
const bcrypt = require("bcryptjs");
const Company = require("../models/Campaign");


exports.signup = async (req, res) => {
    const { fullName, email, phoneNumber, password, role } = req.body;

    try {
        console.log("🔍 Signup Request Received:", { fullName, email, phoneNumber, role });

        // Ensure role is case-insensitive
        const normalizedRole = role?.trim().toLowerCase();
        let newCompany = null;
        let newNGO = null;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("⚠️ User already exists:", email);
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role: normalizedRole,
        });

        console.log("✅ User created successfully:", newUser);

        // 🔵 **If Company, Create Company Profile**
        if (normalizedRole === "company") {
            console.log("🟢 Attempting to create company profile for:", email);
            try {
                newCompany = await Company.create({
                    userId: newUser._id,
                    companyName: fullName,
                    companyEmail: email,
                    registrationNumber: "Pending",
                    companyAddress: "Not provided",
                    companyPhoneNumber: phoneNumber,
                    ceoName: "Not provided",
                    ceoContactNumber: "Not provided",
                    ceoEmail: "Not provided",
                    companyType: "IT",
                    numberOfEmployees: 1,
                    companyLogo: "",
                });

                console.log("✅ Company profile created successfully:", newCompany);
            } catch (companyError) {
                console.error("❌ ERROR: Failed to create company:", companyError.message, companyError);
                return res.status(500).json({ message: "Company profile creation failed", error: companyError.message });
            }
        }

        // 🔵 **If NGO, Create NGO Profile**
        if (normalizedRole === "ngo") {
            console.log("🟢 Attempting to create NGO profile for:", email);
            try {
                newNGO = await NGO.create({
                    ngoName: fullName,
                    registrationNumber: "Pending",
                    registeredYear: new Date().getFullYear(),
                    address: "Not provided",
                    contactNumber: phoneNumber,
                    email: email,
                    website: "Not provided",
                    authorizedPerson: {
                        name: "Not provided",
                        phone: "Not provided",
                        email: "Not provided",
                    },
                    panNumber: "Not provided",
                    tanNumber: "Not provided",
                    gstNumber: "Not provided",
                    numberOfEmployees: 1,
                    ngoType: "Trust", // Default value
                    is80GCertified: false,
                    is12ACertified: false,
                    bankDetails: {
                        accountHolderName: "Not provided",
                        accountNumber: "Not provided",
                        ifscCode: "Not provided",
                        bankName: "Not provided",
                        branchName: "Not provided",
                    },
                    logo: "",
                    isActive: true,
                });

                console.log("✅ NGO profile created successfully:", newNGO);
            } catch (ngoError) {
                console.error("❌ ERROR: Failed to create NGO:", ngoError.message, ngoError);
                return res.status(500).json({ message: "NGO profile creation failed", error: ngoError.message });
            }
        }

        return res.status(201).json({
            message: "User created successfully",
            user: newUser,
            company: newCompany,
            ngo: newNGO,
        });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};
