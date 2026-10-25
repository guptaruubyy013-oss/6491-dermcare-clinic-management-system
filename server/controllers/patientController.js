const Patient = require("../models/Patient");
const User = require("../models/User");

// @desc    Create/Register a new Patient
// @route   POST /api/patients
// @access  Admin, Receptionist
const createPatient = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      gender,
      age,
      bloodGroup,
      medicalHistory,
      allergies,
      address,
    } = req.body;

    if (!name || !phone || !age) {
      return res.status(400).json({
        message: "Name, phone, and age are required",
      });
    }

    const patient = await Patient.create({
      name,
      phone,
      email: email || "",
      gender: gender || "Male",
      age: Number(age),
      bloodGroup: bloodGroup || "Unknown",
      medicalHistory: medicalHistory || [],
      allergies: allergies || [],
      address: address || "",
    });

    res.status(201).json({
      message: "Patient registered successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get all Patients
// @route   GET /api/patients
// @access  Admin, Receptionist, Doctor
const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      patients,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get Single Patient by Patient ID or User ID
// @route   GET /api/patients/:id
// @access  Admin, Receptionist, Doctor, Patient
const getPatientById = async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);

    // If Patient ID was not found, try logged-in User ID
    if (!patient) {
      const user = await User.findById(req.params.id);

      if (user) {
        patient = await Patient.findOne({
          email: user.email,
        });
      }
    }

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }

    res.status(200).json({
      patient,
    });
  } catch (error) {
    // If ID is not a valid Patient ObjectId,
    // try finding the User first.
    try {
      const user = await User.findById(req.params.id);

      if (user) {
        const patient = await Patient.findOne({
          email: user.email,
        });

        if (patient) {
          return res.status(200).json({
            patient,
          });
        }
      }

      return res.status(404).json({
        message: "Patient profile not found",
      });
    } catch (fallbackError) {
      res.status(500).json({
        message: fallbackError.message,
      });
    }
  }
};

// @desc    Update Patient
// @route   PUT /api/patients/:id
// @access  Admin, Receptionist
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.status(200).json({
      message: "Patient updated successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Delete Patient
// @route   DELETE /api/patients/:id
// @access  Admin
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(
      req.params.id
    );

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.status(200).json({
      message: "Patient deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};