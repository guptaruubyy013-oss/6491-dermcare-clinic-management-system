const mongoose = require("mongoose");

const treatmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Patient ID is required"],
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor ID is required"],
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    treatmentType: {
      type: String,
      required: [true, "Treatment type is required"],
      trim: true,
    },

    sessionNumber: {
      type: Number,
      default: 1,
    },

    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },

    procedureNotes: {
      type: String,
      default: "",
      trim: true,
    },

    beforeImages: [
      {
        url: String,
        public_id: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    afterImages: [
      {
        url: String,
        public_id: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    prescriptions: [
      {
        medicineName: {
          type: String,
          trim: true,
        },

        dosage: {
          type: String,
          trim: true,
        },

        duration: {
          type: String,
          trim: true,
        },
      },
    ],

    nextFollowUpDate: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Treatment",
  treatmentSchema
);