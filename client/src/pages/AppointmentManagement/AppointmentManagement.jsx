import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarCheck,
  FaCheck,
  FaClock,
  FaMagnifyingGlass,
  FaRotate,
  FaUserDoctor,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaXmark,
} from "react-icons/fa6";

import API from "../../api/axios";
import "./AppointmentManagement.css";

const AppointmentManagement = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // LOAD APPOINTMENTS
  const loadAppointments = async () => {
    try {
      setLoading(true);

      const response = await API.get("/appointments");

      setAppointments(
        response.data.appointments || response.data || []
      );
    } catch (error) {
      console.error("Error loading appointments:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      await API.put(`/appointments/${id}`, {
        status,
      });

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id
            ? {
                ...appointment,
                status,
              }
            : appointment
        )
      );
    } catch (error) {
      console.error("Status update error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update appointment status."
      );
    }
  };

  // CANCEL APPOINTMENT
  const cancelAppointment = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) return;

    try {
      await API.patch(`/appointments/${id}/cancel`);

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id
            ? {
                ...appointment,
                status: "Cancelled",
              }
            : appointment
        )
      );
    } catch (error) {
      console.error("Cancel appointment error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to cancel appointment."
      );
    }
  };

  // FILTER APPOINTMENTS
  const filteredAppointments = appointments.filter(
    (appointment) => {
      const patientName =
        appointment.patientName ||
        appointment.patient?.name ||
        appointment.name ||
        "";

      const patientPhone =
        appointment.phone ||
        appointment.patient?.phone ||
        "";

      const patientEmail =
        appointment.email ||
        appointment.patient?.email ||
        "";

      const doctorName =
        appointment.doctorName ||
        appointment.doctor?.name ||
        "";

      const concern = appointment.concern || "";

      const searchText = `
        ${patientName}
        ${patientPhone}
        ${patientEmail}
        ${doctorName}
        ${concern}
      `.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      const matchesDate =
        !dateFilter ||
        appointment.date === dateFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDate
      );
    }
  );

  // STATISTICS
  const totalAppointments = appointments.length;

  const confirmedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Confirmed"
  ).length;

  const checkedInAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Checked-In"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "Completed"
  ).length;

  // FORMAT DATE
  const formatDate = (date) => {
    if (!date) return "N/A";

    const formattedDate = new Date(date);

    if (isNaN(formattedDate.getTime())) {
      return date;
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // PATIENT DETAILS
  const getPatientName = (appointment) => {
    return (
      appointment.patientName ||
      appointment.patient?.name ||
      appointment.name ||
      "Unknown Patient"
    );
  };

  const getPatientPhone = (appointment) => {
    return (
      appointment.phone ||
      appointment.patient?.phone ||
      "Not available"
    );
  };

  const getPatientEmail = (appointment) => {
    return (
      appointment.email ||
      appointment.patient?.email ||
      "Not available"
    );
  };

  // DOCTOR DETAILS
  const getDoctorName = (appointment) => {
    return (
      appointment.doctorName ||
      appointment.doctor?.name ||
      "Any Available Specialist"
    );
  };

  // STATUS CLASS
  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "status-confirmed";

      case "Checked-In":
        return "status-checked-in";

      case "In-Consultation":
        return "status-consultation";

      case "Completed":
        return "status-completed";

      case "Checked-Out":
        return "status-checked-out";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  };

  return (
    <div className="am-page">
      <div className="am-container">

        {/* HEADER */}
        <div className="am-header">

          <div>
            <div className="am-eyebrow">
              <FaCalendarCheck />
              APPOINTMENT MANAGEMENT
            </div>

            <h1>Manage Appointments</h1>

            <p>
              View, update and manage all clinic
              appointments.
            </p>
          </div>

          <div className="am-header-actions">

            <button
              className="am-refresh-btn"
              onClick={loadAppointments}
            >
              <FaRotate />
              Refresh
            </button>

            <button
              className="am-back-btn"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <FaArrowLeft />
              Dashboard
            </button>

          </div>

        </div>

        {/* STATS */}
        <div className="am-stats">

          <div className="am-stat-card">

            <div className="am-stat-icon total">
              <FaCalendarCheck />
            </div>

            <div>
              <span>Total Appointments</span>

              <strong>
                {totalAppointments}
              </strong>
            </div>

          </div>

          <div className="am-stat-card">

            <div className="am-stat-icon confirmed">
              <FaCheck />
            </div>

            <div>
              <span>Confirmed</span>

              <strong>
                {confirmedAppointments}
              </strong>
            </div>

          </div>

          <div className="am-stat-card">

            <div className="am-stat-icon checked">
              <FaClock />
            </div>

            <div>
              <span>Checked-In</span>

              <strong>
                {checkedInAppointments}
              </strong>
            </div>

          </div>

          <div className="am-stat-card">

            <div className="am-stat-icon completed">
              <FaCheck />
            </div>

            <div>
              <span>Completed</span>

              <strong>
                {completedAppointments}
              </strong>
            </div>

          </div>

        </div>

        {/* FILTERS */}
        <div className="am-filters">

          <div className="am-search">

            <FaMagnifyingGlass />

            <input
              type="text"
              placeholder="Search patient, doctor, phone, email..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Status
            </option>

            <option value="Confirmed">
              Confirmed
            </option>

            <option value="Checked-In">
              Checked-In
            </option>

            <option value="In-Consultation">
              In Consultation
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Checked-Out">
              Checked-Out
            </option>

            <option value="Cancelled">
              Cancelled
            </option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
          />

          {(search ||
            dateFilter ||
            statusFilter !== "All") && (

            <button
              className="am-clear-btn"
              onClick={() => {
                setSearch("");
                setDateFilter("");
                setStatusFilter("All");
              }}
            >
              <FaXmark />
              Clear
            </button>

          )}

        </div>

        {/* APPOINTMENT LIST */}

        {loading ? (

          <div className="am-empty">

            <div className="am-loader"></div>

            <p>
              Loading appointments...
            </p>

          </div>

        ) : filteredAppointments.length === 0 ? (

          <div className="am-empty">

            <FaCalendarCheck />

            <h3>
              No appointments found
            </h3>

            <p>
              There are no appointments matching
              your search or filters.
            </p>

            <button
              onClick={() =>
                navigate("/appointment")
              }
            >
              Book Appointment
            </button>

          </div>

        ) : (

          <div className="am-list">

            {filteredAppointments.map(
              (appointment) => (

                <div
                  className="am-appointment-card"
                  key={appointment._id}
                >

                  {/* CARD TOP */}

                  <div className="am-card-top">

                    <div className="am-date-box">

                      <FaCalendarCheck />

                      <div>

                        <strong>
                          {formatDate(
                            appointment.date
                          )}
                        </strong>

                        <span>
                          {appointment.timeSlot ||
                            "Time not set"}
                        </span>

                      </div>

                    </div>

                    <span
                      className={`am-status ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status ||
                        "Confirmed"}
                    </span>

                  </div>

                  {/* CARD BODY */}

                  <div className="am-card-body">

                    {/* PATIENT */}

                    <div className="am-info-section">

                      <h3>
                        <FaUser />
                        Patient
                      </h3>

                      <strong>
                        {getPatientName(
                          appointment
                        )}
                      </strong>

                      <p>
                        <FaPhone />
                        {getPatientPhone(
                          appointment
                        )}
                      </p>

                      <p>
                        <FaEnvelope />
                        {getPatientEmail(
                          appointment
                        )}
                      </p>

                    </div>

                    {/* DOCTOR */}

                    <div className="am-info-section">

                      <h3>
                        <FaUserDoctor />
                        Doctor
                      </h3>

                      <strong>
                        {getDoctorName(
                          appointment
                        )}
                      </strong>

                      <p>
                        <span className="am-label">
                          Concern:
                        </span>{" "}

                        {appointment.concern ||
                          "General Dermatology Consultation"}
                      </p>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="am-card-actions">

                    {appointment.status ===
                      "Confirmed" && (

                      <button
                        className="am-action check-in"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "Checked-In"
                          )
                        }
                      >
                        <FaCheck />
                        Check-In
                      </button>

                    )}

                    {appointment.status ===
                      "Checked-In" && (

                      <button
                        className="am-action consultation"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "In-Consultation"
                          )
                        }
                      >
                        <FaClock />
                        Start Consultation
                      </button>

                    )}

                    {appointment.status ===
                      "In-Consultation" && (

                      <button
                        className="am-action complete"
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "Completed"
                          )
                        }
                      >
                        <FaCheck />
                        Complete
                      </button>

                    )}

                    {appointment.status !==
                      "Cancelled" &&
                      appointment.status !==
                        "Completed" &&
                      appointment.status !==
                        "Checked-Out" && (

                      <button
                        className="am-action cancel"
                        onClick={() =>
                          cancelAppointment(
                            appointment._id
                          )
                        }
                      >
                        <FaXmark />
                        Cancel
                      </button>

                    )}

                    {appointment.status ===
                      "Completed" && (

                      <span className="am-completed-text">
                        <FaCheck />
                        Appointment Completed
                      </span>

                    )}

                    {appointment.status ===
                      "Cancelled" && (

                      <span className="am-cancelled-text">
                        <FaXmark />
                        Appointment Cancelled
                      </span>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

        {/* INFO CARD */}

        <div className="am-info-card">

          <FaClock />

          <div>

            <strong>
              Appointment workflow
            </strong>

            <p>
              Confirmed → Checked-In →
              In Consultation → Completed
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default AppointmentManagement;