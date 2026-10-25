import React, {
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaCakeCandles,
  FaDroplet,
  FaLocationDot,
  FaNotesMedical,
  FaTriangleExclamation,
  FaArrowLeft,
  FaRotate,
} from "react-icons/fa6";

import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

import "./PatientProfile.css";

const PatientProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const userId =
        user?._id ||
        user?.id ||
        "";

      if (!userId) {
        setError(
          "Patient information is not available. Please login again."
        );
        return;
      }

      const response = await API.get(
        `/patients/${userId}`
      );

      setPatient(
        response.data?.patient || null
      );
    } catch (err) {
      console.error(
        "Patient profile error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const formatList = (value) => {
    if (Array.isArray(value)) {
      return value.length > 0
        ? value.join(", ")
        : "None recorded";
    }

    if (typeof value === "string") {
      return value.trim()
        ? value
        : "None recorded";
    }

    return "None recorded";
  };

  if (loading) {
    return (
      <div className="patient-profile-page">
        <div className="patient-profile-loading">
          Loading your profile...
        </div>
      </div>
    );
  }

  return (
    <div className="patient-profile-page">

      {/* HEADER */}

      <div className="patient-profile-header">

        <div>
          <span className="patient-profile-label">
            PATIENT PORTAL
          </span>

          <h1>
            My Profile
          </h1>

          <p>
            View your personal and medical
            information.
          </p>
        </div>

        <div className="patient-profile-actions">

          <button
            type="button"
            className="patient-profile-refresh"
            onClick={fetchProfile}
            disabled={loading}
          >
            <FaRotate />
            Refresh
          </button>

          <button
            type="button"
            className="patient-profile-back"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <FaArrowLeft />
            Dashboard
          </button>

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="patient-profile-error">
          {error}
        </div>
      )}

      {patient && (
        <>
          {/* PROFILE CARD */}

          <div className="patient-profile-main-card">

            <div className="patient-profile-avatar">
              <FaUser />
            </div>

            <div className="patient-profile-main-info">

              <span>
                PATIENT
              </span>

              <h2>
                {patient.name ||
                  user?.name ||
                  "Patient"}
              </h2>

              <p>
                {patient.email ||
                  user?.email ||
                  "Email not available"}
              </p>

            </div>

            <div className="patient-profile-blood">

              <FaDroplet />

              <div>
                <span>
                  BLOOD GROUP
                </span>

                <strong>
                  {patient.bloodGroup ||
                    "Unknown"}
                </strong>
              </div>

            </div>

          </div>

          {/* PERSONAL INFORMATION */}

          <section className="patient-profile-section">

            <div className="patient-profile-section-heading">

              <span>
                PERSONAL INFORMATION
              </span>

              <h2>
                Personal Details
              </h2>

            </div>

            <div className="patient-profile-grid">

              <div className="patient-profile-info-card">

                <FaUser />

                <div>
                  <span>
                    Full Name
                  </span>

                  <strong>
                    {patient.name ||
                      "Not available"}
                  </strong>
                </div>

              </div>

              <div className="patient-profile-info-card">

                <FaEnvelope />

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {patient.email ||
                      user?.email ||
                      "Not available"}
                  </strong>
                </div>

              </div>

              <div className="patient-profile-info-card">

                <FaPhone />

                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    {patient.phone ||
                      user?.phone ||
                      "Not available"}
                  </strong>
                </div>

              </div>

              <div className="patient-profile-info-card">

                <FaVenusMars />

                <div>
                  <span>
                    Gender
                  </span>

                  <strong>
                    {patient.gender ||
                      "Not available"}
                  </strong>
                </div>

              </div>

              <div className="patient-profile-info-card">

                <FaCakeCandles />

                <div>
                  <span>
                    Age
                  </span>

                  <strong>
                    {patient.age !== undefined &&
                    patient.age !== null
                      ? `${patient.age} years`
                      : "Not available"}
                  </strong>
                </div>

              </div>

              <div className="patient-profile-info-card">

                <FaDroplet />

                <div>
                  <span>
                    Blood Group
                  </span>

                  <strong>
                    {patient.bloodGroup ||
                      "Unknown"}
                  </strong>
                </div>

              </div>

            </div>

          </section>

          {/* ADDRESS */}

          <section className="patient-profile-section">

            <div className="patient-profile-section-heading">

              <span>
                CONTACT INFORMATION
              </span>

              <h2>
                Address
              </h2>

            </div>

            <div className="patient-profile-detail-card">

              <FaLocationDot />

              <div>
                <span>
                  Residential Address
                </span>

                <p>
                  {patient.address ||
                    "No address recorded."}
                </p>
              </div>

            </div>

          </section>

          {/* MEDICAL INFORMATION */}

          <section className="patient-profile-section">

            <div className="patient-profile-section-heading">

              <span>
                MEDICAL INFORMATION
              </span>

              <h2>
                Health Details
              </h2>

            </div>

            <div className="patient-profile-medical-grid">

              <div className="patient-profile-medical-card">

                <div className="patient-profile-medical-icon">
                  <FaNotesMedical />
                </div>

                <div>

                  <span>
                    MEDICAL HISTORY
                  </span>

                  <h3>
                    Medical History
                  </h3>

                  <p>
                    {formatList(
                      patient.medicalHistory
                    )}
                  </p>

                </div>

              </div>

              <div className="patient-profile-medical-card">

                <div className="patient-profile-medical-icon warning">
                  <FaTriangleExclamation />
                </div>

                <div>

                  <span>
                    ALLERGIES
                  </span>

                  <h3>
                    Known Allergies
                  </h3>

                  <p>
                    {formatList(
                      patient.allergies
                    )}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* FOOTER ACTION */}

          <div className="patient-profile-bottom">

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <FaArrowLeft />
              Back to Dashboard
            </button>

          </div>
        </>
      )}

    </div>
  );
};

export default PatientProfile;