const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },

    dosage: {
      type: String,
      required: [true, "Dosage is required"],
      trim: true,
    },

    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      trim: true,
    },

    duration: {
      type: String,
      required: [true, "Duration is required"],
      trim: true,
    },

    instructions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient ID is required"],
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Doctor ID is required"],
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },

    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },

    medicines: {
      type: [medicineSchema],
      required: true,
      validate: {
        validator: function (value) {
          return value.length > 0;
        },
        message: "At least one medicine is required",
      },
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    prescribedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Prescription",
  prescriptionSchema
);