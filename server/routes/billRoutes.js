const express = require("express");
const router = express.Router();

const Bill = require("../models/Bill");
const User = require("../models/User");

// ======================================================
// CREATE BILL
// POST /api/billing
// ======================================================
router.post("/", async (req, res) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      services,
      subtotal,
      discount,
      tax,
      totalAmount,
      paymentStatus,
      paymentMethod,
      paidAmount,
      notes,
    } = req.body;

    console.log("========== CREATE BILL ==========");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // --------------------------------------------------
    // Validate patient
    // --------------------------------------------------
    if (!patient) {
      return res.status(400).json({
        message: "Patient is required",
      });
    }

    const patientExists = await User.findById(patient);

    if (!patientExists) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    // --------------------------------------------------
    // Validate services
    // --------------------------------------------------
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        message: "At least one service or product is required",
      });
    }

    // --------------------------------------------------
    // Clean services
    // --------------------------------------------------
    const cleanedServices = services.map((item) => {
      const quantity = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;

      return {
        name: item.name,
        quantity,
        price,
        total: quantity * price,
      };
    });

    // Check service names
    const invalidService = cleanedServices.find(
      (item) => !item.name || item.price < 0 || item.total < 0
    );

    if (invalidService) {
      return res.status(400).json({
        message: "Invalid product/service details",
      });
    }

    // --------------------------------------------------
    // Calculate subtotal
    // --------------------------------------------------
    const calculatedSubtotal = cleanedServices.reduce(
      (sum, item) => sum + item.total,
      0
    );

    // --------------------------------------------------
    // Discount
    // --------------------------------------------------
    const discountAmount = Math.max(Number(discount) || 0, 0);

    // --------------------------------------------------
    // Tax is intentionally 0
    // --------------------------------------------------
    const taxAmount = 0;

    // --------------------------------------------------
    // Calculate final amount
    // --------------------------------------------------
    const calculatedTotal = Math.max(
      calculatedSubtotal - discountAmount,
      0
    );

    // --------------------------------------------------
    // Payment status
    // --------------------------------------------------
    const finalPaymentStatus = paymentStatus || "Pending";

    const allowedPaymentStatuses = [
      "Pending",
      "Paid",
      "Partially Paid",
      "Cancelled",
    ];

    if (!allowedPaymentStatuses.includes(finalPaymentStatus)) {
      return res.status(400).json({
        message: "Invalid payment status",
      });
    }

    // --------------------------------------------------
    // Payment method
    // --------------------------------------------------
    let finalPaymentMethod = paymentMethod || "Not Paid";

    const allowedPaymentMethods = [
      "Cash",
      "UPI",
      "Card",
      "Online",
      "Not Paid",
    ];

    if (!allowedPaymentMethods.includes(finalPaymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    // --------------------------------------------------
    // Paid amount
    // --------------------------------------------------
    let finalPaidAmount = Number(paidAmount) || 0;

    if (finalPaymentStatus === "Paid") {
      finalPaidAmount = calculatedTotal;

      if (finalPaymentMethod === "Not Paid") {
        finalPaymentMethod = "Cash";
      }
    }

    if (
      finalPaymentStatus === "Pending" ||
      finalPaymentStatus === "Cancelled"
    ) {
      finalPaidAmount = 0;
      finalPaymentMethod = "Not Paid";
    }

    if (finalPaymentStatus === "Partially Paid") {
      if (finalPaidAmount < 0) {
        finalPaidAmount = 0;
      }

      if (finalPaidAmount > calculatedTotal) {
        finalPaidAmount = calculatedTotal;
      }

      if (finalPaidAmount === 0) {
        finalPaymentMethod = "Not Paid";
      }
    }

    // --------------------------------------------------
    // Generate bill number
    // --------------------------------------------------
    const billNumber = `BILL-${Date.now()}`;

    // --------------------------------------------------
    // Create bill
    // --------------------------------------------------
    const billData = {
      billNumber,

      patient,

      services: cleanedServices,

      subtotal: calculatedSubtotal,

      discount: discountAmount,

      tax: taxAmount,

      totalAmount: calculatedTotal,

      paymentStatus: finalPaymentStatus,

      paymentMethod: finalPaymentMethod,

      paidAmount: finalPaidAmount,

      notes: notes || "",
    };

    // Add doctor only if supplied
    if (doctor) {
      billData.doctor = doctor;
    }

    // Add appointment only if supplied
    if (appointment) {
      billData.appointment = appointment;
    }

    console.log("Final bill data:", JSON.stringify(billData, null, 2));

    const bill = new Bill(billData);

    const savedBill = await bill.save();

    console.log("Bill created successfully:", savedBill._id);

    // --------------------------------------------------
    // Populate patient/doctor/appointment
    // --------------------------------------------------
    const populatedBill = await Bill.findById(savedBill._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("appointment");

    return res.status(201).json({
      message: "Bill created successfully",
      bill: populatedBill,
    });
  } catch (error) {
    console.error("========== CREATE BILL ERROR ==========");
    console.error(error);
    console.error("Error message:", error.message);
    console.error("Error name:", error.name);
    console.error("=======================================");

    return res.status(500).json({
      message: "Server error while creating bill",
      error: error.message,
    });
  }
});

// ======================================================
// GET ALL BILLS
// GET /api/billing
// ======================================================
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Bills fetched successfully",
      count: bills.length,
      bills,
    });
  } catch (error) {
    console.error("Error fetching bills:", error);

    res.status(500).json({
      message: "Server error while fetching bills",
      error: error.message,
    });
  }
});

// ======================================================
// GET SINGLE BILL
// GET /api/billing/:id
// ======================================================
router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("appointment");

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    res.status(200).json({
      message: "Bill fetched successfully",
      bill,
    });
  } catch (error) {
    console.error("Error fetching bill:", error);

    res.status(500).json({
      message: "Server error while fetching bill",
      error: error.message,
    });
  }
});

// ======================================================
// GET PATIENT BILLS
// GET /api/billing/patient/:patientId
// ======================================================
router.get("/patient/:patientId", async (req, res) => {
  try {
    const bills = await Bill.find({
      patient: req.params.patientId,
    })
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Patient bills fetched successfully",
      count: bills.length,
      bills,
    });
  } catch (error) {
    console.error("Error fetching patient bills:", error);

    res.status(500).json({
      message: "Server error while fetching patient bills",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE BILL
// PUT /api/billing/:id
// ======================================================
router.put("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    const updatedBill = await Bill.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("appointment");

    res.status(200).json({
      message: "Bill updated successfully",
      bill: updatedBill,
    });
  } catch (error) {
    console.error("Error updating bill:", error);

    res.status(500).json({
      message: "Server error while updating bill",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE PAYMENT
// PATCH /api/billing/:id/payment
// ======================================================
router.patch("/:id/payment", async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, paidAmount } = req.body;

    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    bill.paymentStatus = paymentStatus || bill.paymentStatus;
    bill.paymentMethod = paymentMethod || bill.paymentMethod;
    bill.paidAmount =
      paidAmount !== undefined
        ? Number(paidAmount)
        : bill.paidAmount;

    await bill.save();

    const updatedBill = await Bill.findById(bill._id)
      .populate("patient", "name email phone")
      .populate("doctor", "name email")
      .populate("appointment");

    res.status(200).json({
      message: "Payment updated successfully",
      bill: updatedBill,
    });
  } catch (error) {
    console.error("Error updating payment:", error);

    res.status(500).json({
      message: "Server error while updating payment",
      error: error.message,
    });
  }
});

// ======================================================
// DELETE BILL
// DELETE /api/billing/:id
// ======================================================
router.delete("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        message: "Bill not found",
      });
    }

    await Bill.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Bill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting bill:", error);

    res.status(500).json({
      message: "Server error while deleting bill",
      error: error.message,
    });
  }
});

module.exports = router;