const express = require("express");
const router = express.Router();

const User = require("../models/User");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

const {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

// ======================================================
// DOCTOR MANAGEMENT
// ======================================================

router.post(
  "/doctors",
  protect,
  authorize("admin"),
  addDoctor
);

router.get(
  "/doctors",
  protect,
  authorize(
    "admin",
    "receptionist",
    "doctor",
    "patient"
  ),
  getDoctors
);

router.get(
  "/doctors/:id",
  protect,
  authorize(
    "admin",
    "receptionist",
    "doctor"
  ),
  getDoctorById
);

router.put(
  "/doctors/:id",
  protect,
  authorize("admin"),
  updateDoctor
);

router.delete(
  "/doctors/:id",
  protect,
  authorize("admin"),
  deleteDoctor
);

// ======================================================
// PATIENT USER MANAGEMENT
// ======================================================

router.get(
  "/patients",
  protect,
  authorize("admin", "receptionist"),
  async (req, res) => {
    try {
      const patients = await User.find({
        role: "patient",
      })
        .select("_id name email phone role")
        .sort({ createdAt: -1 });

      res.status(200).json({
        patients,
      });
    } catch (error) {
      console.error(
        "Admin patient fetch error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to fetch patient accounts",
      });
    }
  }
);

module.exports = router;