const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// ==================== MIDDLEWARES ====================

app.use(cors());

// Increased limits to 50MB to accept Base64 image strings from frontend
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// ==================== IMPORT ROUTES ====================

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const treatmentRoutes = require("./routes/treatmentRoutes");
const billRoutes = require("./routes/billRoutes");
const orderRoutes = require("./routes/orderRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

// ==================== MOUNT ROUTES ====================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/treatments", treatmentRoutes);
app.use("/api/billing", billRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

// ==================== TEST ROUTE ====================

app.get("/", (req, res) => {
  res.json({
    message: "DermCare API is running 🚀",
  });
});

// ==================== SERVER ====================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});