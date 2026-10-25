const Treatment = require("../models/Treatment");
const User = require("../models/User");

// @desc    Add a treatment session with optional Before/After images
// @route   POST /api/treatments
const createTreatment = async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      treatmentType,
      sessionNumber,
      diagnosis,
      procedureNotes,
      prescriptions,
      nextFollowUpDate,
    } = req.body;

    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (!patient) {
      return res.status(400).json({
        message: "Patient ID is required",
      });
    }

    if (!doctor) {
      return res.status(400).json({
        message: "Doctor ID is required",
      });
    }

    if (!treatmentType) {
      return res.status(400).json({
        message: "Treatment type is required",
      });
    }

    if (!diagnosis) {
      return res.status(400).json({
        message: "Diagnosis is required",
      });
    }

    // -------------------------------------------------
    // Find Patient User
    // -------------------------------------------------

    const patientRecord = await User.findById(patient);

    if (!patientRecord) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    if (patientRecord.role !== "patient") {
      return res.status(400).json({
        message: "Selected user is not a patient",
      });
    }

    // -------------------------------------------------
    // Find Doctor User
    // -------------------------------------------------

    const doctorRecord = await User.findById(doctor);

    if (!doctorRecord) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    if (doctorRecord.role !== "doctor") {
      return res.status(400).json({
        message: "Selected user is not a doctor",
      });
    }

    // -------------------------------------------------
    // Handle Before Images
    // -------------------------------------------------

    const beforeImages = [];

    if (req.files && req.files.beforeImages) {
      req.files.beforeImages.forEach((file) => {
        beforeImages.push({
          url: file.path,
          public_id: file.filename,
        });
      });
    }

    // -------------------------------------------------
    // Handle After Images
    // -------------------------------------------------

    const afterImages = [];

    if (req.files && req.files.afterImages) {
      req.files.afterImages.forEach((file) => {
        afterImages.push({
          url: file.path,
          public_id: file.filename,
        });
      });
    }

    // -------------------------------------------------
    // Handle Prescriptions
    // -------------------------------------------------

    let parsedPrescriptions = [];

    if (prescriptions) {
      if (typeof prescriptions === "string") {
        try {
          parsedPrescriptions = JSON.parse(
            prescriptions
          );
        } catch (error) {
          return res.status(400).json({
            message:
              "Invalid prescription data format",
          });
        }
      } else if (Array.isArray(prescriptions)) {
        parsedPrescriptions = prescriptions;
      }
    }

    // -------------------------------------------------
    // Create Treatment
    // -------------------------------------------------

    const treatment = await Treatment.create({
      patient,
      doctor,
      appointment,
      treatmentType,
      sessionNumber: sessionNumber || 1,
      diagnosis,
      procedureNotes: procedureNotes || "",
      beforeImages,
      afterImages,
      prescriptions: parsedPrescriptions,
      nextFollowUpDate,
    });

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    res.status(201).json({
      message:
        "Treatment record & images saved successfully",

      treatment,
    });
  } catch (error) {
    console.error(
      "Create treatment error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while saving treatment record",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

// @desc    Get patient complete treatment history
// @route   GET /api/treatments/patient/:patientId
const getPatientTreatments = async (
  req,
  res
) => {
  try {
    const patientId = req.params.patientId;

    // -------------------------------------------------
    // Find patient
    // -------------------------------------------------

    const patient = await User.findById(
      patientId
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
        treatments: [],
      });
    }

    if (patient.role !== "patient") {
      return res.status(400).json({
        message:
          "Selected user is not a patient",
        treatments: [],
      });
    }

    // -------------------------------------------------
    // Security
    // Patient can only view own records
    // -------------------------------------------------

    if (
      req.user &&
      req.user.role === "patient"
    ) {
      if (
        req.user._id.toString() !==
        patient._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view this patient's treatment history",
        });
      }
    }

    // -------------------------------------------------
    // Get treatments
    // -------------------------------------------------

    const treatments =
      await Treatment.find({
        patient: patient._id,
      })
        .populate(
          "doctor",
          "name email phone role"
        )
        .populate(
          "appointment",
          "date timeSlot concern status doctorName"
        )
        .sort({
          sessionNumber: 1,
          createdAt: 1,
        });

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    res.status(200).json({
      count: treatments.length,

      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      },

      treatments,
    });
  } catch (error) {
    console.error(
      "Get patient treatments error:",
      error
    );

    res.status(500).json({
      message:
        "Server error fetching treatment records",

      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  createTreatment,
  getPatientTreatments,
};