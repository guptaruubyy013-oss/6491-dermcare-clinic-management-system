const Doctor = require("../models/Doctor");
const User = require("../models/User");

// @desc    Add / Create a new Doctor
// @route   POST /api/admin/doctors
// @access  Admin
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      specialization,
      qualification,
      qualifications,
      experience,
      experienceYears,
      consultationFee,
      licenseNumber,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !specialization) {
      return res.status(400).json({
        message:
          "Please fill name, email, phone and specialization.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if Doctor profile already exists
    const existingDoctor = await Doctor.findOne({
      email: normalizedEmail,
    });

    if (existingDoctor) {
      return res.status(400).json({
        message:
          "Doctor profile already registered with this email.",
      });
    }

    // Find existing User account
    let user = await User.findOne({
      email: normalizedEmail,
    });

    // Create User account if it does not exist
    if (!user) {
      user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || "",
        password: "Doctor@123",
        role: "doctor",
        qualification:
          qualification ||
          qualifications ||
          "MBBS, MD (Dermatology)",
        specialty: specialization,
        consultationFee:
          consultationFee || 800,
      });
    } else {
      // Make sure existing user is a doctor
      if (user.role !== "doctor") {
        return res.status(400).json({
          message:
            "A user with this email already exists with another role.",
        });
      }
    }

    // Create Doctor profile
    const doctor = await Doctor.create({
      user: user._id,

      name: name.trim(),

      email: normalizedEmail,

      phone: phone || "",

      specialization: specialization.trim(),

      specialty: specialization.trim(),

      qualification:
        qualification ||
        qualifications ||
        "MBBS, MD (Dermatology)",

      qualifications:
        qualifications ||
        qualification ||
        "MBBS, MD (Dermatology)",

      experience: Number(
        experience || experienceYears || 5
      ),

      experienceYears: Number(
        experienceYears || experience || 5
      ),

      licenseNumber:
        licenseNumber ||
        `DOC-${Math.floor(
          100000 + Math.random() * 900000
        )}`,

      consultationFee: Number(
        consultationFee || 800
      ),

      availableDays: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],

      timeSlots: [
        "10:00 AM",
        "11:30 AM",
        "02:00 PM",
        "04:30 PM",
        "06:00 PM",
      ],

      isAvailable: true,
    });

    // Populate User information
    const populatedDoctor =
      await Doctor.findById(doctor._id).populate(
        "user",
        "name email phone role"
      );

    res.status(201).json({
      message:
        "Doctor profile created successfully! 🩺",
      doctor: populatedDoctor,
    });
  } catch (error) {
    console.error(
      "Add Doctor Error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to create doctor.",
    });
  }
};


// @desc    Get all Doctors
// @route   GET /api/admin/doctors
// @access  Authenticated
const getDoctors = async (req, res) => {
  try {
    const doctors =
      await Doctor.find()
        .populate(
          "user",
          "name email phone role"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      doctors,
    });
  } catch (error) {
    console.error(
      "Get Doctors Error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to fetch doctors.",
    });
  }
};


// @desc    Get Single Doctor by ID
// @route   GET /api/admin/doctors/:id
// @access  Authenticated
const getDoctorById = async (req, res) => {
  try {
    const doctor =
      await Doctor.findById(
        req.params.id
      ).populate(
        "user",
        "name email phone role"
      );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
      });
    }

    res.status(200).json({
      doctor,
    });
  } catch (error) {
    console.error(
      "Get Doctor Error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to fetch doctor.",
    });
  }
};


// @desc    Update Doctor
// @route   PUT /api/admin/doctors/:id
// @access  Admin
const updateDoctor = async (req, res) => {
  try {
    const doctor =
      await Doctor.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "user",
        "name email phone role"
      );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
      });
    }

    res.status(200).json({
      message:
        "Doctor updated successfully.",
      doctor,
    });
  } catch (error) {
    console.error(
      "Update Doctor Error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to update doctor.",
    });
  }
};


// @desc    Delete Doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Admin
const deleteDoctor = async (req, res) => {
  try {
    const doctor =
      await Doctor.findByIdAndDelete(
        req.params.id
      );

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
      });
    }

    // Also deactivate the linked User
    if (doctor.user) {
      await User.findByIdAndUpdate(
        doctor.user,
        {
          role: "patient",
        }
      );
    }

    res.status(200).json({
      message:
        "Doctor deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Doctor Error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to delete doctor.",
    });
  }
};


module.exports = {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};