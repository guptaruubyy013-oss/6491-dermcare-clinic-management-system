const mongoose = require("mongoose");

const BillSchema = new mongoose.Schema(
  {
    // ==========================================
    // BILL NUMBER
    // ==========================================
    billNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ==========================================
    // PATIENT
    // ==========================================
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ==========================================
    // DOCTOR
    // ==========================================
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==========================================
    // APPOINTMENT
    // ==========================================
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    // ==========================================
    // SERVICES / PRODUCTS / HAMPERS
    // ==========================================
    services: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        type: {
          type: String,
          default: "Service",
          trim: true,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        total: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    // ==========================================
    // AMOUNTS
    // ==========================================
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // GST / TAX kept in database for compatibility,
    // but our new billing screen sends 0.
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // PAYMENT
    // ==========================================
    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Partially Paid",
        "Cancelled",
      ],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "UPI",
        "Card",
        "Online",
        "Not Paid",
      ],
      default: "Not Paid",
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // NOTES
    // ==========================================
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Bill", BillSchema);