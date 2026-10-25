const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema(
  {
    // Link Doctor profile to User account
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    // Kept for compatibility with older frontend code
    specialty: {
      type: String,
      default: "",
      trim: true,
    },

    qualification: {
      type: String,
      default: "MBBS, MD (Dermatology)",
      trim: true,
    },

    qualifications: {
      type: String,
      default: "MBBS, MD (Dermatology)",
      trim: true,
    },

    experience: {
      type: Number,
      default: 5,
    },

    experienceYears: {
      type: Number,
      default: 5,
    },

    licenseNumber: {
      type: String,
      default: "",
    },

    consultationFee: {
      type: Number,
      default: 800,
    },

    availableDays: {
      type: [String],
      default: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },

    timeSlots: {
      type: [String],
      default: [
        "10:00 AM",
        "11:30 AM",
        "02:00 PM",
        "04:30 PM",
        "06:00 PM",
      ],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", DoctorSchema);