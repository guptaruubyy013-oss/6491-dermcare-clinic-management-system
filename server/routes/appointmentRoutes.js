const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const User = require("../models/User");

// ======================================================
// GET ALL APPOINTMENTS
// GET /api/appointments
// ======================================================

router.get("/", async (req, res) => {
  try {
    const {
      doctorName,
      doctorId,
      patientEmail,
      patientId,
      date,
      status,
    } = req.query;

    const query = {};

    // ------------------------------
    // Filter by patient email
    // ------------------------------

    if (patientEmail) {
      query.email = patientEmail;
    }

    // ------------------------------
    // Filter by patient ID
    // ------------------------------

    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({
          message: "Invalid patient ID",
        });
      }

      query.patient = patientId;
    }

    // ------------------------------
    // Filter by doctor ID
    // ------------------------------

    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return res.status(400).json({
          message: "Invalid doctor ID",
        });
      }

      query.$or = [
        { doctor: doctorId },
        { doctorId: doctorId },
      ];
    }

    // ------------------------------
    // Filter by doctor name
    // ------------------------------

    if (doctorName) {
      query.doctorName = new RegExp(
        doctorName,
        "i"
      );
    }

    // ------------------------------
    // Filter by date
    // ------------------------------

    if (date) {
      query.date = date;
    }

    // ------------------------------
    // Filter by status
    // ------------------------------

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate(
        "patient",
        "name email phone role"
      )
      .populate(
        "doctor",
        "name email phone role"
      )
      .sort({
        date: 1,
        timeSlot: 1,
        createdAt: -1,
      });

    res.status(200).json({
      message: "Appointments fetched successfully",
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error(
      "Fetch appointments error:",
      error
    );

    res.status(500).json({
      message: "Failed to retrieve appointments",
      error: error.message,
    });
  }
});

// ======================================================
// GET SINGLE APPOINTMENT
// GET /api/appointments/:id
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    const appointment =
      await Appointment.findById(id)
        .populate(
          "patient",
          "name email phone role"
        )
        .populate(
          "doctor",
          "name email phone role"
        );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment fetched successfully",
      appointment,
    });
  } catch (error) {
    console.error(
      "Fetch appointment error:",
      error
    );

    res.status(500).json({
      message: "Failed to retrieve appointment",
      error: error.message,
    });
  }
});

// ======================================================
// CREATE APPOINTMENT
// POST /api/appointments
// ======================================================

router.post("/", async (req, res) => {
  try {
    const {
      patient,
      patientId,

      patientName,
      fullName,
      name,

      phone,
      contact,

      email,

      concern,
      service,

      date,
      appointmentDate,

      timeSlot,
      slot,
      time,

      doctor,
      doctorId,
      doctorName,

      notes,
    } = req.body;

    // ==================================================
    // BASIC VALUES
    // ==================================================

    const finalPatientId =
      patient || patientId || null;

    const finalPatientName =
      patientName ||
      fullName ||
      name ||
      "Patient";

    const finalPhone =
      phone ||
      contact ||
      "";

    const finalEmail =
      email ||
      "";

    const finalConcern =
      concern ||
      service ||
      "General Skin Consultation";

    const finalDate =
      date ||
      appointmentDate;

    const finalTimeSlot =
      timeSlot ||
      slot ||
      time;

    const finalDoctorId =
      doctor ||
      doctorId ||
      null;

    const finalDoctorName =
      doctorName ||
      "Any Available Specialist";

    // ==================================================
    // REQUIRED DATE
    // ==================================================

    if (!finalDate) {
      return res.status(400).json({
        message:
          "Appointment date is required",
      });
    }

    // ==================================================
    // REQUIRED TIME
    // ==================================================

    if (!finalTimeSlot) {
      return res.status(400).json({
        message:
          "Appointment time slot is required",
      });
    }

    // ==================================================
    // VALIDATE PATIENT ID
    // ==================================================

    if (
      finalPatientId &&
      !mongoose.Types.ObjectId.isValid(
        finalPatientId
      )
    ) {
      return res.status(400).json({
        message: "Invalid patient ID",
      });
    }

    // ==================================================
    // VALIDATE DOCTOR ID
    // ==================================================

    if (
      finalDoctorId &&
      !mongoose.Types.ObjectId.isValid(
        finalDoctorId
      )
    ) {
      return res.status(400).json({
        message: "Invalid doctor ID",
      });
    }

    // ==================================================
    // CHECK PATIENT
    // ==================================================

    let patientUser = null;

    if (finalPatientId) {
      patientUser = await User.findById(
        finalPatientId
      );

      if (!patientUser) {
        return res.status(404).json({
          message: "Patient not found",
        });
      }
    } else if (finalEmail) {
      patientUser = await User.findOne({
        email: finalEmail,
      });
    }

    // ==================================================
    // CHECK DOCTOR
    // ==================================================

    let doctorUser = null;

    if (finalDoctorId) {
      doctorUser = await User.findById(
        finalDoctorId
      );

      if (!doctorUser) {
        return res.status(404).json({
          message: "Doctor not found",
        });
      }

      if (doctorUser.role !== "doctor") {
        return res.status(400).json({
          message:
            "Selected user is not registered as a doctor",
        });
      }
    }

    // ==================================================
    // DOUBLE BOOKING CHECK
    // ==================================================

    const activeStatuses = [
      "Confirmed",
      "Checked-In",
      "In-Consultation",
    ];

    let existingAppointment = null;

    // ----------------------------------------------
    // If a specific doctor is selected
    // ----------------------------------------------

    if (finalDoctorId) {
      existingAppointment =
        await Appointment.findOne({
          date: finalDate,
          timeSlot: finalTimeSlot,

          $or: [
            {
              doctor: finalDoctorId,
            },
            {
              doctorId: finalDoctorId,
            },
          ],

          status: {
            $in: activeStatuses,
          },
        });
    }

    // ----------------------------------------------
    // If only doctor name is available
    // ----------------------------------------------

    else if (
      finalDoctorName &&
      finalDoctorName !==
        "Any Available Specialist"
    ) {
      existingAppointment =
        await Appointment.findOne({
          date: finalDate,

          timeSlot: finalTimeSlot,

          doctorName: new RegExp(
            `^${finalDoctorName}$`,
            "i"
          ),

          status: {
            $in: activeStatuses,
          },
        });
    }

    // ==================================================
    // RETURN DOUBLE BOOKING ERROR
    // ==================================================

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "This doctor is already booked for the selected date and time.",
        appointment:
          existingAppointment,
      });
    }

    // ==================================================
    // PATIENT DOUBLE BOOKING CHECK
    // ==================================================

    let patientAlreadyBooked = null;

    if (finalPatientId) {
      patientAlreadyBooked =
        await Appointment.findOne({
          patient: finalPatientId,

          date: finalDate,

          timeSlot: finalTimeSlot,

          status: {
            $in: activeStatuses,
          },
        });
    } else if (finalEmail) {
      patientAlreadyBooked =
        await Appointment.findOne({
          email: finalEmail,

          date: finalDate,

          timeSlot: finalTimeSlot,

          status: {
            $in: activeStatuses,
          },
        });
    }

    if (patientAlreadyBooked) {
      return res.status(409).json({
        message:
          "You already have an appointment at this date and time.",
        appointment:
          patientAlreadyBooked,
      });
    }

    // ==================================================
    // CALCULATE BILL
    // ==================================================

    const consultationFee = 900;

    const treatmentFee = 0;

    const tax = 162;

    const totalAmount =
      consultationFee +
      treatmentFee +
      tax;

    // ==================================================
    // CREATE APPOINTMENT
    // ==================================================

    const newAppointment =
      new Appointment({
        patient:
          patientUser?._id ||
          finalPatientId ||
          null,

        patientName:
          patientUser?.name ||
          finalPatientName,

        name:
          patientUser?.name ||
          finalPatientName,

        phone:
          patientUser?.phone ||
          finalPhone,

        email:
          patientUser?.email ||
          finalEmail,

        concern:
          finalConcern,

        date:
          finalDate,

        timeSlot:
          finalTimeSlot,

        doctor:
          doctorUser?._id ||
          finalDoctorId ||
          null,

        doctorId:
          doctorUser?._id ||
          finalDoctorId ||
          null,

        doctorName:
          doctorUser?.name ||
          finalDoctorName,

        notes:
          notes || "",

        status:
          "Confirmed",

        consultationFee,

        treatmentFee,

        tax,

        totalAmount,

        paymentStatus:
          "Unpaid",

        invoiceNumber:
          `INV-${Date.now()
            .toString()
            .slice(-6)}`,
      });

    const saved =
      await newAppointment.save();

    // ==================================================
    // RESPONSE
    // ==================================================

    const populatedAppointment =
      await Appointment.findById(
        saved._id
      )
        .populate(
          "patient",
          "name email phone role"
        )
        .populate(
          "doctor",
          "name email phone role"
        );

    res.status(201).json({
      message:
        "Appointment booked successfully",
      appointment:
        populatedAppointment,
    });
  } catch (error) {
    console.error(
      "Booking error:",
      error
    );

    res.status(500).json({
      message:
        "Error booking appointment",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE APPOINTMENT
// PUT /api/appointments/:id
// ======================================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message:
          "Invalid appointment ID",
      });
    }

    const appointment =
      await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        message:
          "Appointment record not found",
      });
    }

    const {
      date,
      timeSlot,
      doctorId,
      doctor,
      doctorName,
      status,
    } = req.body;

    // ==================================================
    // CHECK RESCHEDULING DOUBLE BOOKING
    // ==================================================

    const newDate =
      date || appointment.date;

    const newTimeSlot =
      timeSlot ||
      appointment.timeSlot;

    const newDoctorId =
      doctorId ||
      doctor ||
      appointment.doctorId;

    if (
      newDoctorId &&
      mongoose.Types.ObjectId.isValid(
        newDoctorId
      )
    ) {
      const conflict =
        await Appointment.findOne({
          _id: {
            $ne: id,
          },

          date: newDate,

          timeSlot: newTimeSlot,

          $or: [
            {
              doctor:
                newDoctorId,
            },
            {
              doctorId:
                newDoctorId,
            },
          ],

          status: {
            $in: [
              "Confirmed",
              "Checked-In",
              "In-Consultation",
            ],
          },
        });

      if (conflict) {
        return res.status(409).json({
          message:
            "This doctor is already booked for the selected date and time.",
        });
      }
    }

    // ==================================================
    // UPDATE
    // ==================================================

    const updateData = {
      ...req.body,
    };

    if (date) {
      updateData.date = date;
    }

    if (timeSlot) {
      updateData.timeSlot =
        timeSlot;
    }

    if (doctorId || doctor) {
      updateData.doctorId =
        doctorId || doctor;

      updateData.doctor =
        doctorId || doctor;
    }

    if (doctorName) {
      updateData.doctorName =
        doctorName;
    }

    if (status) {
      updateData.status =
        status;
    }

    const updated =
      await Appointment.findByIdAndUpdate(
        id,
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate(
          "patient",
          "name email phone role"
        )
        .populate(
          "doctor",
          "name email phone role"
        );

    res.status(200).json({
      message:
        "Appointment updated successfully",
      appointment:
        updated,
    });
  } catch (error) {
    console.error(
      "Update appointment error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update appointment",
      error: error.message,
    });
  }
});

// ======================================================
// CANCEL APPOINTMENT
// PATCH /api/appointments/:id/cancel
// ======================================================

router.patch(
  "/:id/cancel",
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid appointment ID",
        });
      }

      const appointment =
        await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({
          message:
            "Appointment not found",
        });
      }

      appointment.status =
        "Cancelled";

      await appointment.save();

      res.status(200).json({
        message:
          "Appointment cancelled successfully",
        appointment,
      });
    } catch (error) {
      console.error(
        "Cancel appointment error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to cancel appointment",
        error: error.message,
      });
    }
  }
);

// ======================================================
// DELETE APPOINTMENT
// DELETE /api/appointments/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message:
          "Invalid appointment ID",
      });
    }

    const appointment =
      await Appointment.findByIdAndDelete(
        id
      );

    if (!appointment) {
      return res.status(404).json({
        message:
          "Appointment not found",
      });
    }

    res.status(200).json({
      message:
        "Appointment deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete appointment error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete appointment",
      error: error.message,
    });
  }
});

module.exports = router;                              