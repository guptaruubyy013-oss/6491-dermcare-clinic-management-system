const express = require("express");

const router = express.Router();

const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  getPatientPrescriptions,
  updatePrescription,
  deletePrescription,
} = require("../controllers/prescriptionController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.use(protect);

// Create prescription
router.post(
  "/",
  authorize("doctor", "admin"),
  createPrescription
);

// Get all prescriptions
router.get(
  "/",
  authorize(
    "admin",
    "doctor",
    "receptionist"
  ),
  getPrescriptions
);

// Get patient prescriptions
router.get(
  "/patient/:patientId",
  authorize(
    "admin",
    "doctor",
    "receptionist",
    "patient"
  ),
  getPatientPrescriptions
);

// Get single prescription
router.get(
  "/:id",
  authorize(
    "admin",
    "doctor",
    "receptionist",
    "patient"
  ),
  getPrescriptionById
);

// Update prescription
router.put(
  "/:id",
  authorize("doctor", "admin"),
  updatePrescription
);

// Delete prescription
router.delete(
  "/:id",
  authorize("doctor", "admin"),
  deletePrescription
);

module.exports = router;