const Prescription = require("../models/Prescription");
const Doctor = require("../models/Doctor");

// ======================================================
// CREATE PRESCRIPTION
// POST /api/prescriptions
// ======================================================

const createPrescription = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      diagnosis,
      medicines,
      notes,
    } = req.body;

    // Patient is required
    if (!patient) {
      return res.status(400).json({
        message: "Patient ID is required",
      });
    }

    // Diagnosis is required
    if (!diagnosis) {
      return res.status(400).json({
        message: "Diagnosis is required",
      });
    }

    // Medicines are required
    if (
      !medicines ||
      !Array.isArray(medicines) ||
      medicines.length === 0
    ) {
      return res.status(400).json({
        message: "At least one medicine is required",
      });
    }

    // ==================================================
    // FIND DOCTOR PROFILE
    // ==================================================

    let doctorId = doctor;

    // If logged-in user is a doctor,
    // automatically find the Doctor profile
    // connected to that User account.
    if (req.user?.role === "doctor") {
      const doctorProfile = await Doctor.findOne({
        user: req.user._id,
      });

      if (!doctorProfile) {
        return res.status(404).json({
          message: "Doctor profile not found",
        });
      }

      doctorId = doctorProfile._id;
    }

    // Doctor is required
    if (!doctorId) {
      return res.status(400).json({
        message: "Doctor ID is required",
      });
    }

    // ==================================================
    // CREATE PRESCRIPTION
    // ==================================================

    const prescription = await Prescription.create({
      patient,
      doctor: doctorId,
      appointment: appointment || undefined,
      diagnosis,
      medicines,
      notes: notes || "",
    });

    // ==================================================
    // POPULATE DATA
    // ==================================================

    const populatedPrescription =
      await Prescription.findById(prescription._id)
        .populate(
          "patient",
          "name phone email gender age address"
        )
        .populate(
          "doctor",
          "name specialization qualification experience"
        )
        .populate("appointment");

    res.status(201).json({
      message: "Prescription created successfully",
      prescription: populatedPrescription,
    });
  } catch (error) {
    console.error(
      "Create prescription error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// GET ALL PRESCRIPTIONS
// GET /api/prescriptions
// ======================================================

const getPrescriptions = async (req, res) => {
  try {
    const prescriptions =
      await Prescription.find()
        .populate(
          "patient",
          "name phone email gender age"
        )
        .populate(
          "doctor",
          "name specialization qualification experience"
        )
        .populate("appointment")
        .sort({ createdAt: -1 });

    res.status(200).json({
      prescriptions,
    });
  } catch (error) {
    console.error(
      "Get prescriptions error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// GET SINGLE PRESCRIPTION
// GET /api/prescriptions/:id
// ======================================================

const getPrescriptionById = async (
  req,
  res
) => {
  try {
    const prescription =
      await Prescription.findById(
        req.params.id
      )
        .populate(
          "patient",
          "name phone email gender age address"
        )
        .populate(
          "doctor",
          "name specialization qualification experience"
        )
        .populate("appointment");

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      prescription,
    });
  } catch (error) {
    console.error(
      "Get prescription error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// GET PATIENT PRESCRIPTIONS
// GET /api/prescriptions/patient/:patientId
// ======================================================

const getPatientPrescriptions = async (
  req,
  res
) => {
  try {
    const prescriptions =
      await Prescription.find({
        patient: req.params.patientId,
      })
        .populate(
          "patient",
          "name phone email"
        )
        .populate(
          "doctor",
          "name specialization qualification"
        )
        .populate("appointment")
        .sort({ prescribedDate: -1 });

    res.status(200).json({
      prescriptions,
    });
  } catch (error) {
    console.error(
      "Get patient prescriptions error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE PRESCRIPTION
// PUT /api/prescriptions/:id
// ======================================================

const updatePrescription = async (
  req,
  res
) => {
  try {
    const prescription =
      await Prescription.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "patient",
          "name phone email"
        )
        .populate(
          "doctor",
          "name specialization qualification"
        )
        .populate("appointment");

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (error) {
    console.error(
      "Update prescription error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// DELETE PRESCRIPTION
// DELETE /api/prescriptions/:id
// ======================================================

const deletePrescription = async (
  req,
  res
) => {
  try {
    const prescription =
      await Prescription.findByIdAndDelete(
        req.params.id
      );

    if (!prescription) {
      return res.status(404).json({
        message: "Prescription not found",
      });
    }

    res.status(200).json({
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete prescription error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  getPatientPrescriptions,
  updatePrescription,
  deletePrescription,
};