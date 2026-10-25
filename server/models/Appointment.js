const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema(
  {
    // ============================
    // PATIENT DETAILS
    // ============================

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    patientName: {
      type: String,
      required: true,
      default: "Patient",
      trim: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    // ============================
    // APPOINTMENT DETAILS
    // ============================

    concern: {
      type: String,
      default: "General Dermatology Consultation",
      trim: true,
    },

    date: {
      type: String,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },

    // ============================
    // DOCTOR DETAILS
    // ============================

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    doctorName: {
      type: String,
      default: "Any Available Specialist",
      trim: true,
    },

    // ============================
    // APPOINTMENT STATUS
    // ============================

    status: {
      type: String,
      enum: [
        "Confirmed",
        "Checked-In",
        "In-Consultation",
        "Completed",
        "Checked-Out",
        "Cancelled",
      ],
      default: "Confirmed",
    },

    // ============================
    // CLINICAL INFORMATION
    // ============================

    prescription: {
      type: String,
      default: "",
    },

    clinicalNotes: {
      type: String,
      default: "",
    },

    // ============================
    // BEFORE / AFTER IMAGES
    // ============================

    beforeImage: {
      type: String,
      default: "",
    },

    afterImage: {
      type: String,
      default: "",
    },

    // ============================
    // BILLING DETAILS
    // ============================

    consultationFee: {
      type: Number,
      default: 900,
      min: 0,
    },

    treatmentFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 162,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 1062,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },

    paymentMethod: {
      type: String,
      default: "UPI / Card",
      trim: true,
    },

    invoiceNumber: {
      type: String,
      default: () =>
        `INV-${Date.now().toString().slice(-6)}`,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Appointment",
  AppointmentSchema
);