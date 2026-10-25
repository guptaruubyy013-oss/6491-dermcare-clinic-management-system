import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUserDoctor,
  FaCalendarCheck,
  FaClock,
  FaCircleCheck,
  FaUsers,
  FaArrowRight,
  FaRotate,
  FaFilePrescription,
  FaXmark,
  FaPlus,
  FaTrash,
  FaNotesMedical,
  FaImage,
} from "react-icons/fa6";

import API from "../../api/axios";
import { clinicProducts } from "../Products/Products";

import "./DoctorDashboard.css";

function DoctorDashboard() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("dermcare_user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  const userId =
    user?._id ||
    user?.id ||
    user?.userId ||
    "";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [doctorId, setDoctorId] = useState("");

  // ==========================================
  // PRESCRIPTION STATES
  // ==========================================

  const [showPrescriptionModal, setShowPrescriptionModal] =
    useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [prescriptionLoading, setPrescriptionLoading] =
    useState(false);

  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    notes: "",
    medicines: [
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ],
  });

  // ==========================================
  // TREATMENT STATES
  // ==========================================

  const [showTreatmentModal, setShowTreatmentModal] =
    useState(false);

  const [treatmentLoading, setTreatmentLoading] =
    useState(false);

  const [treatmentForm, setTreatmentForm] = useState({
    treatmentType: "",
    sessionNumber: 1,
    diagnosis: "",
    procedureNotes: "",
    nextFollowUpDate: "",
    medicines: [
      {
        medicineName: "",
        dosage: "",
        duration: "",
      },
    ],
  });

  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);

  // ==========================================
  // LOAD DOCTOR APPOINTMENTS
  // ==========================================

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/appointments", {
        params: {
          doctorId: userId,
        },
      });

      const data =
        response.data?.appointments ||
        response.data ||
        [];

      const appointmentList =
        Array.isArray(data) ? data : [];

      setAppointments(appointmentList);

      let foundDoctorId = "";

      for (const appointment of appointmentList) {
        if (appointment?.doctor) {
          if (
            typeof appointment.doctor === "object" &&
            appointment.doctor._id
          ) {
            foundDoctorId = appointment.doctor._id;
            break;
          }

          if (
            typeof appointment.doctor === "string"
          ) {
            foundDoctorId = appointment.doctor;
            break;
          }
        }
      }

      if (foundDoctorId) {
        setDoctorId(foundDoctorId);
      } else {
        setDoctorId(userId);
      }
    } catch (err) {
      console.error(
        "Doctor appointments error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadAppointments();
    } else {
      setLoading(false);
      setError(
        "Doctor login information was not found."
      );
    }
  }, [userId]);

  // ==========================================
  // PATIENT HELPERS
  // ==========================================

  // IMPORTANT:
  // This function returns an ID ONLY when
  // appointment.patient belongs to a patient user.
  const getPatientId = (appointment) => {
    const patient = appointment?.patient;

    if (!patient) {
      return "";
    }

    // Populated User object
    if (typeof patient === "object") {
      // If patient is a nested object
      if (
        patient.user &&
        typeof patient.user === "object"
      ) {
        if (
          patient.user.role &&
          patient.user.role !== "patient"
        ) {
          return "";
        }

        return (
          patient.user._id ||
          patient.user.id ||
          ""
        );
      }

      // IMPORTANT:
      // Do not use admin/doctor/receptionist
      // as patient.
      if (
        patient.role &&
        patient.role !== "patient"
      ) {
        return "";
      }

      return (
        patient._id ||
        patient.id ||
        ""
      );
    }

    // If backend only returned ID,
    // return it for now.
    return patient;
  };

  const getPatientName = (appointment) => {
    const patient = appointment?.patient;

    if (!patient) {
      return "Unknown Patient";
    }

    if (typeof patient === "object") {
      if (
        patient.user &&
        typeof patient.user === "object"
      ) {
        return (
          patient.user.name ||
          patient.user.fullName ||
          "Unknown Patient"
        );
      }

      return (
        patient.name ||
        patient.fullName ||
        "Unknown Patient"
      );
    }

    return (
      appointment?.patientName ||
      "Patient"
    );
  };

  const getPatientPhone = (appointment) => {
    const patient = appointment?.patient;

    if (
      patient &&
      typeof patient === "object"
    ) {
      if (
        patient.user &&
        typeof patient.user === "object"
      ) {
        return patient.user.phone || "";
      }

      return patient.phone || "";
    }

    return appointment?.phone || "";
  };

  const getDoctorProfileId = (appointment) => {
    if (
      appointment?.doctor &&
      typeof appointment.doctor === "object"
    ) {
      return (
        appointment.doctor._id ||
        appointment.doctor.id ||
        ""
      );
    }

    if (
      appointment?.doctor &&
      typeof appointment.doctor === "string"
    ) {
      return appointment.doctor;
    }

    return doctorId || userId;
  };

  const getAppointmentId = (appointment) => {
    return (
      appointment?._id ||
      appointment?.id ||
      ""
    );
  };

  const getAppointmentDate = (appointment) => {
    return (
      appointment?.date ||
      appointment?.appointmentDate ||
      ""
    );
  };

  const getAppointmentTime = (appointment) => {
    return (
      appointment?.timeSlot ||
      appointment?.time ||
      appointment?.appointmentTime ||
      ""
    );
  };

  const getConcern = (appointment) => {
    return (
      appointment?.concern ||
      appointment?.reason ||
      appointment?.problem ||
      "General Consultation"
    );
  };

  const getStatus = (appointment) => {
    return appointment?.status || "Confirmed";
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const isToday = (date) => {
    if (!date) {
      return false;
    }

    const appointmentDate = new Date(date);
    const today = new Date();

    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  };

  // ==========================================
  // UPDATE APPOINTMENT STATUS
  // ==========================================

  const updateAppointmentStatus = async (
    appointment,
    newStatus
  ) => {
    const id = getAppointmentId(appointment);

    if (!id) {
      return;
    }

    try {
      await API.put(
        `/appointments/${id}`,
        {
          status: newStatus,
        }
      );

      setAppointments((prev) =>
        prev.map((item) =>
          getAppointmentId(item) === id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to update appointment status."
      );
    }
  };

  // ==========================================
  // PRESCRIPTION
  // ==========================================

  const openPrescription = (appointment) => {
    setSelectedAppointment(appointment);

    setPrescriptionForm({
      diagnosis: getConcern(appointment),
      notes: "",
      medicines: [
        {
          medicineName: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    });

    setShowPrescriptionModal(true);
  };

  const closePrescription = () => {
    if (prescriptionLoading) {
      return;
    }

    setShowPrescriptionModal(false);
    setSelectedAppointment(null);

    setPrescriptionForm({
      diagnosis: "",
      notes: "",
      medicines: [
        {
          medicineName: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    });
  };

  const handlePrescriptionChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setPrescriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMedicineChange = (
    index,
    field,
    value
  ) => {
    setPrescriptionForm((prev) => {
      const medicines = [
        ...prev.medicines,
      ];

      medicines[index] = {
        ...medicines[index],
        [field]: value,
      };

      return {
        ...prev,
        medicines,
      };
    });
  };

  const addMedicine = () => {
    setPrescriptionForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicineName: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    }));
  };

  const removeMedicine = (index) => {
    setPrescriptionForm((prev) => {
      if (prev.medicines.length === 1) {
        return prev;
      }

      return {
        ...prev,
        medicines:
          prev.medicines.filter(
            (_, medicineIndex) =>
              medicineIndex !== index
          ),
      };
    });
  };

  const createPrescription = async (e) => {
    e.preventDefault();

    if (!selectedAppointment) {
      alert("Please select an appointment.");
      return;
    }

    const patientId =
      getPatientId(selectedAppointment);

    const selectedDoctorId =
      getDoctorProfileId(selectedAppointment);

    if (!patientId) {
      alert(
        "This appointment does not contain a valid patient. Please book the appointment using a patient account."
      );
      return;
    }

    if (!selectedDoctorId) {
      alert(
        "Doctor information is missing."
      );
      return;
    }

    if (!prescriptionForm.diagnosis.trim()) {
      alert("Please enter diagnosis.");
      return;
    }

    const validMedicines =
      prescriptionForm.medicines.filter(
        (medicine) =>
          medicine.medicineName.trim() &&
          medicine.dosage.trim() &&
          medicine.frequency.trim() &&
          medicine.duration.trim()
      );

    if (validMedicines.length === 0) {
      alert(
        "Please enter at least one complete medicine."
      );
      return;
    }

    try {
      setPrescriptionLoading(true);

      const payload = {
        patient: patientId,
        doctor: selectedDoctorId,
        appointment:
          getAppointmentId(
            selectedAppointment
          ),
        diagnosis:
          prescriptionForm.diagnosis.trim(),
        medicines: validMedicines,
        notes:
          prescriptionForm.notes.trim(),
      };

      await API.post(
        "/prescriptions",
        payload
      );

      alert(
        "Prescription created successfully."
      );

      closePrescription();
    } catch (err) {
      console.error(
        "Create prescription error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to create prescription."
      );
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // ==========================================
  // TREATMENT
  // ==========================================

  const openTreatment = (appointment) => {
    const patientId =
      getPatientId(appointment);

    if (!patientId) {
      alert(
        "This appointment is not linked to a valid patient account. Please create/book the appointment using a patient account."
      );
      return;
    }

    setSelectedAppointment(appointment);

    setTreatmentForm({
      treatmentType: "",
      sessionNumber: 1,
      diagnosis: "",
      procedureNotes: "",
      nextFollowUpDate: "",
      medicines: [
        {
          medicineName: "",
          dosage: "",
          duration: "",
        },
      ],
    });

    setBeforeImages([]);
    setAfterImages([]);

    setShowTreatmentModal(true);
  };

  const closeTreatment = () => {
    if (treatmentLoading) {
      return;
    }

    setShowTreatmentModal(false);
    setSelectedAppointment(null);

    setTreatmentForm({
      treatmentType: "",
      sessionNumber: 1,
      diagnosis: "",
      procedureNotes: "",
      nextFollowUpDate: "",
      medicines: [
        {
          medicineName: "",
          dosage: "",
          duration: "",
        },
      ],
    });

    setBeforeImages([]);
    setAfterImages([]);
  };

  const handleTreatmentChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setTreatmentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTreatmentMedicineChange = (
    index,
    field,
    value
  ) => {
    setTreatmentForm((prev) => {
      const medicines = [
        ...prev.medicines,
      ];

      medicines[index] = {
        ...medicines[index],
        [field]: value,
      };

      return {
        ...prev,
        medicines,
      };
    });
  };

  const addTreatmentMedicine = () => {
    setTreatmentForm((prev) => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        {
          medicineName: "",
          dosage: "",
          duration: "",
        },
      ],
    }));
  };

  const removeTreatmentMedicine = (
    index
  ) => {
    setTreatmentForm((prev) => {
      if (prev.medicines.length === 1) {
        return prev;
      }

      return {
        ...prev,
        medicines:
          prev.medicines.filter(
            (_, medicineIndex) =>
              medicineIndex !== index
          ),
      };
    });
  };

  const createTreatment = async (e) => {
    e.preventDefault();

    if (!selectedAppointment) {
      alert("Please select an appointment.");
      return;
    }

    const patientId =
      getPatientId(selectedAppointment);

    const selectedDoctorId =
      getDoctorProfileId(
        selectedAppointment
      );

    const appointmentId =
      getAppointmentId(
        selectedAppointment
      );

    if (!patientId) {
      alert(
        "This appointment is not linked to a valid patient account."
      );
      return;
    }

    if (!selectedDoctorId) {
      alert(
        "Doctor information is missing."
      );
      return;
    }

    if (!appointmentId) {
      alert(
        "Appointment information is missing."
      );
      return;
    }

    if (
      !treatmentForm.treatmentType.trim()
    ) {
      alert(
        "Please enter treatment type."
      );
      return;
    }

    if (
      !treatmentForm.diagnosis.trim()
    ) {
      alert(
        "Please enter diagnosis."
      );
      return;
    }

    try {
      setTreatmentLoading(true);

      const formData =
        new FormData();

      formData.append(
        "patient",
        patientId
      );

      formData.append(
        "doctor",
        selectedDoctorId
      );

      formData.append(
        "appointment",
        appointmentId
      );

      formData.append(
        "treatmentType",
        treatmentForm.treatmentType.trim()
      );

      formData.append(
        "sessionNumber",
        treatmentForm.sessionNumber
      );

      formData.append(
        "diagnosis",
        treatmentForm.diagnosis.trim()
      );

      formData.append(
        "procedureNotes",
        treatmentForm.procedureNotes.trim()
      );

      if (
        treatmentForm.nextFollowUpDate
      ) {
        formData.append(
          "nextFollowUpDate",
          treatmentForm.nextFollowUpDate
        );
      }

      const validMedicines =
        treatmentForm.medicines.filter(
          (medicine) =>
            medicine.medicineName.trim() ||
            medicine.dosage.trim() ||
            medicine.duration.trim()
        );

      formData.append(
        "prescriptions",
        JSON.stringify(validMedicines)
      );

      beforeImages.forEach((file) => {
        formData.append(
          "beforeImages",
          file
        );
      });

      afterImages.forEach((file) => {
        formData.append(
          "afterImages",
          file
        );
      });

      await API.post(
        "/treatments",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert(
        "Treatment record saved successfully."
      );

      closeTreatment();
    } catch (err) {
      console.error(
        "Create treatment error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to save treatment."
      );
    } finally {
      setTreatmentLoading(false);
    }
  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const todayAppointments =
    appointments.filter(
      (appointment) =>
        isToday(
          getAppointmentDate(
            appointment
          )
        )
    ).length;

  const pendingAppointments =
    appointments.filter(
      (appointment) => {
        const status =
          getStatus(
            appointment
          ).toLowerCase();

        return (
          status !== "completed" &&
          status !== "cancelled" &&
          status !== "checked-out"
        );
      }
    ).length;

  const completedAppointments =
    appointments.filter(
      (appointment) => {
        const status =
          getStatus(
            appointment
          ).toLowerCase();

        return (
          status === "completed" ||
          status === "checked-out"
        );
      }
    ).length;

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="doctor-dashboard">
      <div className="doctor-dashboard-container">

        <div className="doctor-header">
          <div className="doctor-header-left">
            <div className="doctor-profile-icon">
              <FaUserDoctor />
            </div>

            <div>
              <h1>
                Welcome, Dr.{" "}
                {user?.name || "Doctor"}
              </h1>

              <p>
                Manage your appointments,
                patients and treatments.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={loadAppointments}
            disabled={loading}
          >
            <FaRotate />

            {loading
              ? "Loading..."
              : "Refresh"}
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fff1f2",
              color: "#be123c",
              padding: "14px",
              borderRadius: "10px",
              marginBottom: "20px",
            }}
          >
            {error}
          </div>
        )}

        <div className="doctor-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaCalendarCheck />
            </div>

            <div>
              <span>
                Today's Appointments
              </span>

              <strong>
                {todayAppointments}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaClock />
            </div>

            <div>
              <span>Pending</span>

              <strong>
                {pendingAppointments}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaCircleCheck />
            </div>

            <div>
              <span>Completed</span>

              <strong>
                {completedAppointments}
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaUsers />
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
        </div>

        <section className="appointments-section">
          <div className="section-header">
            <div>
              <h2>My Appointments</h2>

              <p>
                View and manage your scheduled
                patient appointments.
              </p>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                background: "white",
                padding: "50px",
                textAlign: "center",
                borderRadius: "15px",
              }}
            >
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div
              style={{
                background: "white",
                padding: "50px",
                textAlign: "center",
                borderRadius: "15px",
              }}
            >
              <FaCalendarCheck
                style={{
                  fontSize: "40px",
                  color: "#9ca3af",
                  marginBottom: "15px",
                }}
              />

              <h3>No Appointments</h3>

              <p>
                You currently have no
                appointments.
              </p>
            </div>
          ) : (
            <div className="appointment-list">
              {appointments.map(
                (appointment) => {
                  const appointmentId =
                    getAppointmentId(
                      appointment
                    );

                  const patientName =
                    getPatientName(
                      appointment
                    );

                  const patientPhone =
                    getPatientPhone(
                      appointment
                    );

                  const appointmentDate =
                    getAppointmentDate(
                      appointment
                    );

                  const appointmentTime =
                    getAppointmentTime(
                      appointment
                    );

                  const concern =
                    getConcern(
                      appointment
                    );

                  const status =
                    getStatus(
                      appointment
                    );

                  const patientId =
                    getPatientId(
                      appointment
                    );

                  return (
                    <div
                      className="appointment-card"
                      key={appointmentId}
                    >
                      <div className="appointment-card-main">
                        <div className="patient-info">
                          <div className="patient-avatar">
                            {patientName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <h3>
                              {patientName}
                            </h3>

                            {patientPhone && (
                              <p>
                                {patientPhone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="appointment-status-wrapper">
                          <span
                            className={`status-badge ${status
                              .toLowerCase()
                              .replace(
                                /\s+/g,
                                "-"
                              )}`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>

                      <div className="appointment-details">
                        <div className="appointment-detail">
                          <span>Date</span>

                          <strong>
                            {formatDate(
                              appointmentDate
                            )}
                          </strong>
                        </div>

                        <div className="appointment-detail">
                          <span>Time</span>

                          <strong>
                            {appointmentTime ||
                              "-"}
                          </strong>
                        </div>

                        <div className="appointment-detail">
                          <span>Concern</span>

                          <strong>
                            {concern}
                          </strong>
                        </div>
                      </div>

                      <div className="appointment-card-footer">
                        <div className="status-control">
                          <label>
                            Update Status
                          </label>

                          <select
                            value={status}
                            onChange={(e) =>
                              updateAppointmentStatus(
                                appointment,
                                e.target.value
                              )
                            }
                          >
                            <option value="Confirmed">
                              Confirmed
                            </option>

                            <option value="Checked-In">
                              Checked-In
                            </option>

                            <option value="In-Consultation">
                              In-Consultation
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
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <button
                            type="button"
                            className="doctor-action-button"
                            onClick={() =>
                              openTreatment(
                                appointment
                              )
                            }
                            disabled={!patientId}
                            title={
                              !patientId
                                ? "This appointment is not linked to a patient account"
                                : "Add treatment"
                            }
                          >
                            <FaNotesMedical />
                            Add Treatment
                          </button>

                          <button
                            type="button"
                            className="doctor-action-button"
                            onClick={() =>
                              navigate(
                                `/treatments/patient/${patientId}`
                              )
                            }
                            disabled={!patientId}
                          >
                            Treatment History
                            <FaArrowRight />
                          </button>

                          <button
                            type="button"
                            className="doctor-action-button"
                            onClick={() =>
                              openPrescription(
                                appointment
                              )
                            }
                            disabled={!patientId}
                          >
                            <FaFilePrescription />
                            Create Prescription
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        <section className="doctor-quick-section">
          <div className="section-header">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Quickly access your doctor
                management tools.
              </p>
            </div>
          </div>

          <div className="quick-action-grid">
            <button
              type="button"
              className="quick-action-card"
              onClick={() =>
                navigate(
                  "/patient-records"
                )
              }
            >
              <div className="quick-action-icon">
                <FaUsers />
              </div>

              <div>
                <h3>Patient Records</h3>

                <p>
                  View patient information
                  and medical history.
                </p>
              </div>

              <FaArrowRight className="quick-arrow" />
            </button>

            <button
              type="button"
              className="quick-action-card"
              onClick={() =>
                navigate(
                  "/prescriptions"
                )
              }
            >
              <div className="quick-action-icon">
                <FaFilePrescription />
              </div>

              <div>
                <h3>Prescriptions</h3>

                <p>
                  View and manage patient
                  prescriptions.
                </p>
              </div>

              <FaArrowRight className="quick-arrow" />
            </button>

            <button
              type="button"
              className="quick-action-card"
              onClick={() => {
                const firstPatient =
                  appointments.find(
                    (appointment) =>
                      getPatientId(
                        appointment
                      )
                  );

                const patientId =
                  firstPatient
                    ? getPatientId(
                        firstPatient
                      )
                    : "";

                if (patientId) {
                  navigate(
                    `/treatments/patient/${patientId}`
                  );
                } else {
                  alert(
                    "No valid patient appointment found."
                  );
                }
              }}
            >
              <div className="quick-action-icon">
                <FaCircleCheck />
              </div>

              <div>
                <h3>
                  Treatment Tracking
                </h3>

                <p>
                  Track patient treatments
                  and follow-ups.
                </p>
              </div>

              <FaArrowRight className="quick-arrow" />
            </button>
          </div>
        </section>

        <div className="doctor-dashboard-footer">
          <p>
            DermCare Doctor Dashboard
          </p>
        </div>
      </div>

      {/* ==========================================
          PRESCRIPTION MODAL
          ========================================== */}

      {showPrescriptionModal &&
        selectedAppointment && (
          <div
            className="prescription-modal-overlay"
            onClick={closePrescription}
          >
            <div
              className="prescription-create-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="prescription-create-header">
                <div>
                  <div className="prescription-create-title">
                    <FaFilePrescription />

                    <h2>
                      Create Prescription
                    </h2>
                  </div>

                  <p>
                    Patient:{" "}
                    <strong>
                      {getPatientName(
                        selectedAppointment
                      )}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="prescription-close-button"
                  onClick={
                    closePrescription
                  }
                  disabled={
                    prescriptionLoading
                  }
                >
                  <FaXmark />
                </button>
              </div>

              <form
                onSubmit={
                  createPrescription
                }
              >
                <div className="prescription-create-body">
                  <div className="prescription-form-group">
                    <label>
                      Diagnosis *
                    </label>

                    <input
                      type="text"
                      name="diagnosis"
                      value={
                        prescriptionForm.diagnosis
                      }
                      onChange={
                        handlePrescriptionChange
                      }
                      placeholder="Enter diagnosis"
                      required
                    />
                  </div>

                  <div className="medicine-form-section">
                    <div className="medicine-section-header">
                      <div>
                        <h3>Medicines</h3>

                        <p>
                          Add medicines prescribed
                          to the patient.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="add-medicine-button"
                        onClick={
                          addMedicine
                        }
                      >
                        <FaPlus />
                        Add Medicine
                      </button>
                    </div>

                    {prescriptionForm.medicines.map(
                      (
                        medicine,
                        index
                      ) => (
                        <div
                          className="medicine-form-card"
                          key={index}
                        >
                          <div className="medicine-form-number">
                            {index + 1}
                          </div>

                          <div className="medicine-form-fields">
                            <div className="prescription-form-group">
                              <label>
                                Medicine Name *
                              </label>

                              <select
                                value={
                                  medicine.medicineName
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleMedicineChange(
                                    index,
                                    "medicineName",
                                    event.target.value
                                  )
                                }
                                required
                                style={{
                                  width: "100%",
                                  height: "42px",
                                  border:
                                    "1px solid #d1d5db",
                                  borderRadius:
                                    "9px",
                                  padding:
                                    "0 10px",
                                  fontSize:
                                    "12px",
                                  background:
                                    "#ffffff",
                                }}
                              >
                                <option value="">
                                  Select clinic product
                                </option>

                                {clinicProducts.map(
                                  (product) => (
                                    <option
                                      key={
                                        product.id
                                      }
                                      value={
                                        product.name
                                      }
                                    >
                                      {
                                        product.name
                                      }{" "}
                                      — ₹
                                      {
                                        product.price
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            <div className="medicine-three-fields">
                              <div className="prescription-form-group">
                                <label>
                                  Dosage *
                                </label>

                                <input
                                  type="text"
                                  value={
                                    medicine.dosage
                                  }
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "dosage",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. 1%"
                                  required
                                />
                              </div>

                              <div className="prescription-form-group">
                                <label>
                                  Frequency *
                                </label>

                                <input
                                  type="text"
                                  value={
                                    medicine.frequency
                                  }
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "frequency",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Once daily"
                                  required
                                />
                              </div>

                              <div className="prescription-form-group">
                                <label>
                                  Duration *
                                </label>

                                <input
                                  type="text"
                                  value={
                                    medicine.duration
                                  }
                                  onChange={(e) =>
                                    handleMedicineChange(
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. 14 Days"
                                  required
                                />
                              </div>
                            </div>

                            <div className="prescription-form-group">
                              <label>
                                Instructions
                              </label>

                              <input
                                type="text"
                                value={
                                  medicine.instructions
                                }
                                onChange={(e) =>
                                  handleMedicineChange(
                                    index,
                                    "instructions",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Apply at night"
                              />
                            </div>
                          </div>

                          {prescriptionForm
                            .medicines.length >
                            1 && (
                            <button
                              type="button"
                              className="remove-medicine-button"
                              onClick={() =>
                                removeMedicine(
                                  index
                                )
                              }
                              title="Remove medicine"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div className="prescription-form-group">
                    <label>
                      Doctor's Notes
                    </label>

                    <textarea
                      name="notes"
                      value={
                        prescriptionForm.notes
                      }
                      onChange={
                        handlePrescriptionChange
                      }
                      placeholder="Enter additional instructions or notes..."
                      rows="4"
                    />
                  </div>
                </div>

                <div className="prescription-create-footer">
                  <button
                    type="button"
                    className="prescription-cancel-button"
                    onClick={
                      closePrescription
                    }
                    disabled={
                      prescriptionLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="prescription-save-button"
                    disabled={
                      prescriptionLoading
                    }
                  >
                    {prescriptionLoading
                      ? "Creating..."
                      : "Create Prescription"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {/* ==========================================
          TREATMENT MODAL
          ========================================== */}

      {showTreatmentModal &&
        selectedAppointment && (
          <div
            className="prescription-modal-overlay"
            onClick={closeTreatment}
          >
            <div
              className="prescription-create-modal treatment-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <div className="prescription-create-header">
                <div>
                  <div className="prescription-create-title">
                    <FaNotesMedical />

                    <h2>
                      Add Treatment
                    </h2>
                  </div>

                  <p>
                    Patient:{" "}
                    <strong>
                      {getPatientName(
                        selectedAppointment
                      )}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  className="prescription-close-button"
                  onClick={
                    closeTreatment
                  }
                  disabled={
                    treatmentLoading
                  }
                >
                  <FaXmark />
                </button>
              </div>

              <form
                onSubmit={
                  createTreatment
                }
              >
                <div className="prescription-create-body">
                  <div className="prescription-form-group">
                    <label>
                      Treatment Type *
                    </label>

                    <input
                      type="text"
                      name="treatmentType"
                      value={
                        treatmentForm.treatmentType
                      }
                      onChange={
                        handleTreatmentChange
                      }
                      placeholder="e.g. Acne Treatment, Hair PRP, Chemical Peel"
                      required
                    />
                  </div>

                  <div className="medicine-three-fields">
                    <div className="prescription-form-group">
                      <label>
                        Session Number
                      </label>

                      <input
                        type="number"
                        name="sessionNumber"
                        min="1"
                        value={
                          treatmentForm.sessionNumber
                        }
                        onChange={
                          handleTreatmentChange
                        }
                      />
                    </div>

                    <div className="prescription-form-group">
                      <label>
                        Next Follow-Up
                      </label>

                      <input
                        type="date"
                        name="nextFollowUpDate"
                        value={
                          treatmentForm.nextFollowUpDate
                        }
                        onChange={
                          handleTreatmentChange
                        }
                      />
                    </div>
                  </div>

                  <div className="prescription-form-group">
                    <label>
                      Diagnosis *
                    </label>

                    <textarea
                      name="diagnosis"
                      value={
                        treatmentForm.diagnosis
                      }
                      onChange={
                        handleTreatmentChange
                      }
                      placeholder="Enter patient diagnosis..."
                      rows="3"
                      required
                    />
                  </div>

                  <div className="prescription-form-group">
                    <label>
                      Procedure / Clinical Notes
                    </label>

                    <textarea
                      name="procedureNotes"
                      value={
                        treatmentForm.procedureNotes
                      }
                      onChange={
                        handleTreatmentChange
                      }
                      placeholder="Enter treatment procedure and clinical notes..."
                      rows="4"
                    />
                  </div>

                  <div className="prescription-form-group">
                    <label>
                      <FaImage />
                      Before Images
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setBeforeImages(
                          Array.from(
                            e.target.files
                          )
                        )
                      }
                    />

                    {beforeImages.length >
                      0 && (
                      <small>
                        {
                          beforeImages.length
                        }{" "}
                        image(s) selected
                      </small>
                    )}
                  </div>

                  <div className="prescription-form-group">
                    <label>
                      <FaImage />
                      After Images
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setAfterImages(
                          Array.from(
                            e.target.files
                          )
                        )
                      }
                    />

                    {afterImages.length >
                      0 && (
                      <small>
                        {
                          afterImages.length
                        }{" "}
                        image(s) selected
                      </small>
                    )}
                  </div>

                  <div className="medicine-form-section">
                    <div className="medicine-section-header">
                      <div>
                        <h3>
                          Treatment Medicines
                        </h3>

                        <p>
                          Add medicines related
                          to this treatment.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="add-medicine-button"
                        onClick={
                          addTreatmentMedicine
                        }
                      >
                        <FaPlus />
                        Add Medicine
                      </button>
                    </div>

                    {treatmentForm.medicines.map(
                      (
                        medicine,
                        index
                      ) => (
                        <div
                          className="medicine-form-card"
                          key={index}
                        >
                          <div className="medicine-form-number">
                            {index + 1}
                          </div>

                          <div className="medicine-form-fields">
                            <div className="prescription-form-group">
                              <label>
                                Medicine Name
                              </label>

                              <input
                                type="text"
                                value={
                                  medicine.medicineName
                                }
                                onChange={(e) =>
                                  handleTreatmentMedicineChange(
                                    index,
                                    "medicineName",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Adapalene"
                              />
                            </div>

                            <div className="medicine-three-fields">
                              <div className="prescription-form-group">
                                <label>
                                  Dosage
                                </label>

                                <input
                                  type="text"
                                  value={
                                    medicine.dosage
                                  }
                                  onChange={(e) =>
                                    handleTreatmentMedicineChange(
                                      index,
                                      "dosage",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. 0.1%"
                                />
                              </div>

                              <div className="prescription-form-group">
                                <label>
                                  Duration
                                </label>

                                <input
                                  type="text"
                                  value={
                                    medicine.duration
                                  }
                                  onChange={(e) =>
                                    handleTreatmentMedicineChange(
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. 30 Days"
                                />
                              </div>
                            </div>
                          </div>

                          {treatmentForm
                            .medicines.length >
                            1 && (
                            <button
                              type="button"
                              className="remove-medicine-button"
                              onClick={() =>
                                removeTreatmentMedicine(
                                  index
                                )
                              }
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="prescription-create-footer">
                  <button
                    type="button"
                    className="prescription-cancel-button"
                    onClick={
                      closeTreatment
                    }
                    disabled={
                      treatmentLoading
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="prescription-save-button"
                    disabled={
                      treatmentLoading
                    }
                  >
                    {treatmentLoading
                      ? "Saving Treatment..."
                      : "Save Treatment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}

export default DoctorDashboard;