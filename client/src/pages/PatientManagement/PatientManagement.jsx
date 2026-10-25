import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaTrash,
  FaArrowLeft,
  FaXmark,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaRotate,
  FaHospitalUser,
} from "react-icons/fa6";

import API from "../../api/axios";

import "./PatientManagement.css";

const PatientManagement = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [editingPatient, setEditingPatient] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    age: "",
    bloodGroup: "Unknown",
    address: "",
    medicalHistory: "",
    allergies: "",
  });

  // ==========================================
  // FETCH PATIENTS
  // ==========================================

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/patients");

      const data =
        response.data?.patients ||
        response.data ||
        [];

      setPatients(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Patient fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load patients."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredPatients =
    patients.filter((patient) => {

      const value =
        search.toLowerCase().trim();

      if (!value) {
        return true;
      }

      return (
        patient.name
          ?.toLowerCase()
          .includes(value) ||
        patient.email
          ?.toLowerCase()
          .includes(value) ||
        patient.phone
          ?.toLowerCase()
          .includes(value)
      );
    });

  // ==========================================
  // FORM
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      gender: "Male",
      age: "",
      bloodGroup: "Unknown",
      address: "",
      medicalHistory: "",
      allergies: "",
    });

    setEditingPatient(null);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (patient) => {
    setEditingPatient(patient);

    setForm({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      gender: patient.gender || "Male",
      age: patient.age || "",
      bloodGroup:
        patient.bloodGroup || "Unknown",
      address: patient.address || "",
      medicalHistory:
        Array.isArray(patient.medicalHistory)
          ? patient.medicalHistory.join(", ")
          : patient.medicalHistory || "",
      allergies:
        Array.isArray(patient.allergies)
          ? patient.allergies.join(", ")
          : patient.allergies || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    resetForm();
  };

  // ==========================================
  // ADD / UPDATE PATIENT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        age: Number(form.age),
        bloodGroup: form.bloodGroup,
        address: form.address.trim(),

        medicalHistory: form.medicalHistory
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        allergies: form.allergies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      if (editingPatient) {
        await API.put(
          `/patients/${editingPatient._id}`,
          payload
        );
      } else {
        await API.post(
          "/patients",
          payload
        );
      }

      closeForm();
      await fetchPatients();

      alert(
        editingPatient
          ? "Patient updated successfully."
          : "Patient registered successfully."
      );
    } catch (err) {
      console.error(
        "Patient save error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to save patient."
      );
    }
  };

  // ==========================================
  // VIEW PATIENT
  // ==========================================

  const openDetails = async (patient) => {
    try {
      const response = await API.get(
        `/patients/${patient._id}`
      );

      const data =
        response.data?.patient ||
        response.data;

      setSelectedPatient(data);
    } catch (err) {
      console.error(
        "Patient details error:",
        err
      );

      setSelectedPatient(patient);
    }

    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedPatient(null);
  };

  // ==========================================
  // DELETE PATIENT
  // ==========================================

  const deletePatient = async (patient) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${patient.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await API.delete(
        `/patients/${patient._id}`
      );

      await fetchPatients();

      alert(
        "Patient deleted successfully."
      );
    } catch (err) {
      console.error(
        "Patient delete error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete patient."
      );
    }
  };

  // ==========================================
  // ARRAY FORMATTER
  // ==========================================

  const formatArray = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0
        ? value.join(", ")
        : "None";
    }

    return value || "None";
  };

  return (
    <div className="patient-management-page">

      <div className="patient-management-container">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="patient-management-header">

          <div>

            <button
              type="button"
              className="patient-back-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <FaArrowLeft />
              Back to Dashboard
            </button>

            <span className="patient-management-label">
              <FaHospitalUser />
              RECEPTIONIST PORTAL
            </span>

            <h1>
              Patient Management
            </h1>

            <p>
              Register, search and manage
              DermCare patient records.
            </p>

          </div>

          <button
            type="button"
            className="patient-add-button"
            onClick={openAddForm}
          >
            <FaPlus />
            Register Patient
          </button>

        </div>

        {/* =====================================
            SEARCH BAR
        ====================================== */}

        <div className="patient-search-card">

          <div className="patient-search-box">

            <FaMagnifyingGlass />

            <input
              type="text"
              placeholder="Search by patient name, email or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                <FaXmark />
              </button>
            )}

          </div>

          <button
            type="button"
            className="patient-refresh-button"
            onClick={fetchPatients}
            disabled={loading}
          >
            <FaRotate />

            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

        {/* =====================================
            ERROR
        ====================================== */}

        {error && (
          <div className="patient-management-error">
            {error}
          </div>
        )}

        {/* =====================================
            PATIENT COUNT
        ====================================== */}

        <div className="patient-list-heading">

          <div>

            <span>
              PATIENT RECORDS
            </span>

            <h2>
              All Patients
            </h2>

          </div>

          <strong>
            {filteredPatients.length} Patients
          </strong>

        </div>

        {/* =====================================
            PATIENT TABLE
        ====================================== */}

        {loading ? (

          <div className="patient-management-empty">

            <FaUsers />

            <h3>
              Loading patients...
            </h3>

            <p>
              Please wait while patient records
              are being loaded.
            </p>

          </div>

        ) : filteredPatients.length === 0 ? (

          <div className="patient-management-empty">

            <FaUsers />

            <h3>
              No Patients Found
            </h3>

            <p>
              {search
                ? "No patient matches your search."
                : "No patient records are available yet."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openAddForm}
              >
                <FaPlus />
                Register First Patient
              </button>
            )}

          </div>

        ) : (

          <div className="patient-table-card">

            <div className="patient-table-wrapper">

              <table className="patient-table">

                <thead>

                  <tr>

                    <th>
                      Patient
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      Gender
                    </th>

                    <th>
                      Age
                    </th>

                    <th>
                      Blood Group
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredPatients.map(
                    (patient) => (

                      <tr
                        key={patient._id}
                      >

                        <td>

                          <div className="patient-name-cell">

                            <div className="patient-avatar">
                              <FaUser />
                            </div>

                            <div>

                              <strong>
                                {patient.name ||
                                  "Patient"}
                              </strong>

                              <span>
                                {patient.email ||
                                  "No email"}
                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <div className="patient-contact-cell">

                            <span>
                              <FaPhone />
                              {patient.phone ||
                                "No phone"}
                            </span>

                            <span>
                              <FaEnvelope />
                              {patient.email ||
                                "No email"}
                            </span>

                          </div>

                        </td>

                        <td>
                          {patient.gender ||
                            "—"}
                        </td>

                        <td>
                          {patient.age ||
                            "—"}
                        </td>

                        <td>

                          <span className="blood-group-badge">
                            {patient.bloodGroup ||
                              "Unknown"}
                          </span>

                        </td>

                        <td>

                          <div className="patient-action-buttons">

                            <button
                              type="button"
                              className="view"
                              title="View Patient"
                              onClick={() =>
                                openDetails(
                                  patient
                                )
                              }
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              className="edit"
                              title="Edit Patient"
                              onClick={() =>
                                openEditForm(
                                  patient
                                )
                              }
                            >
                              <FaPen />
                            </button>

                            <button
                              type="button"
                              className="delete"
                              title="Delete Patient"
                              onClick={() =>
                                deletePatient(
                                  patient
                                )
                              }
                            >
                              <FaTrash />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>


      {/* ==================================================
          ADD / EDIT PATIENT MODAL
      =================================================== */}

      {showForm && (

        <div
          className="patient-modal-overlay"
          onClick={closeForm}
        >

          <div
            className="patient-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="patient-modal-header">

              <div>

                <span>
                  PATIENT INFORMATION
                </span>

                <h2>
                  {editingPatient
                    ? "Edit Patient"
                    : "Register Patient"}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeForm}
              >
                <FaXmark />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="patient-form"
            >

              <div className="patient-form-grid">

                <div className="patient-form-group">

                  <label>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter patient name"
                    required
                  />

                </div>

                <div className="patient-form-group">

                  <label>
                    Phone *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />

                </div>

                <div className="patient-form-group">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />

                </div>

                <div className="patient-form-group">

                  <label>
                    Age *
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="Enter age"
                    min="1"
                    max="120"
                    required
                  />

                </div>

                <div className="patient-form-group">

                  <label>
                    Gender *
                  </label>

                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                <div className="patient-form-group">

                  <label>
                    Blood Group
                  </label>

                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                  >

                    <option value="Unknown">
                      Unknown
                    </option>

                    <option value="A+">
                      A+
                    </option>

                    <option value="A-">
                      A-
                    </option>

                    <option value="B+">
                      B+
                    </option>

                    <option value="B-">
                      B-
                    </option>

                    <option value="AB+">
                      AB+
                    </option>

                    <option value="AB-">
                      AB-
                    </option>

                    <option value="O+">
                      O+
                    </option>

                    <option value="O-">
                      O-
                    </option>

                  </select>

                </div>

                <div className="patient-form-group full">

                  <label>
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Enter patient address"
                    rows="2"
                  />

                </div>

                <div className="patient-form-group full">

                  <label>
                    Medical History
                  </label>

                  <textarea
                    name="medicalHistory"
                    value={form.medicalHistory}
                    onChange={handleChange}
                    placeholder="Example: Acne, Eczema, Previous treatment"
                    rows="3"
                  />

                  <small>
                    Separate multiple entries with commas.
                  </small>

                </div>

                <div className="patient-form-group full">

                  <label>
                    Allergies
                  </label>

                  <textarea
                    name="allergies"
                    value={form.allergies}
                    onChange={handleChange}
                    placeholder="Example: Penicillin, Dust, None"
                    rows="3"
                  />

                  <small>
                    Separate multiple allergies with commas.
                  </small>

                </div>

              </div>

              <div className="patient-form-actions">

                <button
                  type="button"
                  onClick={closeForm}
                  className="cancel"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save"
                >
                  <FaPlus />

                  {editingPatient
                    ? "Update Patient"
                    : "Register Patient"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ==================================================
          PATIENT DETAILS MODAL
      =================================================== */}

      {showDetails &&
        selectedPatient && (

          <div
            className="patient-modal-overlay"
            onClick={closeDetails}
          >

            <div
              className="patient-details-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="patient-modal-header">

                <div>

                  <span>
                    PATIENT PROFILE
                  </span>

                  <h2>
                    Patient Details
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                >
                  <FaXmark />
                </button>

              </div>

              <div className="patient-details-content">

                <div className="patient-details-profile">

                  <div className="patient-details-avatar">
                    <FaUser />
                  </div>

                  <div>

                    <h3>
                      {selectedPatient.name ||
                        "Patient"}
                    </h3>

                    <p>
                      {selectedPatient.email ||
                        "No email available"}
                    </p>

                  </div>

                </div>

                <div className="patient-details-grid">

                  <div>
                    <span>
                      Phone
                    </span>

                    <strong>
                      {selectedPatient.phone ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Email
                    </span>

                    <strong>
                      {selectedPatient.email ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Gender
                    </span>

                    <strong>
                      {selectedPatient.gender ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Age
                    </span>

                    <strong>
                      {selectedPatient.age ||
                        "Not available"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Blood Group
                    </span>

                    <strong>
                      {selectedPatient.bloodGroup ||
                        "Unknown"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Status
                    </span>

                    <strong className="active-status">
                      {selectedPatient.isActive ===
                      false
                        ? "Inactive"
                        : "Active"}
                    </strong>
                  </div>

                </div>

                <div className="patient-detail-section">

                  <span>
                    Address
                  </span>

                  <p>
                    {selectedPatient.address ||
                      "No address available"}
                  </p>

                </div>

                <div className="patient-detail-section">

                  <span>
                    Medical History
                  </span>

                  <p>
                    {formatArray(
                      selectedPatient.medicalHistory
                    )}
                  </p>

                </div>

                <div className="patient-detail-section">

                  <span>
                    Allergies
                  </span>

                  <p>
                    {formatArray(
                      selectedPatient.allergies
                    )}
                  </p>

                </div>

                <div className="patient-details-actions">

                  <button
                    type="button"
                    onClick={() => {
                      closeDetails();
                      openEditForm(
                        selectedPatient
                      );
                    }}
                  >
                    <FaPen />
                    Edit Patient
                  </button>

                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      navigate("/appointment")
                    }
                  >
                    <FaCalendarCheck />
                    Book Appointment
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
};

export default PatientManagement;