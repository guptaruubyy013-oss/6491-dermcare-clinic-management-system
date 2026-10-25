import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  FaMagnifyingGlass,
  FaEye,
  FaRotate,
  FaTrash,
  FaXmark,
  FaFilePrescription,
} from "react-icons/fa6";

import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

import "./Prescriptions.css";


function Prescriptions() {

  const { user } = useContext(AuthContext);

  const [prescriptions, setPrescriptions] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedPrescription, setSelectedPrescription] =
    useState(null);


  // ==================================================
  // USER ROLE
  // ==================================================

  const role =
    user?.role?.toLowerCase().trim();


  // ==================================================
  // LOAD PRESCRIPTIONS
  // ==================================================

  const loadPrescriptions = async () => {

    try {

      setLoading(true);
      setError("");

      let response;

      // ----------------------------------------------
      // PATIENT
      // ----------------------------------------------

      if (role === "patient") {

        const patientId =
          user?._id ||
          user?.id;

        if (!patientId) {

          setError(
            "Patient information is not available. Please login again."
          );

          setPrescriptions([]);

          return;
        }

        response = await API.get(
          `/prescriptions/patient/${patientId}`
        );

      }

      // ----------------------------------------------
      // ADMIN / DOCTOR / RECEPTIONIST
      // ----------------------------------------------

      else {

        response = await API.get(
          "/prescriptions"
        );

      }


      const prescriptionList =
        response.data?.prescriptions ||
        response.data ||
        [];

      setPrescriptions(
        Array.isArray(prescriptionList)
          ? prescriptionList
          : []
      );

    } catch (err) {

      console.error(
        "Prescription loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load prescriptions."
      );

    } finally {

      setLoading(false);

    }

  };


  // ==================================================
  // LOAD WHEN USER IS AVAILABLE
  // ==================================================

  useEffect(() => {

    if (user) {
      loadPrescriptions();
    }

  }, [user]);


  // ==================================================
  // PATIENT NAME
  // ==================================================

  const getPatientName = (
    prescription
  ) => {

    if (!prescription.patient) {
      return "Unknown Patient";
    }

    return (
      prescription.patient.name ||
      prescription.patient.fullName ||
      "Unknown Patient"
    );

  };


  // ==================================================
  // DOCTOR NAME
  // ==================================================

  const getDoctorName = (
    prescription
  ) => {

    if (!prescription.doctor) {
      return "Unknown Doctor";
    }

    return (
      prescription.doctor.name ||
      "Unknown Doctor"
    );

  };


  // ==================================================
  // DIAGNOSIS
  // ==================================================

  const getDiagnosis = (
    prescription
  ) => {

    return (
      prescription.diagnosis ||
      "Not specified"
    );

  };


  // ==================================================
  // MEDICINE COUNT
  // ==================================================

  const getMedicineCount = (
    prescription
  ) => {

    return (
      prescription.medicines?.length ||
      0
    );

  };


  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const formattedDate =
      new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "-";
    }

    return formattedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ==================================================
  // SEARCH
  // ==================================================

  const filteredPrescriptions =
    prescriptions.filter(
      (prescription) => {

        const patientName =
          getPatientName(
            prescription
          ).toLowerCase();

        const doctorName =
          getDoctorName(
            prescription
          ).toLowerCase();

        const diagnosis =
          getDiagnosis(
            prescription
          ).toLowerCase();

        const searchText =
          search
            .toLowerCase()
            .trim();

        return (
          patientName.includes(
            searchText
          ) ||
          doctorName.includes(
            searchText
          ) ||
          diagnosis.includes(
            searchText
          )
        );

      }
    );


  // ==================================================
  // DELETE PRESCRIPTION
  // ==================================================

  const handleDelete = async (
    id
  ) => {

    if (
      !window.confirm(
        "Are you sure you want to delete this prescription?"
      )
    ) {
      return;
    }


    try {

      await API.delete(
        `/prescriptions/${id}`
      );


      setPrescriptions(
        (prev) =>
          prev.filter(
            (item) =>
              item._id !== id
          )
      );


      if (
        selectedPrescription?._id === id
      ) {

        setSelectedPrescription(
          null
        );

      }


      alert(
        "Prescription deleted successfully."
      );

    } catch (err) {

      console.error(
        "Delete prescription error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete prescription."
      );

    }

  };


  // ==================================================
  // RETURN
  // ==================================================

  return (

    <div className="prescriptions-page">

      <div className="prescriptions-container">


        {/* ==================================================
            HEADER
            ================================================== */}

        <div className="prescriptions-header">

          <div className="prescriptions-title">

            <div className="prescriptions-icon">
              <FaFilePrescription />
            </div>

            <div>

              <h1>
                {role === "patient"
                  ? "My Prescriptions"
                  : "Prescription Management"}
              </h1>

              <p>
                {role === "patient"
                  ? "View prescriptions issued by your doctor."
                  : "View and manage patient prescriptions."}
              </p>

            </div>

          </div>


          <button
            type="button"
            className="prescriptions-refresh-btn"
            onClick={loadPrescriptions}
            disabled={loading}
          >

            <FaRotate />

            {loading
              ? "Loading..."
              : "Refresh"}

          </button>

        </div>


        {/* ==================================================
            SEARCH
            ================================================== */}

        <div className="prescriptions-toolbar">

          <div className="prescription-search">

            <FaMagnifyingGlass />

            <input
              type="text"
              placeholder={
                role === "patient"
                  ? "Search doctor or diagnosis..."
                  : "Search patient, doctor or diagnosis..."
              }
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>


          <div className="prescription-count">

            {filteredPrescriptions.length}{" "}

            Prescription
            {filteredPrescriptions.length !==
            1
              ? "s"
              : ""}

          </div>

        </div>


        {/* ==================================================
            ERROR
            ================================================== */}

        {error && (

          <div className="prescription-error">

            {error}

          </div>

        )}


        {/* ==================================================
            LOADING
            ================================================== */}

        {loading ? (

          <div className="prescription-state">

            <div className="prescription-loader"></div>

            <p>
              Loading prescriptions...
            </p>

          </div>

        ) : filteredPrescriptions.length ===
          0 ? (

          <div className="prescription-state">

            <div className="empty-prescription-icon">

              <FaFilePrescription />

            </div>

            <h3>
              No Prescriptions Found
            </h3>

            <p>

              {search
                ? "No prescriptions match your search."
                : role === "patient"
                ? "Your doctor has not issued any prescriptions yet."
                : "No prescriptions have been created yet."}

            </p>

          </div>

        ) : (

          <div className="prescription-table-wrapper">

            <table className="prescription-table">

              <thead>

                <tr>

                  {role !== "patient" && (
                    <th>
                      Patient
                    </th>
                  )}

                  <th>
                    Doctor
                  </th>

                  <th>
                    Diagnosis
                  </th>

                  <th>
                    Medicines
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredPrescriptions.map(
                  (prescription) => (

                    <tr
                      key={
                        prescription._id
                      }
                    >

                      {/* PATIENT */}

                      {role !== "patient" && (

                        <td>

                          <div className="patient-cell">

                            <div className="patient-mini-avatar">

                              {getPatientName(
                                prescription
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>

                            <span>

                              {getPatientName(
                                prescription
                              )}

                            </span>

                          </div>

                        </td>

                      )}


                      {/* DOCTOR */}

                      <td>

                        {getDoctorName(
                          prescription
                        )}

                      </td>


                      {/* DIAGNOSIS */}

                      <td>

                        <span className="diagnosis-badge">

                          {getDiagnosis(
                            prescription
                          )}

                        </span>

                      </td>


                      {/* MEDICINES */}

                      <td>

                        <span className="medicine-count">

                          {getMedicineCount(
                            prescription
                          )}

                        </span>

                      </td>


                      {/* DATE */}

                      <td>

                        {formatDate(
                          prescription.prescribedDate ||
                            prescription.createdAt
                        )}

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="prescription-actions">

                          <button
                            type="button"
                            className="view-prescription-btn"
                            onClick={() =>
                              setSelectedPrescription(
                                prescription
                              )
                            }
                            title="View Prescription"
                          >

                            <FaEye />

                          </button>


                          {(role === "doctor" ||
                            role === "admin") && (

                            <button
                              type="button"
                              className="delete-prescription-btn"
                              onClick={() =>
                                handleDelete(
                                  prescription._id
                                )
                              }
                              title="Delete Prescription"
                            >

                              <FaTrash />

                            </button>

                          )}

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ==================================================
          VIEW PRESCRIPTION MODAL
          ================================================== */}

      {selectedPrescription && (

        <div
          className="prescription-modal-overlay"
          onClick={() =>
            setSelectedPrescription(
              null
            )
          }
        >

          <div
            className="prescription-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* MODAL HEADER */}

            <div className="prescription-modal-header">

              <div>

                <h2>
                  Prescription Details
                </h2>

                <p>
                  Patient prescription information
                </p>

              </div>


              <button
                type="button"
                className="prescription-modal-close"
                onClick={() =>
                  setSelectedPrescription(
                    null
                  )
                }
              >

                <FaXmark />

              </button>

            </div>


            {/* MODAL BODY */}

            <div className="prescription-modal-body">


              {/* PATIENT / DOCTOR */}

              <div className="prescription-info-grid">

                {role !== "patient" && (

                  <div className="prescription-info-box">

                    <span>
                      Patient
                    </span>

                    <strong>

                      {getPatientName(
                        selectedPrescription
                      )}

                    </strong>

                  </div>

                )}


                <div className="prescription-info-box">

                  <span>
                    Doctor
                  </span>

                  <strong>

                    {getDoctorName(
                      selectedPrescription
                    )}

                  </strong>

                </div>


                <div className="prescription-info-box">

                  <span>
                    Diagnosis
                  </span>

                  <strong>

                    {getDiagnosis(
                      selectedPrescription
                    )}

                  </strong>

                </div>


                <div className="prescription-info-box">

                  <span>
                    Date
                  </span>

                  <strong>

                    {formatDate(
                      selectedPrescription.prescribedDate ||
                        selectedPrescription.createdAt
                    )}

                  </strong>

                </div>

              </div>


              {/* MEDICINES */}

              <div className="medicines-section">

                <h3>
                  Medicines
                </h3>


                {selectedPrescription.medicines?.map(
                  (medicine, index) => (

                    <div
                      className="medicine-card"
                      key={index}
                    >

                      <div className="medicine-number">

                        {index + 1}

                      </div>


                      <div className="medicine-details">

                        <h4>

                          {medicine.medicineName}

                        </h4>


                        <div className="medicine-grid">

                          <div>

                            <span>
                              Dosage
                            </span>

                            <strong>

                              {medicine.dosage ||
                                "-"}

                            </strong>

                          </div>


                          <div>

                            <span>
                              Frequency
                            </span>

                            <strong>

                              {medicine.frequency ||
                                "-"}

                            </strong>

                          </div>


                          <div>

                            <span>
                              Duration
                            </span>

                            <strong>

                              {medicine.duration ||
                                "-"}

                            </strong>

                          </div>

                        </div>


                        {medicine.instructions && (

                          <div className="medicine-instructions">

                            <span>
                              Instructions
                            </span>

                            <p>

                              {medicine.instructions}

                            </p>

                          </div>

                        )}

                      </div>

                    </div>

                  )
                )}

              </div>


              {/* DOCTOR NOTES */}

              {selectedPrescription.notes && (

                <div className="prescription-notes">

                  <h3>
                    Doctor's Notes
                  </h3>

                  <p>

                    {selectedPrescription.notes}

                  </p>

                </div>

              )}

            </div>


            {/* MODAL FOOTER */}

            <div className="prescription-modal-footer">

              <button
                type="button"
                onClick={() =>
                  setSelectedPrescription(
                    null
                  )
                }
                className="close-prescription-btn"
              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}


export default Prescriptions;