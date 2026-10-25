import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaNotesMedical,
  FaUserDoctor,
  FaCalendarCheck,
  FaClock,
  FaStethoscope,
  FaPills,
  FaImage,
  FaCircleCheck,
  FaRotate,
} from "react-icons/fa6";

import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

import "./TreatmentHistory.css";

const TreatmentHistory = () => {
  const { user } = useContext(AuthContext);
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [treatments, setTreatments] = useState([]);
  const [patient, setPatient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH TREATMENT HISTORY
  // ==========================================

  const fetchTreatments = async () => {
    try {
      setLoading(true);
      setError("");

      const id =
        patientId ||
        user?._id ||
        user?.id;

      if (!id) {
        setError(
          "Patient information is not available. Please login again."
        );
        return;
      }

      const response = await API.get(
        `/treatments/patient/${id}`
      );

      setTreatments(
        Array.isArray(response.data?.treatments)
          ? response.data.treatments
          : []
      );

      setPatient(response.data?.patient || null);
    } catch (err) {
      console.error(
        "Treatment history error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load treatment history."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    if (user) {
      fetchTreatments();
    }
  }, [user, patientId]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

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

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="treatment-history-page">

      {/* HEADER */}

      <div className="treatment-history-header">

        <div>

          <span className="treatment-history-label">
            PATIENT PORTAL
          </span>

          <h1>
            Treatment Progress
          </h1>

          <p>
            View your treatment sessions,
            diagnosis, medicines and
            before & after progress.
          </p>

        </div>

        <div className="treatment-history-actions">

          <button
            type="button"
            className="treatment-back-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <FaArrowLeft />
            Dashboard
          </button>

          <button
            type="button"
            className="treatment-refresh-btn"
            onClick={fetchTreatments}
            disabled={loading}
          >
            <FaRotate />
            Refresh
          </button>

        </div>

      </div>

      {/* PATIENT INFO */}

      {patient && (
        <div className="treatment-patient-card">

          <div className="treatment-patient-icon">
            <FaNotesMedical />
          </div>

          <div>

            <span>
              PATIENT
            </span>

            <h2>
              {patient.name || "Patient"}
            </h2>

            <p>
              {patient.email ||
                user?.email ||
                "Email not available"}
            </p>

          </div>

          <div className="treatment-session-count">

            <strong>
              {treatments.length}
            </strong>

            <span>
              Treatment Sessions
            </span>

          </div>

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="treatment-history-error">
          {error}
        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="treatment-history-empty">

          <FaNotesMedical />

          <h3>
            Loading Treatment History...
          </h3>

          <p>
            Please wait while we fetch your
            treatment records.
          </p>

        </div>

      ) : treatments.length === 0 ? (

        /* EMPTY */

        <div className="treatment-history-empty">

          <FaNotesMedical />

          <h3>
            No Treatment History
          </h3>

          <p>
            Your treatment records will
            appear here after your doctor
            adds a treatment session.
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

        /* TREATMENTS */

        <div className="treatment-history-list">

          {treatments.map(
            (treatment, index) => (

              <div
                className="treatment-session-card"
                key={treatment._id}
              >

                {/* SESSION HEADER */}

                <div className="treatment-session-header">

                  <div>

                    <span>
                      SESSION
                    </span>

                    <h2>
                      {treatment.sessionNumber ||
                        index + 1}
                    </h2>

                  </div>

                  <div className="treatment-session-type">

                    <FaCircleCheck />

                    {treatment.treatmentType ||
                      "Treatment Session"}

                  </div>

                </div>

                {/* BASIC DETAILS */}

                <div className="treatment-details-grid">

                  <div className="treatment-detail">

                    <FaUserDoctor />

                    <div>

                      <span>
                        DOCTOR
                      </span>

                      <strong>
                        {treatment.doctor?.name ||
                          "Doctor"}
                      </strong>

                    </div>

                  </div>

                  <div className="treatment-detail">

                    <FaStethoscope />

                    <div>

                      <span>
                        DIAGNOSIS
                      </span>

                      <strong>
                        {treatment.diagnosis ||
                          "Not available"}
                      </strong>

                    </div>

                  </div>

                  <div className="treatment-detail">

                    <FaCalendarCheck />

                    <div>

                      <span>
                        SESSION DATE
                      </span>

                      <strong>
                        {formatDate(
                          treatment.createdAt
                        )}
                      </strong>

                    </div>

                  </div>

                  {treatment.nextFollowUpDate && (
                    <div className="treatment-detail">

                      <FaClock />

                      <div>

                        <span>
                          NEXT FOLLOW-UP
                        </span>

                        <strong>
                          {formatDate(
                            treatment.nextFollowUpDate
                          )}
                        </strong>

                      </div>

                    </div>
                  )}

                </div>

                {/* PROCEDURE NOTES */}

                {treatment.procedureNotes && (
                  <div className="treatment-notes">

                    <h3>
                      <FaNotesMedical />
                      Procedure Notes
                    </h3>

                    <p>
                      {treatment.procedureNotes}
                    </p>

                  </div>
                )}

                {/* MEDICINES */}

                {Array.isArray(
                  treatment.prescriptions
                ) &&
                  treatment.prescriptions.length >
                    0 && (

                    <div className="treatment-medicines">

                      <h3>
                        <FaPills />
                        Prescribed Medicines
                      </h3>

                      <div className="medicine-list">

                        {treatment.prescriptions.map(
                          (medicine, medicineIndex) => (

                            <div
                              className="medicine-card"
                              key={medicineIndex}
                            >

                              <strong>
                                {medicine.medicineName ||
                                  "Medicine"}
                              </strong>

                              <span>
                                {medicine.dosage ||
                                  "Dosage not specified"}
                              </span>

                              <small>
                                {medicine.duration ||
                                  "Duration not specified"}
                              </small>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* IMAGES */}

                {(treatment.beforeImages?.length >
                  0 ||
                  treatment.afterImages?.length >
                    0) && (

                  <div className="treatment-images-section">

                    <h3>
                      <FaImage />
                      Treatment Progress Images
                    </h3>

                    <div className="treatment-images-grid">

                      {/* BEFORE */}

                      {treatment.beforeImages?.length >
                        0 && (

                        <div className="treatment-image-group">

                          <span>
                            BEFORE
                          </span>

                          <div className="treatment-image-list">

                            {treatment.beforeImages.map(
                              (image, imageIndex) => (

                                <img
                                  key={imageIndex}
                                  src={image.url}
                                  alt={`Before treatment ${
                                    imageIndex + 1
                                  }`}
                                />

                              )
                            )}

                          </div>

                        </div>

                      )}

                      {/* AFTER */}

                      {treatment.afterImages?.length >
                        0 && (

                        <div className="treatment-image-group">

                          <span>
                            AFTER
                          </span>

                          <div className="treatment-image-list">

                            {treatment.afterImages.map(
                              (image, imageIndex) => (

                                <img
                                  key={imageIndex}
                                  src={image.url}
                                  alt={`After treatment ${
                                    imageIndex + 1
                                  }`}
                                />

                              )
                            )}

                          </div>

                        </div>

                      )}

                    </div>

                  </div>

                )}

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
};

export default TreatmentHistory;