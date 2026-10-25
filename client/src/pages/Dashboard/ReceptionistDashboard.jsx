import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaCalendarCheck,
  FaUserPlus,
  FaUserDoctor,
  FaFileInvoiceDollar,
  FaClipboardList,
  FaClock,
  FaHospitalUser,
  FaRotate,
  FaArrowRight,
  FaXmark,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa6";

import API from "../../api/axios";

import "./ReceptionistDashboard.css";

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showDoctorAvailability, setShowDoctorAvailability] =
    useState(false);

  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // ================================
  // FETCH DASHBOARD DATA
  // ================================
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        appointmentsResponse,
        patientsResponse,
        doctorsResponse,
        billsResponse,
      ] = await Promise.all([
        API.get("/appointments"),
        API.get("/admin/patients"),
        API.get("/admin/doctors"),
        API.get("/billing"),
      ]);

      setAppointments(
        appointmentsResponse.data?.appointments || []
      );

      setPatients(
        patientsResponse.data?.patients || []
      );

      setDoctors(
        doctorsResponse.data?.doctors || []
      );

      setBills(
        billsResponse.data?.bills || []
      );
    } catch (error) {
      console.error(
        "Receptionist dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ================================
  // TODAY'S DATE
  // ================================
  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  // ================================
  // DASHBOARD COUNTS
  // ================================
  const todayAppointments =
    appointments.filter(
      (appointment) =>
        appointment.date === todayDate &&
        appointment.status !== "Cancelled"
    );

  const completedToday =
    todayAppointments.filter(
      (appointment) =>
        appointment.status === "Completed" ||
        appointment.status === "Checked-Out"
    );

  const availableDoctors =
    doctors.filter(
      (doctor) =>
        doctor.isAvailable !== false
    );

  const pendingBills =
    bills.filter(
      (bill) =>
        bill.paymentStatus !== "Paid" &&
        bill.status !== "Paid"
    );

  // ================================
  // QUICK ACTIONS
  // ================================
  const quickActions = [
    {
      title: "Patient Management",
      description:
        "View and manage registered patient records.",
      icon: <FaHospitalUser />,
      action: () =>
        navigate("/patient-records"),
    },

    {
      title: "Register Patient",
      description:
        "Register a new patient account.",
      icon: <FaUserPlus />,
      action: () =>
        navigate("/register"),
    },

    {
      title: "Appointment Management",
      description:
        "View, manage and update appointments.",
      icon: <FaCalendarCheck />,
      action: () =>
        navigate("/appointment-management"),
    },

    {
      title: "Doctor Availability",
      description:
        "Check doctors, timings and availability.",
      icon: <FaUserDoctor />,
      action: () =>
        setShowDoctorAvailability(true),
    },

    {
      title: "Billing Support",
      description:
        "View bills and help with payment status.",
      icon: <FaFileInvoiceDollar />,
      action: () =>
        navigate("/billing"),
    },
  ];

  // ================================
  // DOCTOR AVAILABILITY
  // ================================
  const openDoctorDetails = (doctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <div className="receptionist-dashboard">

      <div className="receptionist-container">

        {/* ================================
            HEADER
        ================================= */}
        <div className="receptionist-header">

          <div>
            <div className="receptionist-badge">
              RECEPTION DESK
            </div>

            <h1>
              Receptionist Dashboard
            </h1>

            <p>
              Manage patients, appointments,
              doctors and billing support from
              one place.
            </p>
          </div>

          <button
            className="receptionist-refresh-btn"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            <FaRotate
              className={
                loading
                  ? "receptionist-spin"
                  : ""
              }
            />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ================================
            STATISTICS
        ================================= */}
        <div className="receptionist-stats">

          <div className="receptionist-stat-card">

            <div className="receptionist-stat-icon">
              <FaCalendarCheck />
            </div>

            <div>
              <span>
                Today's Appointments
              </span>

              <strong>
                {todayAppointments.length}
              </strong>
            </div>

          </div>


          <div className="receptionist-stat-card">

            <div className="receptionist-stat-icon">
              <FaUsers />
            </div>

            <div>
              <span>
                Registered Patients
              </span>

              <strong>
                {patients.length}
              </strong>
            </div>

          </div>


          <div className="receptionist-stat-card">

            <div className="receptionist-stat-icon">
              <FaUserDoctor />
            </div>

            <div>
              <span>
                Available Doctors
              </span>

              <strong>
                {availableDoctors.length}
              </strong>
            </div>

          </div>


          <div className="receptionist-stat-card">

            <div className="receptionist-stat-icon">
              <FaFileInvoiceDollar />
            </div>

            <div>
              <span>
                Pending Bills
              </span>

              <strong>
                {pendingBills.length}
              </strong>
            </div>

          </div>

        </div>

        {/* ================================
            QUICK ACTIONS
        ================================= */}
        <section className="receptionist-section">

          <div className="receptionist-section-header">

            <div>
              <span>
                DAILY OPERATIONS
              </span>

              <h2>
                Quick Actions
              </h2>
            </div>

            <FaArrowRight />

          </div>


          <div className="receptionist-actions">

            {quickActions.map(
              (action, index) => (

                <button
                  key={index}
                  className="receptionist-action-card"
                  onClick={action.action}
                >

                  <div className="receptionist-action-icon">
                    {action.icon}
                  </div>

                  <div>
                    <h3>
                      {action.title}
                    </h3>

                    <p>
                      {action.description}
                    </p>
                  </div>

                  <FaArrowRight />

                </button>

              )
            )}

          </div>

        </section>

        {/* ================================
            TODAY'S OVERVIEW
        ================================= */}
        <section className="receptionist-section">

          <div className="receptionist-section-header">

            <div>
              <span>
                CLINIC OVERVIEW
              </span>

              <h2>
                Today's Overview
              </h2>
            </div>

          </div>


          <div className="receptionist-overview-grid">

            <div className="receptionist-overview-card">

              <div className="receptionist-overview-icon">
                <FaCalendarCheck />
              </div>

              <div>
                <span>
                  Today's Appointments
                </span>

                <strong>
                  {todayAppointments.length}
                </strong>

                <small>
                  {completedToday.length} completed today
                </small>
              </div>

            </div>


            <div className="receptionist-overview-card">

              <div className="receptionist-overview-icon">
                <FaClock />
              </div>

              <div>
                <span>
                  Pending Appointments
                </span>

                <strong>
                  {
                    todayAppointments.filter(
                      (appointment) =>
                        appointment.status !==
                          "Completed" &&
                        appointment.status !==
                          "Checked-Out"
                    ).length
                  }
                </strong>

                <small>
                  Require receptionist attention
                </small>
              </div>

            </div>


            <div className="receptionist-overview-card">

              <div className="receptionist-overview-icon">
                <FaHospitalUser />
              </div>

              <div>
                <span>
                  Patient Records
                </span>

                <strong>
                  {patients.length}
                </strong>

                <small>
                  Registered patient accounts
                </small>
              </div>

            </div>


            <div className="receptionist-overview-card">

              <div className="receptionist-overview-icon">
                <FaClipboardList />
              </div>

              <div>
                <span>
                  Pending Bills
                </span>

                <strong>
                  {pendingBills.length}
                </strong>

                <small>
                  Payment follow-up required
                </small>
              </div>

            </div>

          </div>

        </section>

        {/* ================================
            PATIENT SERVICE
        ================================= */}
        <section className="receptionist-section">

          <div className="receptionist-section-header">

            <div>
              <span>
                PATIENT SERVICES
              </span>

              <h2>
                Patient Management
              </h2>
            </div>

            <button
              className="receptionist-view-all"
              onClick={() =>
                navigate("/patient-records")
              }
            >
              View All
              <FaArrowRight />
            </button>

          </div>


          <div className="receptionist-patient-list">

            {patients.length === 0 ? (

              <div className="receptionist-empty-state">

                <FaHospitalUser />

                <h3>
                  No patients found
                </h3>

                <p>
                  Patient records will appear here
                  once they are registered.
                </p>

                <button
                  onClick={() =>
                    navigate("/register")
                  }
                >
                  Register Patient
                </button>

              </div>

            ) : (

              patients
                .slice(0, 5)
                .map((patient) => (

                  <div
                    key={patient._id}
                    className="receptionist-patient-item"
                  >

                    <div className="receptionist-patient-avatar">
                      <FaUsers />
                    </div>

                    <div className="receptionist-patient-info">

                      <strong>
                        {patient.name ||
                          "Patient"}
                      </strong>

                      <span>
                        <FaPhone />
                        {patient.phone ||
                          "No phone"}
                      </span>

                    </div>

                    <div className="receptionist-patient-email">

                      <FaEnvelope />

                      {patient.email ||
                        "No email"}

                    </div>

                    <button
                      onClick={() =>
                        navigate(
                          "/patient-records"
                        )
                      }
                      className="receptionist-patient-view"
                    >
                      View
                    </button>

                  </div>

                ))

            )}

          </div>

        </section>

        {/* ================================
            BOTTOM INFORMATION
        ================================= */}
        <div className="receptionist-info-card">

          <div className="receptionist-info-icon">
            <FaUserDoctor />
          </div>

          <div>

            <h3>
              Need to check a doctor's schedule?
            </h3>

            <p>
              Use Doctor Availability to view
              available days, consultation fees
              and time slots.
            </p>

          </div>

          <button
            onClick={() =>
              setShowDoctorAvailability(true)
            }
          >
            Check Availability
            <FaArrowRight />
          </button>

        </div>

      </div>


      {/* ================================
          DOCTOR AVAILABILITY MODAL
      ================================= */}
      {showDoctorAvailability && (

        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            background: "rgba(0,0,0,0.55)",
            zIndex: 9999,
            padding: "20px",
          }}
        >

          <div
            className="bg-white rounded-4 shadow-lg"
            style={{
              width: "100%",
              maxWidth: "950px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >

            {/* Modal Header */}

            <div
              className="d-flex justify-content-between align-items-center"
              style={{
                padding: "22px 25px",
                borderBottom:
                  "1px solid #eee",
              }}
            >

              <div>

                <small
                  style={{
                    color: "#777",
                    fontWeight: "600",
                    letterSpacing: "1px",
                  }}
                >
                  CLINIC SCHEDULE
                </small>

                <h3
                  style={{
                    margin: "4px 0 0",
                    fontWeight: "700",
                  }}
                >
                  Doctor Availability
                </h3>

              </div>

              <button
                onClick={() => {
                  setShowDoctorAvailability(
                    false
                  );
                  setSelectedDoctor(null);
                }}
                style={{
                  border: "none",
                  background: "#f5f5f5",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <FaXmark />
              </button>

            </div>


            <div
              style={{
                padding: "25px",
              }}
            >

              {doctors.length === 0 ? (

                <div
                  style={{
                    textAlign: "center",
                    padding: "50px 20px",
                    color: "#777",
                  }}
                >

                  <FaUserDoctor
                    style={{
                      fontSize: "45px",
                      marginBottom: "15px",
                    }}
                  />

                  <h4>
                    No doctors found
                  </h4>

                  <p>
                    Doctor availability will
                    appear here once doctors
                    are added.
                  </p>

                </div>

              ) : (

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      selectedDoctor
                        ? "1fr 1fr"
                        : "1fr",
                    gap: "20px",
                  }}
                >

                  {/* Doctor List */}

                  <div>

                    <h5
                      style={{
                        fontWeight: "700",
                        marginBottom: "15px",
                      }}
                    >
                      Doctors
                    </h5>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >

                      {doctors.map(
                        (doctor) => (

                          <button
                            key={doctor._id}
                            onClick={() =>
                              setSelectedDoctor(
                                doctor
                              )
                            }
                            style={{
                              border:
                                selectedDoctor?._id ===
                                doctor._id
                                  ? "2px solid #111"
                                  : "1px solid #eee",
                              background:
                                selectedDoctor?._id ===
                                doctor._id
                                  ? "#f8f8f8"
                                  : "#fff",
                              borderRadius: "12px",
                              padding: "15px",
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                alignItems:
                                  "center",
                                gap: "10px",
                              }}
                            >

                              <div>

                                <strong>
                                  {doctor.name ||
                                    "Doctor"}
                                </strong>

                                <div
                                  style={{
                                    fontSize:
                                      "13px",
                                    color:
                                      "#777",
                                    marginTop:
                                      "4px",
                                  }}
                                >
                                  {doctor.specialization ||
                                    doctor.specialty ||
                                    "Dermatologist"}
                                </div>

                              </div>

                              <span
                                style={{
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    "700",
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "20px",
                                  background:
                                    doctor.isAvailable ===
                                    false
                                      ? "#ffe5e5"
                                      : "#e8f8ee",
                                  color:
                                    doctor.isAvailable ===
                                    false
                                      ? "#c62828"
                                      : "#218838",
                                }}
                              >
                                {doctor.isAvailable ===
                                false
                                  ? "Unavailable"
                                  : "Available"}
                              </span>

                            </div>

                          </button>

                        )
                      )}

                    </div>

                  </div>


                  {/* Selected Doctor Details */}

                  {selectedDoctor && (

                    <div
                      style={{
                        border:
                          "1px solid #eee",
                        borderRadius: "15px",
                        padding: "20px",
                        background: "#fafafa",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "14px",
                          marginBottom:
                            "18px",
                        }}
                      >

                        <div
                          style={{
                            width: "55px",
                            height: "55px",
                            borderRadius:
                              "50%",
                            background:
                              "#111",
                            color: "#fff",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontSize:
                              "22px",
                          }}
                        >
                          <FaUserDoctor />
                        </div>

                        <div>

                          <h4
                            style={{
                              margin: 0,
                              fontWeight:
                                "700",
                            }}
                          >
                            {selectedDoctor.name ||
                              "Doctor"}
                          </h4>

                          <p
                            style={{
                              margin:
                                "4px 0 0",
                              color:
                                "#777",
                            }}
                          >
                            {selectedDoctor.specialization ||
                              selectedDoctor.specialty ||
                              "Dermatologist"}
                          </p>

                        </div>

                      </div>


                      <div
                        style={{
                          display: "grid",
                          gap: "10px",
                        }}
                      >

                        <div>
                          <strong>
                            Qualification
                          </strong>

                          <p
                            style={{
                              margin:
                                "3px 0 0",
                              color:
                                "#666",
                            }}
                          >
                            {selectedDoctor.qualification ||
                              selectedDoctor.qualifications ||
                              "Not available"}
                          </p>
                        </div>


                        <div>
                          <strong>
                            Experience
                          </strong>

                          <p
                            style={{
                              margin:
                                "3px 0 0",
                              color:
                                "#666",
                            }}
                          >
                            {selectedDoctor.experience ??
                              selectedDoctor.experienceYears ??
                              0}{" "}
                            years
                          </p>
                        </div>


                        <div>
                          <strong>
                            Consultation Fee
                          </strong>

                          <p
                            style={{
                              margin:
                                "3px 0 0",
                              color:
                                "#666",
                            }}
                          >
                            ₹
                            {selectedDoctor.consultationFee ??
                              0}
                          </p>
                        </div>


                        <div>
                          <strong>
                            Available Days
                          </strong>

                          <p
                            style={{
                              margin:
                                "3px 0 0",
                              color:
                                "#666",
                            }}
                          >
                            {selectedDoctor.availableDays?.length
                              ? selectedDoctor.availableDays.join(
                                  ", "
                                )
                              : "Not specified"}
                          </p>
                        </div>


                        <div>
                          <strong>
                            Time Slots
                          </strong>

                          <p
                            style={{
                              margin:
                                "3px 0 0",
                              color:
                                "#666",
                            }}
                          >
                            {selectedDoctor.timeSlots?.length
                              ? selectedDoctor.timeSlots.join(
                                  ", "
                                )
                              : "Not specified"}
                          </p>
                        </div>


                        <div>
                          <strong>
                            Contact
                          </strong>

                          <p
                            style={{
                              margin:
                                "3px 0 0",
                              color:
                                "#666",
                            }}
                          >
                            <FaEnvelope
                              style={{
                                marginRight:
                                  "6px",
                              }}
                            />

                            {selectedDoctor.email ||
                              "No email"}
                          </p>

                          <p
                            style={{
                              margin:
                                "3px 0 0",
                              color:
                                "#666",
                            }}
                          >
                            <FaPhone
                              style={{
                                marginRight:
                                  "6px",
                              }}
                            />

                            {selectedDoctor.phone ||
                              "No phone"}
                          </p>

                        </div>

                      </div>


                      <div
                        style={{
                          marginTop:
                            "18px",
                          padding:
                            "12px",
                          borderRadius:
                            "10px",
                          background:
                            selectedDoctor.isAvailable ===
                            false
                              ? "#ffecec"
                              : "#eaf8ef",
                          color:
                            selectedDoctor.isAvailable ===
                            false
                              ? "#c62828"
                              : "#218838",
                          fontWeight:
                            "700",
                          textAlign:
                            "center",
                        }}
                      >
                        {selectedDoctor.isAvailable ===
                        false
                          ? "Currently Unavailable"
                          : "Currently Available"}
                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ReceptionistDashboard;