import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaMagnifyingGlass,
  FaUser,
  FaPhone,
  FaCalendarCheck,
  FaStethoscope,
  FaImage,
  FaClockRotateLeft,
  FaCircleCheck,
  FaRotate,
} from "react-icons/fa6";

import API from "../../api/axios";

import "./TreatmentTracking.css";

const TreatmentTracking = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] =
    useState(null);

  const [treatments, setTreatments] =
    useState([]);

  const [search, setSearch] = useState("");

  const [loadingPatients, setLoadingPatients] =
    useState(true);

  const [loadingTreatments, setLoadingTreatments] =
    useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // LOAD PATIENTS
  // ======================================================

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      setError("");

      const response =
        await API.get("/patients");

      setPatients(
        response.data?.patients || []
      );
    } catch (err) {
      console.error(
        "Error loading patients:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load patients."
      );
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // ======================================================
  // LOAD PATIENT TREATMENTS
  // ======================================================

  const loadTreatments = async (
    patientId
  ) => {
    try {
      setLoadingTreatments(true);
      setError("");

      const response =
        await API.get(
          `/treatments/patient/${patientId}`
        );

      setTreatments(
        response.data?.treatments || []
      );
    } catch (err) {
      console.error(
        "Error loading treatments:",
        err
      );

      setTreatments([]);

      setError(
        err.response?.data?.message ||
          "Unable to load treatment history."
      );
    } finally {
      setLoadingTreatments(false);
    }
  };

  // ======================================================
  // SELECT PATIENT
  // ======================================================

  const handlePatientSelect = (
    patient
  ) => {
    setSelectedPatient(patient);

    loadTreatments(patient._id);
  };

  // ======================================================
  // SEARCH
  // ======================================================

  const filteredPatients =
    patients.filter((patient) => {
      const value =
        search.toLowerCase().trim();

      if (!value) return true;

      return (
        patient.name
          ?.toLowerCase()
          .includes(value) ||
        patient.phone
          ?.toLowerCase()
          .includes(value) ||
        patient.email
          ?.toLowerCase()
          .includes(value)
      );
    });

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ======================================================
  // IMAGE COUNT
  // ======================================================

  const getImageCount = (images) => {
    return Array.isArray(images)
      ? images.length
      : 0;
  };

  // ======================================================
  // REFRESH
  // ======================================================

  const refreshTreatments = () => {
    if (selectedPatient?._id) {
      loadTreatments(
        selectedPatient._id
      );
    } else {
      loadPatients();
    }
  };

  // ======================================================
  // RETURN
  // ======================================================

  return (
    <div className="treatment-tracking-page">

      <div className="treatment-container">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="treatment-header">

          <div>

            <button
              type="button"
              className="back-dashboard-btn"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <FaArrowLeft />
              Back to Dashboard
            </button>

            <p className="treatment-eyebrow">
              DOCTOR PORTAL
            </p>

            <h1>
              Treatment Tracking
            </h1>

            <p>
              Track patient treatment progress,
              sessions, diagnosis and follow-up.
            </p>

          </div>

          <button
            type="button"
            className="treatment-refresh-btn"
            onClick={refreshTreatments}
            disabled={
              loadingPatients ||
              loadingTreatments
            }
          >
            <FaRotate
              className={
                loadingPatients ||
                loadingTreatments
                  ? "treatment-rotate"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="treatment-error">
            {error}
          </div>
        )}

        {/* ==================================================
            MAIN GRID
        ================================================== */}

        <div className="treatment-main-grid">

          {/* ==================================================
              PATIENT LIST
          ================================================== */}

          <div className="patients-panel">

            <div className="panel-header">

              <div>
                <span>
                  PATIENTS
                </span>

                <h2>
                  Select Patient
                </h2>
              </div>

              <strong>
                {patients.length}
              </strong>

            </div>

            {/* SEARCH */}

            <div className="patient-search">

              <FaMagnifyingGlass />

              <input
                type="text"
                placeholder="Search patient..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

            {/* PATIENTS */}

            {loadingPatients ? (

              <div className="panel-loading">
                <div className="small-spinner"></div>
                <p>
                  Loading patients...
                </p>
              </div>

            ) : filteredPatients.length ===
              0 ? (

              <div className="panel-empty">
                <FaUser />

                <p>
                  No patients found.
                </p>
              </div>

            ) : (

              <div className="patient-list">

                {filteredPatients.map(
                  (patient) => (

                    <button
                      type="button"
                      key={patient._id}
                      className={`patient-list-card ${
                        selectedPatient?._id ===
                        patient._id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        handlePatientSelect(
                          patient
                        )
                      }
                    >

                      <div className="patient-list-avatar">
                        <FaUser />
                      </div>

                      <div className="patient-list-info">

                        <strong>
                          {patient.name}
                        </strong>

                        <span>
                          {patient.phone ||
                            "No phone"}
                        </span>

                      </div>

                    </button>

                  )
                )}

              </div>

            )}

          </div>

          {/* ==================================================
              TREATMENT DETAILS
          ================================================== */}

          <div className="treatments-panel">

            {!selectedPatient ? (

              <div className="select-patient-state">

                <div className="select-patient-icon">
                  <FaStethoscope />
                </div>

                <h2>
                  Select a Patient
                </h2>

                <p>
                  Select a patient from the
                  list to view their treatment
                  history and progress.
                </p>

              </div>

            ) : (

              <>

                {/* PATIENT HEADER */}

                <div className="selected-patient-header">

                  <div className="selected-patient-avatar">
                    <FaUser />
                  </div>

                  <div>

                    <span>
                      PATIENT
                    </span>

                    <h2>
                      {selectedPatient.name}
                    </h2>

                    <div className="patient-contact">

                      <span>
                        <FaPhone />

                        {selectedPatient.phone ||
                          "No phone"}
                      </span>

                      {selectedPatient.email && (
                        <span>
                          {selectedPatient.email}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

                {/* TREATMENT TITLE */}

                <div className="treatment-history-heading">

                  <div>
                    <span>
                      TREATMENT HISTORY
                    </span>

                    <h2>
                      Treatment Sessions
                    </h2>
                  </div>

                  <div className="session-count">
                    {treatments.length}{" "}
                    Sessions
                  </div>

                </div>

                {/* LOADING */}

                {loadingTreatments ? (

                  <div className="treatments-loading">

                    <div className="small-spinner"></div>

                    <p>
                      Loading treatment history...
                    </p>

                  </div>

                ) : treatments.length ===
                  0 ? (

                  <div className="no-treatments">

                    <div>
                      <FaClockRotateLeft />
                    </div>

                    <h3>
                      No Treatment Records
                    </h3>

                    <p>
                      No treatment sessions have
                      been recorded for this patient.
                    </p>

                  </div>

                ) : (

                  <div className="treatment-session-list">

                    {treatments.map(
                      (treatment, index) => (

                        <div
                          className="treatment-session-card"
                          key={
                            treatment._id ||
                            index
                          }
                        >

                          {/* SESSION HEADER */}

                          <div className="session-card-header">

                            <div className="session-number">

                              <span>
                                SESSION
                              </span>

                              <strong>
                                {treatment.sessionNumber ||
                                  index + 1}
                              </strong>

                            </div>

                            <div className="session-date">

                              <FaCalendarCheck />

                              {formatDate(
                                treatment.createdAt
                              )}

                            </div>

                          </div>

                          {/* TREATMENT INFO */}

                          <div className="treatment-info-grid">

                            <div className="treatment-info-box">

                              <span>
                                TREATMENT TYPE
                              </span>

                              <strong>
                                {treatment.treatmentType ||
                                  "Not specified"}
                              </strong>

                            </div>

                            <div className="treatment-info-box">

                              <span>
                                DIAGNOSIS
                              </span>

                              <strong>
                                {treatment.diagnosis ||
                                  "Not specified"}
                              </strong>

                            </div>

                            <div className="treatment-info-box">

                              <span>
                                NEXT FOLLOW-UP
                              </span>

                              <strong>
                                {treatment.nextFollowUpDate
                                  ? formatDate(
                                      treatment.nextFollowUpDate
                                    )
                                  : "Not scheduled"}
                              </strong>

                            </div>

                          </div>

                          {/* PROCEDURE NOTES */}

                          {treatment.procedureNotes && (

                            <div className="procedure-notes">

                              <span>
                                PROCEDURE NOTES
                              </span>

                              <p>
                                {
                                  treatment.procedureNotes
                                }
                              </p>

                            </div>

                          )}

                          {/* PRESCRIPTIONS */}

                          {Array.isArray(
                            treatment.prescriptions
                          ) &&
                            treatment.prescriptions
                              .length > 0 && (

                              <div className="embedded-prescriptions">

                                <span>
                                  PRESCRIPTIONS
                                </span>

                                <div className="medicine-list">

                                  {treatment.prescriptions.map(
                                    (
                                      medicine,
                                      medicineIndex
                                    ) => (

                                      <div
                                        className="medicine-item"
                                        key={
                                          medicineIndex
                                        }
                                      >

                                        <FaCircleCheck />

                                        <div>

                                          <strong>
                                            {
                                              medicine.medicineName
                                            }
                                          </strong>

                                          <small>
                                            {
                                              medicine.dosage
                                            }

                                            {" • "}

                                            {
                                              medicine.duration
                                            }
                                          </small>

                                        </div>

                                      </div>

                                    )
                                  )}

                                </div>

                              </div>

                            )}

                          {/* IMAGES */}

                          <div className="treatment-images-row">

                            <div className="image-status">

                              <FaImage />

                              <span>
                                Before Images
                              </span>

                              <strong>
                                {getImageCount(
                                  treatment.beforeImages
                                )}
                              </strong>

                            </div>

                            <div className="image-status">

                              <FaImage />

                              <span>
                                After Images
                              </span>

                              <strong>
                                {getImageCount(
                                  treatment.afterImages
                                )}
                              </strong>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                )}

              </>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default TreatmentTracking;