import React, { useEffect, useState } from "react";
import {
  FaMagnifyingGlass,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaEye,
  FaRotate,
} from "react-icons/fa6";

import API from "../../api/axios";
import "./PatientRecords.css";

const PatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  // Load all patients
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/patients");

      const patientList =
        response.data?.patients || [];

      setPatients(patientList);
      setFilteredPatients(patientList);
    } catch (err) {
      console.error(
        "Error loading patients:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load patient records."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load patients when page opens
  useEffect(() => {
    loadPatients();
  }, []);

  // Search patients
  useEffect(() => {
    const searchText = search
      .toLowerCase()
      .trim();

    if (!searchText) {
      setFilteredPatients(patients);
      return;
    }

    const results = patients.filter(
      (patient) => {
        const name =
          patient.name?.toLowerCase() || "";

        const phone =
          patient.phone?.toLowerCase() || "";

        const email =
          patient.email?.toLowerCase() || "";

        return (
          name.includes(searchText) ||
          phone.includes(searchText) ||
          email.includes(searchText)
        );
      }
    );

    setFilteredPatients(results);
  }, [search, patients]);

  // View patient details
  const handleViewPatient = async (
    patientId
  ) => {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await API.get(
        `/patients/${patientId}`
      );

      setSelectedPatient(
        response.data?.patient || null
      );
    } catch (err) {
      console.error(
        "Error loading patient details:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load patient details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // Close modal
  const closeDetails = () => {
    setSelectedPatient(null);
  };

  // Get first letter of patient name
  const getInitial = (name) => {
    if (!name) return "P";

    return name
      .charAt(0)
      .toUpperCase();
  };

  return (
    <div className="patient-records-page">

      {/* ================= HEADER ================= */}

      <div className="patient-records-header">

        <div>
          <p className="records-eyebrow">
            DOCTOR PORTAL
          </p>

          <h1>Patient Records</h1>

          <p className="records-subtitle">
            View and manage patient information
            and medical records.
          </p>
        </div>

        <button
          type="button"
          className="records-refresh-btn"
          onClick={loadPatients}
          disabled={loading}
        >
          <FaRotate
            className={
              loading ? "rotate-icon" : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="records-toolbar">

        <div className="records-search">

          <FaMagnifyingGlass />

          <input
            type="text"
            placeholder="Search by patient name, phone or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <div className="patient-count">
          <strong>
            {filteredPatients.length}
          </strong>

          <span>Patients</span>
        </div>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="records-error">

          <p>{error}</p>

          <button
            type="button"
            onClick={loadPatients}
          >
            Try Again
          </button>

        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="records-loading">

          <div className="records-spinner"></div>

          <p>
            Loading patient records...
          </p>

        </div>
      )}

      {/* ================= EMPTY ================= */}

      {!loading &&
        !error &&
        filteredPatients.length === 0 && (
          <div className="records-empty">

            <div className="empty-icon">
              <FaUser />
            </div>

            <h3>No patients found</h3>

            <p>
              {search
                ? "No patient matches your search."
                : "There are no patient records available yet."}
            </p>

          </div>
        )}

      {/* ================= PATIENT CARDS ================= */}

      {!loading &&
        filteredPatients.length > 0 && (
          <div className="patients-grid">

            {filteredPatients.map(
              (patient) => (
                <div
                  className="patient-record-card"
                  key={patient._id}
                >

                  {/* Patient Header */}
                  <div className="patient-card-top">

                    <div className="patient-avatar">
                      {getInitial(
                        patient.name
                      )}
                    </div>

                    <div className="patient-basic-info">

                      <h3>
                        {patient.name ||
                          "Unknown Patient"}
                      </h3>

                      <span>
                        {patient.gender ||
                          "Not specified"}{" "}
                        •{" "}
                        {patient.age ||
                          "N/A"}{" "}
                        years
                      </span>

                    </div>

                  </div>

                  {/* Contact Information */}
                  <div className="patient-contact">

                    <div className="contact-item">

                      <FaPhone />

                      <span>
                        {patient.phone ||
                          "No phone number"}
                      </span>

                    </div>

                    <div className="contact-item">

                      <FaEnvelope />

                      <span>
                        {patient.email ||
                          "No email available"}
                      </span>

                    </div>

                  </div>

                  {/* Medical History */}
                  <div className="patient-history">

                    <h4>
                      Medical History
                    </h4>

                    <p>
                      {patient.medicalHistory
                        ? patient.medicalHistory
                        : "No medical history recorded."}
                    </p>

                  </div>

                  {/* View Details */}
                  <button
                    type="button"
                    className="view-patient-btn"
                    onClick={() =>
                      handleViewPatient(
                        patient._id
                      )
                    }
                  >
                    <FaEye />

                    View Patient Details
                  </button>

                </div>
              )
            )}

          </div>
        )}

      {/* ================= PATIENT MODAL ================= */}

      {selectedPatient && (
        <div
          className="patient-modal-overlay"
          onClick={closeDetails}
        >

          <div
            className="patient-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}
            <div className="modal-header">

              <div>

                <p className="modal-eyebrow">
                  PATIENT PROFILE
                </p>

                <h2>
                  {selectedPatient.name}
                </h2>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeDetails}
              >
                ×
              </button>

            </div>

            {/* Loading */}
            {detailsLoading ? (
              <div className="modal-loading">

                <div className="records-spinner"></div>

                <p>
                  Loading patient details...
                </p>

              </div>
            ) : (
              <>
                {/* Personal Information */}
                <div className="modal-section">

                  <h3>
                    Personal Information
                  </h3>

                  <div className="details-grid">

                    <div className="detail-item">
                      <span>Name</span>

                      <strong>
                        {selectedPatient.name ||
                          "N/A"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Age</span>

                      <strong>
                        {selectedPatient.age
                          ? `${selectedPatient.age} years`
                          : "N/A"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Gender</span>

                      <strong>
                        {selectedPatient.gender ||
                          "N/A"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Phone</span>

                      <strong>
                        {selectedPatient.phone ||
                          "N/A"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Email</span>

                      <strong>
                        {selectedPatient.email ||
                          "N/A"}
                      </strong>
                    </div>

                    <div className="detail-item">
                      <span>Address</span>

                      <strong>
                        {selectedPatient.address ||
                          "N/A"}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* Medical History */}
                <div className="modal-section">

                  <h3>
                    Medical History
                  </h3>

                  <div className="medical-history-box">

                    <p>
                      {selectedPatient.medicalHistory ||
                        "No medical history has been recorded for this patient."}
                    </p>

                  </div>

                </div>

                {/* Modal Footer */}
                <div className="modal-footer">

                  <button
                    type="button"
                    className="close-details-btn"
                    onClick={closeDetails}
                  >
                    Close
                  </button>

                </div>
              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default PatientRecords;