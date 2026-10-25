import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "./MyAppointments.css";

const MyAppointments = () => {
  const { user } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  // ==================================================
  // FETCH PATIENT'S APPOINTMENTS
  // ==================================================

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const patientId =
        user?._id ||
        user?.id ||
        "";

      if (!patientId) {
        setErrorMsg(
          "Patient information is not available. Please login again."
        );

        setLoading(false);
        return;
      }

      const response = await API.get(
        `/appointments?patientId=${patientId}`
      );

      const appointmentList =
        response.data?.appointments ||
        response.data ||
        [];

      setAppointments(
        Array.isArray(appointmentList)
          ? appointmentList
          : []
      );

    } catch (error) {
      console.error(
        "Error fetching appointments:",
        error.response?.data ||
          error.message
      );

      setErrorMsg(
        error.response?.data?.message ||
          "Unable to load appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD APPOINTMENTS WHEN PAGE OPENS
  // ==================================================

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  // ==================================================
  // CANCEL APPOINTMENT
  // ==================================================

  const handleCancel = async (appointmentId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?\n\nThis action will mark the appointment as Cancelled."
    );

    if (!confirmCancel) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      setErrorMsg("");
      setSuccessMsg("");

      await API.patch(
        `/appointments/${appointmentId}/cancel`
      );

      setSuccessMsg(
        "Appointment cancelled successfully."
      );

      // Refresh appointments from backend
      await fetchAppointments();

    } catch (error) {
      console.error(
        "Error cancelling appointment:",
        error.response?.data ||
          error.message
      );

      setErrorMsg(
        error.response?.data?.message ||
          "Unable to cancel appointment. Please try again."
      );

    } finally {
      setCancellingId(null);
    }
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==================================================
  // STATUS CLASS
  // ==================================================

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
        return "status-completed";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "status-default";
    }
  };

  // ==================================================
  // CHECK WHETHER APPOINTMENT CAN BE CANCELLED
  // ==================================================

  const canCancel = (status) => {
    return (
      status !== "Cancelled" &&
      status !== "Completed" &&
      status !== "Checked-Out" &&
      status !== "In-Consultation"
    );
  };

  // ==================================================
  // RETURN
  // ==================================================

  return (
    <div className="my-appointments-page">

      {/* ==================================================
          HEADER
          ================================================== */}

      <div className="my-appointments-header">

        <div>

          <div className="page-label">
            PATIENT PORTAL
          </div>

          <h1>
            My Appointments
          </h1>

          <p>
            View and manage your upcoming and previous
            clinic appointments.
          </p>

        </div>

        <Link
          to="/appointment"
          className="new-appointment-btn"
        >
          + Book New Appointment
        </Link>

      </div>

      {/* ==================================================
          SUCCESS MESSAGE
          ================================================== */}

      {successMsg && (
        <div className="appointments-success">
          {successMsg}
        </div>
      )}

      {/* ==================================================
          ERROR MESSAGE
          ================================================== */}

      {errorMsg && (
        <div className="appointments-error">
          {errorMsg}
        </div>
      )}

      {/* ==================================================
          LOADING
          ================================================== */}

      {loading ? (

        <div className="appointments-loading">

          <div className="loading-spinner"></div>

          <p>
            Loading your appointments...
          </p>

        </div>

      ) : appointments.length === 0 ? (

        /* ==================================================
           EMPTY STATE
           ================================================== */

        <div className="appointments-empty">

          <div className="empty-icon">
            📅
          </div>

          <h2>
            No Appointments Yet
          </h2>

          <p>
            You haven't booked any appointments yet.
            Schedule your first consultation with our
            dermatology specialists.
          </p>

          <Link
            to="/appointment"
            className="empty-book-btn"
          >
            Book an Appointment
          </Link>

        </div>

      ) : (

        /* ==================================================
           APPOINTMENT LIST
           ================================================== */

        <div className="appointments-list">

          <div className="appointment-count">

            <span>
              {appointments.length}
            </span>

            {appointments.length === 1
              ? " Appointment"
              : " Appointments"}

          </div>

          {appointments.map((appointment) => {

            const status =
              appointment.status ||
              "Confirmed";

            const doctorName =
              appointment.doctorName ||
              appointment.doctor?.name ||
              "Doctor not assigned";

            const concern =
              appointment.concern ||
              appointment.service ||
              "General Consultation";

            const time =
              appointment.timeSlot ||
              appointment.time ||
              "Time not available";

            const total =
              appointment.totalAmount ??
              0;

            const paymentStatus =
              appointment.paymentStatus ||
              "Unpaid";

            const isCancelling =
              cancellingId ===
              appointment._id;

            return (
              <div
                className={`appointment-card ${
                  status === "Cancelled"
                    ? "cancelled-appointment"
                    : ""
                }`}
                key={appointment._id}
              >

                {/* ------------------------------------------
                    DATE
                    ------------------------------------------ */}

                <div className="appointment-date">

                  <div className="calendar-icon">
                    📅
                  </div>

                  <div>

                    <span>
                      Appointment Date
                    </span>

                    <strong>
                      {formatDate(
                        appointment.date
                      )}
                    </strong>

                  </div>

                </div>

                {/* ------------------------------------------
                    MAIN DETAILS
                    ------------------------------------------ */}

                <div className="appointment-details">

                  <div className="detail-item">

                    <span className="detail-label">
                      Doctor
                    </span>

                    <strong>
                      {doctorName}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Time
                    </span>

                    <strong>
                      🕐 {time}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Concern
                    </span>

                    <strong>
                      {concern}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Appointment ID
                    </span>

                    <strong className="appointment-id">
                      {appointment._id
                        ? appointment._id
                            .slice(-8)
                            .toUpperCase()
                        : "N/A"}
                    </strong>

                  </div>

                </div>

                {/* ------------------------------------------
                    STATUS + PAYMENT
                    ------------------------------------------ */}

                <div className="appointment-status-area">

                  <span
                    className={`appointment-status ${getStatusClass(
                      status
                    )}`}
                  >
                    {status}
                  </span>

                  <div className="payment-info">

                    <span>
                      Payment
                    </span>

                    <strong>
                      {paymentStatus}
                    </strong>

                  </div>

                  <div className="appointment-amount">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {Number(
                        total
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                </div>

                {/* ------------------------------------------
                    ACTIONS
                    ------------------------------------------ */}

                {canCancel(status) && (

                  <div className="appointment-actions">

                    <button
                      type="button"
                      className="cancel-appointment-btn"
                      onClick={() =>
                        handleCancel(
                          appointment._id
                        )
                      }
                      disabled={
                        isCancelling
                      }
                    >
                      {isCancelling
                        ? "Cancelling..."
                        : "Cancel Appointment"}
                    </button>

                  </div>

                )}

                {/* ------------------------------------------
                    CANCELLED MESSAGE
                    ------------------------------------------ */}

                {status === "Cancelled" && (

                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      background: "#fff1f1",
                      color: "#b42318",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    This appointment has been cancelled.
                  </div>

                )}

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default MyAppointments;