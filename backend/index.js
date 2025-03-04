const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path'); // Import path module if needed

const authRoutes = require("./routes/auth");
const ngoRoutes = require("./routes/ngo");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin"); // ✅ Add Admin Routes
const campaignRoutes = require("./routes/campaign");
const companyRoutes = require("./routes/company");
const donationRoutes = require("./routes/donation");
const adminDashboardRoute = require('./routes/adminDashboard');
const userRoutes = require('./routes/userRoutes'); 
const statsRoutes = require('./routes/stats');



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // Adjust this to the frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],  // Optional: You can specify allowed methods here
  allowedHeaders: ["Content-Type", "Authorization"] // Optional: Allow specific headers
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes); // ✅ Add this line
app.use("/api/campaign", campaignRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/donation", donationRoutes);
app.use('/api/admin', adminDashboardRoute);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static('uploads'));
app.use(cors({ origin: '*' }));
app.use('/api/stats', statsRoutes);




// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ MongoDB Connection Error: ", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
