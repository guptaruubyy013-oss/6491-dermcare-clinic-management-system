import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import API from "../../api/axios";
import ImageComparison from "../../components/ImageComparison";
import { AuthContext } from "../../context/AuthContext";

import {
  FaArrowLeft,
  FaNotesMedical,
  FaUserDoctor,
  FaCalendarCheck,
  FaClock,
  FaStethoscope,
  FaPills,
  FaCircleCheck,
  FaRotate,
} from "react-icons/fa6";

const PatientHistory = () => {
  const { patientId: paramId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const targetId = paramId || user?.id || user?._id;

  const [treatments, setTreatments] = useState([]);
  const [patient, setPatient] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      if (!targetId) {
        setError("Patient information is not available.");
        return;
      }

      const { data } = await API.get(
        `/treatments/patient/${targetId}`
      );

      setTreatments(
        Array.isArray(data?.treatments)
          ? data.treatments
          : []
      );

      setPatient(data?.patient || null);
    } catch (err) {
      console.error("Treatment history error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load treatment history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [targetId]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div
      className="container-fluid py-4"
      style={{
        background: "#f8fafc",
        minHeight: "85vh",
      }}
    >
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <small
            className="fw-bold"
            style={{
              color: "#2878e8",
              letterSpacing: "1.5px",
            }}
          >
            PATIENT PORTAL
          </small>

          <h2
            className="fw-bold mt-1 mb-1"
            style={{ color: "#172033" }}
          >
            Treatment Progress
          </h2>

          <p className="text-muted mb-0">
            View your treatment sessions, diagnosis,
            medicines and clinical progress.
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/dashboard")}
            style={{
              background: "#eef4ff",
              color: "#2563eb",
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            <FaArrowLeft className="me-2" />
            Dashboard
          </button>

          <button
            type="button"
            className="btn btn-dark"
            onClick={fetchHistory}
            disabled={loading}
            style={{
              borderRadius: "10px",
              fontWeight: "600",
            }}
          >
            <FaRotate className="me-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* PATIENT INFORMATION */}
      {patient && (
        <div
          className="card border-0 shadow-sm mb-4"
          style={{
            borderRadius: "16px",
          }}
        >
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{
                  width: "55px",
                  height: "55px",
                  borderRadius: "14px",
                  background: "#edf5ff",
                  color: "#2878e8",
                  fontSize: "22px",
                }}
              >
                <FaNotesMedical />
              </div>

              <div>
                <small
                  className="fw-bold text-muted"
                  style={{ letterSpacing: "1px" }}
                >
                  PATIENT
                </small>

                <h5 className="fw-bold mb-1">
                  {patient.name || user?.name || "Patient"}
                </h5>

                <p className="text-muted mb-0">
                  {patient.email ||
                    user?.email ||
                    "Email not available"}
                </p>
              </div>

              <div
                className="ms-auto text-end"
                style={{ minWidth: "130px" }}
              >
                <h3
                  className="fw-bold mb-0"
                  style={{ color: "#2878e8" }}
                >
                  {treatments.length}
                </h3>

                <small className="text-muted">
                  Treatment Sessions
                </small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="alert alert-danger border-0 shadow-sm">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="text-center py-5">
          <FaNotesMedical
            size={40}
            style={{ color: "#2878e8" }}
          />

          <h5 className="fw-bold mt-3">
            Loading Treatment History...
          </h5>

          <p className="text-muted">
            Please wait while we fetch your treatment records.
          </p>
        </div>
      )}

      {/* NO RECORDS */}
      {!loading && !error && treatments.length === 0 && (
        <div
          className="card border-0 shadow-sm text-center p-5"
          style={{ borderRadius: "16px" }}
        >
          <FaNotesMedical
            size={45}
            style={{ color: "#2878e8" }}
          />

          <h5 className="fw-bold mt-3">
            No Treatment History
          </h5>

          <p className="text-muted">
            Your treatment records will appear here after
            your doctor adds a treatment session.
          </p>

          <button
            type="button"
            className="btn btn-primary mx-auto"
            onClick={() => navigate("/appointment")}
            style={{
              borderRadius: "9px",
              fontWeight: "600",
            }}
          >
            Book an Appointment
          </button>
        </div>
      )}

      {/* TREATMENT SESSIONS */}
      {!loading && treatments.length > 0 && (
        <div className="row">
          {treatments.map((session, index) => (
            <div
              key={session._id}
              className="col-12 mb-4"
            >
              <div
                className="card border-0 shadow-sm"
                style={{
                  borderRadius: "18px",
                  overflow: "hidden",
                }}
              >
                <div className="card-body p-4">

                  {/* SESSION HEADER */}
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                      <small
                        className="fw-bold text-muted"
                        style={{ letterSpacing: "1px" }}
                      >
                        SESSION
                      </small>

                      <h4
                        className="fw-bold mb-0"
                        style={{ color: "#172033" }}
                      >
                        #{session.sessionNumber || index + 1}
                      </h4>
                    </div>

                    <div
                      className="px-3 py-2 rounded-pill d-flex align-items-center gap-2"
                      style={{
                        background: "#edf8f1",
                        color: "#15803d",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      <FaCircleCheck />

                      {session.treatmentType ||
                        "Treatment Session"}
                    </div>
                  </div>

                  {/* DETAILS */}
                  <div className="row g-3 mb-4">

                    {/* DOCTOR */}
                    <div className="col-md-6 col-xl-3">
                      <div
                        className="p-3 h-100 rounded-3"
                        style={{
                          background: "#f8fafc",
                        }}
                      >
                        <FaUserDoctor
                          style={{
                            color: "#2878e8",
                            marginBottom: "8px",
                          }}
                        />

                        <small className="d-block text-muted fw-bold">
                          DOCTOR
                        </small>

                        <strong className="d-block mt-1">
                          {session.doctor?.name ||
                            "Specialist"}
                        </strong>

                        <small className="text-muted">
                          {session.doctor?.specialization ||
                            "Dermatologist"}
                        </small>
                      </div>
                    </div>

                    {/* DIAGNOSIS */}
                    <div className="col-md-6 col-xl-3">
                      <div
                        className="p-3 h-100 rounded-3"
                        style={{
                          background: "#f8fafc",
                        }}
                      >
                        <FaStethoscope
                          style={{
                            color: "#2878e8",
                            marginBottom: "8px",
                          }}
                        />

                        <small className="d-block text-muted fw-bold">
                          DIAGNOSIS
                        </small>

                        <strong className="d-block mt-1">
                          {session.diagnosis ||
                            "Under Evaluation"}
                        </strong>
                      </div>
                    </div>

                    {/* SESSION DATE */}
                    <div className="col-md-6 col-xl-3">
                      <div
                        className="p-3 h-100 rounded-3"
                        style={{
                          background: "#f8fafc",
                        }}
                      >
                        <FaCalendarCheck
                          style={{
                            color: "#2878e8",
                            marginBottom: "8px",
                          }}
                        />

                        <small className="d-block text-muted fw-bold">
                          SESSION DATE
                        </small>

                        <strong className="d-block mt-1">
                          {formatDate(session.createdAt)}
                        </strong>
                      </div>
                    </div>

                    {/* FOLLOW UP */}
                    <div className="col-md-6 col-xl-3">
                      <div
                        className="p-3 h-100 rounded-3"
                        style={{
                          background: "#f8fafc",
                        }}
                      >
                        <FaClock
                          style={{
                            color: "#2878e8",
                            marginBottom: "8px",
                          }}
                        />

                        <small className="d-block text-muted fw-bold">
                          NEXT FOLLOW-UP
                        </small>

                        <strong className="d-block mt-1">
                          {session.nextFollowUpDate
                            ? formatDate(
                                session.nextFollowUpDate
                              )
                            : "Not scheduled"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* DIAGNOSIS DETAILS */}
                  <div className="mb-4">
                    <h6 className="fw-bold">
                      <FaStethoscope
                        className="me-2"
                        style={{ color: "#2878e8" }}
                      />
                      Clinical Diagnosis
                    </h6>

                    <div
                      className="p-3 rounded-3"
                      style={{
                        background: "#f8fafc",
                      }}
                    >
                      {session.diagnosis ||
                        "Under Evaluation"}
                    </div>
                  </div>

                  {/* PROCEDURE NOTES */}
                  {session.procedureNotes && (
                    <div className="mb-4">
                      <h6 className="fw-bold">
                        <FaNotesMedical
                          className="me-2"
                          style={{ color: "#2878e8" }}
                        />
                        Procedure / Clinical Notes
                      </h6>

                      <div
                        className="p-3 rounded-3 text-muted"
                        style={{
                          background: "#f8fafc",
                          lineHeight: "1.6",
                        }}
                      >
                        {session.procedureNotes}
                      </div>
                    </div>
                  )}

                  {/* PRESCRIPTIONS */}
                  {Array.isArray(session.prescriptions) &&
                    session.prescriptions.length > 0 && (
                      <div className="mb-4">
                        <h6 className="fw-bold">
                          <FaPills
                            className="me-2"
                            style={{ color: "#2878e8" }}
                          />
                          Prescribed Medicines
                        </h6>

                        <div className="row g-3">
                          {session.prescriptions.map(
                            (med, idx) => (
                              <div
                                key={idx}
                                className="col-md-6 col-lg-4"
                              >
                                <div
                                  className="border rounded-3 p-3 h-100"
                                  style={{
                                    background: "#fff",
                                  }}
                                >
                                  <strong className="d-block">
                                    {med.medicineName ||
                                      "Medicine"}
                                  </strong>

                                  <span className="d-block text-muted small mt-1">
                                    Dosage:{" "}
                                    {med.dosage ||
                                      "Not specified"}
                                  </span>

                                  <span className="d-block text-muted small">
                                    Duration:{" "}
                                    {med.duration ||
                                      "Not specified"}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* BEFORE / AFTER */}
                  <div className="border-top pt-4">
                    <h6 className="fw-bold mb-3">
                      Clinical Progress
                    </h6>

                    {session.beforeImages?.[0]?.url &&
                    session.afterImages?.[0]?.url ? (
                      <ImageComparison
                        beforeUrl={
                          session.beforeImages[0].url
                        }
                        afterUrl={
                          session.afterImages[0].url
                        }
                        title={`Session ${
                          session.sessionNumber || index + 1
                        } Analysis`}
                      />
                    ) : (
                      <div className="alert alert-secondary mb-0">
                        Clinical photos for this session
                        will appear once uploaded by the
                        attending dermatologist.
                      </div>
                    )}

                    {/* Additional Images */}
                    {(session.beforeImages?.length > 1 ||
                      session.afterImages?.length > 1) && (
                      <div className="row mt-3 g-3">
                        {session.beforeImages
                          ?.slice(1)
                          .map((image, idx) => (
                            <div
                              key={`before-${idx}`}
                              className="col-md-3"
                            >
                              <small className="fw-bold text-muted d-block mb-2">
                                BEFORE {idx + 2}
                              </small>

                              <img
                                src={image.url}
                                alt={`Before treatment ${
                                  idx + 2
                                }`}
                                className="img-fluid rounded-3"
                                style={{
                                  height: "160px",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ))}

                        {session.afterImages
                          ?.slice(1)
                          .map((image, idx) => (
                            <div
                              key={`after-${idx}`}
                              className="col-md-3"
                            >
                              <small className="fw-bold text-muted d-block mb-2">
                                AFTER {idx + 2}
                              </small>

                              <img
                                src={image.url}
                                alt={`After treatment ${
                                  idx + 2
                                }`}
                                className="img-fluid rounded-3"
                                style={{
                                  height: "160px",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;