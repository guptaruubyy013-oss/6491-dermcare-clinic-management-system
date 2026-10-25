import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  FaCalendarCheck,
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
  FaUser,
  FaCalendarPlus,
  FaFilePrescription,
  FaNotesMedical,
  FaFileInvoiceDollar,
  FaArrowRight,
  FaRotate,
  FaRightFromBracket,
} from "react-icons/fa6";

import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

import "./PatientDashboard.css";

const PatientDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================================
  // FETCH PATIENT APPOINTMENTS
  // ==================================================

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const patientId =
        user?._id ||
        user?.id ||
        "";

      if (!patientId) {
        setAppointments([]);
        setError(
          "Patient information is not available. Please login again."
        );
        return;
      }

      const response = await API.get(
        "/appointments",
        {
          params: {
            patientId: patientId,
          },
        }
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
    } catch (err) {
      console.error(
        "Patient appointments error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD APPOINTMENTS
  // ==================================================

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  // ==================================================
  // APPOINTMENT FILTERS
  // ==================================================

  const upcomingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Confirmed" ||
        appointment.status === "Checked-In" ||
        appointment.status === "In-Consultation"
    );

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Completed"
    );

  const cancelledAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "Cancelled"
    );

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "dermcare_token"
    );

    localStorage.removeItem(
      "dermcare_user"
    );

    navigate("/login");
  };

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return date;
    }
  };

  // ==================================================
  // OPEN TREATMENT HISTORY
  // ==================================================

  const openTreatmentHistory = () => {
    const patientId =
      user?._id ||
      user?.id ||
      "";

    if (!patientId) {
      alert(
        "Patient information is not available. Please login again."
      );
      return;
    }

    navigate(
      `/treatments/patient/${patientId}`
    );
  };

  // ==================================================
  // RETURN
  // ==================================================

  return (
    <div className="patient-dashboard-page">

      {/* HEADER */}

      <div className="patient-dashboard-header">

        <div>

          <span className="patient-dashboard-label">
            PATIENT PORTAL
          </span>

          <h1>
            Welcome, {user?.name || "Patient"} 👋
          </h1>

          <p>
            Manage your appointments,
            prescriptions and treatment
            progress from one place.
          </p>

        </div>

        <div className="patient-header-actions">

          <button
            type="button"
            className="patient-refresh-btn"
            onClick={fetchAppointments}
            disabled={loading}
          >
            <FaRotate />
            Refresh
          </button>

          <button
            type="button"
            className="patient-logout-btn"
            onClick={handleLogout}
          >
            <FaRightFromBracket />
            Logout
          </button>

        </div>

      </div>

      {/* PATIENT PROFILE */}

      <div className="patient-profile-card">

        <div className="patient-profile-icon">
          <FaUser />
        </div>

        <div className="patient-profile-info">

          <span>PATIENT</span>

          <h2>
            {user?.name || "Patient"}
          </h2>

          <p>
            {user?.email ||
              "Email not available"}
          </p>

          <p>
            {user?.phone ||
              "Phone not available"}
          </p>

        </div>

        <button
          type="button"
          className="patient-profile-btn"
          onClick={() =>
            navigate("/patient-profile")
          }
        >
          View Profile
          <FaArrowRight />
        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="patient-dashboard-error">
          {error}
        </div>
      )}

      {/* STATISTICS */}

      <div className="patient-stats-grid">

        <div className="patient-stat-card">

          <div className="patient-stat-icon blue">
            <FaCalendarCheck />
          </div>

          <div>
            <span>
              Total Appointments
            </span>

            <strong>
              {appointments.length}
            </strong>
          </div>

        </div>

        <div className="patient-stat-card">

          <div className="patient-stat-icon orange">
            <FaClock />
          </div>

          <div>
            <span>
              Upcoming
            </span>

            <strong>
              {upcomingAppointments.length}
            </strong>
          </div>

        </div>

        <div className="patient-stat-card">

          <div className="patient-stat-icon green">
            <FaCircleCheck />
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {completedAppointments.length}
            </strong>
          </div>

        </div>

        <div className="patient-stat-card">

          <div className="patient-stat-icon red">
            <FaCircleXmark />
          </div>

          <div>
            <span>
              Cancelled
            </span>

            <strong>
              {cancelledAppointments.length}
            </strong>
          </div>

        </div>

      </div>

      {/* QUICK ACTIONS */}

      <section className="patient-dashboard-section">

        <div className="patient-section-heading">

          <div>

            <span>
              PATIENT SERVICES
            </span>

            <h2>
              Quick Actions
            </h2>

          </div>

        </div>

        <div className="patient-quick-actions">

          {/* BOOK APPOINTMENT */}

          <button
            type="button"
            className="patient-action-card"
            onClick={() =>
              navigate("/appointment")
            }
          >

            <div className="patient-action-icon">
              <FaCalendarPlus />
            </div>

            <div>

              <h3>
                Book Appointment
              </h3>

              <p>
                Schedule a consultation
                with a dermatologist.
              </p>

            </div>

            <FaArrowRight />

          </button>

          {/* MY APPOINTMENTS */}

          <button
            type="button"
            className="patient-action-card"
            onClick={() =>
              navigate("/my-appointments")
            }
          >

            <div className="patient-action-icon">
              <FaCalendarCheck />
            </div>

            <div>

              <h3>
                My Appointments
              </h3>

              <p>
                View and manage your
                appointments.
              </p>

            </div>

            <FaArrowRight />

          </button>

          {/* PRESCRIPTIONS */}

          <button
            type="button"
            className="patient-action-card"
            onClick={() =>
              navigate("/prescriptions")
            }
          >

            <div className="patient-action-icon">
              <FaFilePrescription />
            </div>

            <div>

              <h3>
                My Prescriptions
              </h3>

              <p>
                View prescriptions issued
                by your doctor.
              </p>

            </div>

            <FaArrowRight />

          </button>

          {/* TREATMENT */}

          <button
            type="button"
            className="patient-action-card"
            onClick={openTreatmentHistory}
          >

            <div className="patient-action-icon">
              <FaNotesMedical />
            </div>

            <div>

              <h3>
                Treatment Progress
              </h3>

              <p>
                Track your treatment history
                and progress.
              </p>

            </div>

            <FaArrowRight />

          </button>

          {/* BILLS */}

          <button
            type="button"
            className="patient-action-card"
            onClick={() =>
              navigate("/billing")
            }
          >

            <div className="patient-action-icon">
              <FaFileInvoiceDollar />
            </div>

            <div>

              <h3>
                My Bills
              </h3>

              <p>
                View invoices and payment
                information.
              </p>

            </div>

            <FaArrowRight />

          </button>

        </div>

      </section>

      {/* UPCOMING APPOINTMENTS */}

      <section className="patient-dashboard-section">

        <div className="patient-section-heading">

          <div>

            <span>
              APPOINTMENTS
            </span>

            <h2>
              Upcoming Appointments
            </h2>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/appointment")
            }
          >
            Book New
            <FaArrowRight />
          </button>

        </div>

        {loading ? (

          <div className="patient-dashboard-empty">
            Loading your appointments...
          </div>

        ) : upcomingAppointments.length === 0 ? (

          <div className="patient-dashboard-empty">

            <FaCalendarCheck />

            <h3>
              No Upcoming Appointments
            </h3>

            <p>
              You currently do not have any
              upcoming appointments.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/appointment")
              }
            >
              Book an Appointment
            </button>

          </div>

        ) : (

          <div className="patient-appointments-list">

            {upcomingAppointments
              .slice(0, 5)
              .map((appointment) => (

                <div
                  className="patient-appointment-card"
                  key={appointment._id}
                >

                  <div className="patient-appointment-date">

                    <FaCalendarCheck />

                    <strong>
                      {formatDate(
                        appointment.date
                      )}
                    </strong>

                    <span>
                      {appointment.timeSlot ||
                        "Time not available"}
                    </span>

                  </div>

                  <div className="patient-appointment-details">

                    <span>
                      DOCTOR
                    </span>

                    <h3>
                      {appointment.doctorName ||
                        appointment.doctor?.name ||
                        "Doctor"}
                    </h3>

                    <p>
                      {appointment.concern ||
                        "General Consultation"}
                    </p>

                  </div>

                  <div
                    className={`patient-appointment-status ${
                      (
                        appointment.status ||
                        "Confirmed"
                      )
                        .toLowerCase()
                        .replace(
                          /[^a-z0-9]+/g,
                          "-"
                        )
                    }`}
                  >
                    {appointment.status ||
                      "Confirmed"}
                  </div>

                </div>

              ))}

          </div>

        )}

      </section>

      {/* RECENT APPOINTMENTS */}

      <section className="patient-dashboard-section">

        <div className="patient-section-heading">

          <div>

            <span>
              HISTORY
            </span>

            <h2>
              Recent Appointments
            </h2>

          </div>

        </div>

        {appointments.length === 0 ? (

          <div className="patient-dashboard-empty small">

            <p>
              No appointment history available.
            </p>

          </div>

        ) : (

          <div className="patient-recent-list">

            {appointments
              .slice(-5)
              .reverse()
              .map((appointment) => (

                <div
                  className="patient-recent-row"
                  key={appointment._id}
                >

                  <div>

                    <strong>
                      {appointment.doctorName ||
                        appointment.doctor?.name ||
                        "Doctor"}
                    </strong>

                    <span>
                      {formatDate(
                        appointment.date
                      )}
                      {" • "}
                      {appointment.timeSlot ||
                        "Time not available"}
                    </span>

                  </div>

                  <span
                    className={`patient-recent-status ${
                      (
                        appointment.status ||
                        ""
                      )
                        .toLowerCase()
                        .replace(
                          /[^a-z0-9]+/g,
                          "-"
                        )
                    }`}
                  >
                    {appointment.status ||
                      "Confirmed"}
                  </span>

                </div>

              ))}

          </div>

        )}

      </section>

      {/* HELP */}

      <div className="patient-dashboard-note">

        <FaNotesMedical />

        <div>

          <strong>
            Need help?
          </strong>

          <p>
            Contact DermCare Clinic for
            appointment assistance or
            treatment-related queries.
          </p>

        </div>

      </div>

    </div>
  );
};

export default PatientDashboard;