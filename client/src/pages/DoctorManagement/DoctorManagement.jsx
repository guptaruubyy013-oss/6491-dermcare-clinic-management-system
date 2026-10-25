import React, { useEffect, useState } from "react";
import {
  FaUserDoctor,
  FaPlus,
  FaMagnifyingGlass,
  FaPen,
  FaTrash,
  FaEye,
  FaXmark,
  FaRotate,
} from "react-icons/fa6";

import API from "../../api/axios";
import "./DoctorManagement.css";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  qualification: "",
  experience: "",
  consultationFee: "",
  licenseNumber: "",
};

const DoctorManagement = ({ onBack }) => {
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [showView, setShowView] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [selectedDoctor, setSelectedDoctor] =
    useState(null);

  const [formData, setFormData] =
    useState(emptyForm);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // ==================================================
  // GET AUTH TOKEN
  // ==================================================

  const getToken = () => {
    return (
      localStorage.getItem(
        "dermcare_token"
      ) ||
      localStorage.getItem("token") ||
      sessionStorage.getItem(
        "dermcare_token"
      ) ||
      sessionStorage.getItem("token") ||
      ""
    );
  };

  // ==================================================
  // AUTH CONFIG
  // ==================================================

  const getAuthConfig = () => {
    const token = getToken();

    if (!token) {
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // ==================================================
  // LOAD DOCTORS
  // ==================================================

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const token = getToken();

      if (!token) {
        setDoctors([]);

        setError(
          "Your login session is missing. Please logout and login again."
        );

        return;
      }

      const response =
        await API.get(
          "/admin/doctors",
          getAuthConfig()
        );

      const doctorList =
        response.data?.doctors ||
        response.data ||
        [];

      setDoctors(
        Array.isArray(doctorList)
          ? doctorList
          : []
      );
    } catch (err) {
      console.error(
        "Error loading doctors:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your login session has expired. Please logout and login again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "You do not have permission to manage doctors."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load doctors."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ==================================================
  // HANDLE FORM INPUT
  // ==================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // ==================================================
  // OPEN ADD FORM
  // ==================================================

  const openAddForm = () => {
    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

    setShowForm(true);
    setShowView(false);

    setError("");
    setMessage("");
  };

  // ==================================================
  // OPEN EDIT FORM
  // ==================================================

  const openEditForm = (doctor) => {
    setEditingId(
      doctor?._id || null
    );

    setFormData({
      name:
        doctor?.name || "",

      email:
        doctor?.email ||
        doctor?.user?.email ||
        "",

      phone:
        doctor?.phone ||
        doctor?.user?.phone ||
        "",

      specialization:
        doctor?.specialization ||
        "",

      qualification:
        doctor?.qualification ||
        doctor?.qualifications ||
        "",

      experience:
        doctor?.experience ??
        doctor?.experienceYears ??
        "",

      consultationFee:
        doctor?.consultationFee ??
        "",

      licenseNumber:
        doctor?.licenseNumber ||
        "",
    });

    setShowForm(true);
    setShowView(false);

    setError("");
    setMessage("");
  };

  // ==================================================
  // VIEW DOCTOR
  // ==================================================

  const openViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);

    setShowView(true);
    setShowForm(false);

    setError("");
    setMessage("");
  };

  // ==================================================
  // CLOSE MODALS
  // ==================================================

  const closeModal = () => {
    setShowForm(false);
    setShowView(false);

    setSelectedDoctor(null);
    setEditingId(null);

    setFormData({
      ...emptyForm,
    });

    setError("");
  };

  // ==================================================
  // SAVE DOCTOR
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    // ----------------------------------------------
    // VALIDATION
    // ----------------------------------------------

    if (!formData.name.trim()) {
      setError(
        "Doctor name is required."
      );
      return;
    }

    if (!formData.email.trim()) {
      setError(
        "Email is required."
      );
      return;
    }

    if (!formData.phone.trim()) {
      setError(
        "Phone number is required."
      );
      return;
    }

    if (
      !formData.specialization.trim()
    ) {
      setError(
        "Specialization is required."
      );
      return;
    }

    // ----------------------------------------------
    // CHECK TOKEN
    // ----------------------------------------------

    const token = getToken();

    if (!token) {
      setError(
        "Your login session is missing. Please logout and login again."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name:
          formData.name.trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        phone:
          formData.phone.trim(),

        specialization:
          formData.specialization.trim(),

        qualification:
          formData.qualification.trim(),

        experience:
          Number(
            formData.experience || 0
          ),

        experienceYears:
          Number(
            formData.experience || 0
          ),

        consultationFee:
          Number(
            formData.consultationFee ||
              0
          ),

        licenseNumber:
          formData.licenseNumber.trim(),
      };

      // --------------------------------------------
      // UPDATE DOCTOR
      // --------------------------------------------

      if (editingId) {
        await API.put(
          `/admin/doctors/${editingId}`,
          payload,
          getAuthConfig()
        );

        setMessage(
          "Doctor updated successfully."
        );
      }

      // --------------------------------------------
      // ADD DOCTOR
      // --------------------------------------------

      else {
        await API.post(
          "/admin/doctors",
          payload,
          getAuthConfig()
        );

        setMessage(
          "Doctor added successfully."
        );
      }

      // --------------------------------------------
      // REFRESH DOCTORS
      // --------------------------------------------

      await fetchDoctors();

      setShowForm(false);
      setEditingId(null);

      setFormData({
        ...emptyForm,
      });
    } catch (err) {
      console.error(
        "Doctor save error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your login session has expired. Please logout and login again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "Only an admin can add or update doctors."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to save doctor."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // DELETE DOCTOR
  // ==================================================

  const handleDelete = async (doctor) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${doctor.name}?`
      );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setError(
        "Your login session is missing. Please logout and login again."
      );
      return;
    }

    try {
      setError("");
      setMessage("");

      await API.delete(
        `/admin/doctors/${doctor._id}`,
        getAuthConfig()
      );

      setMessage(
        "Doctor deleted successfully."
      );

      await fetchDoctors();
    } catch (err) {
      console.error(
        "Doctor delete error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your login session has expired. Please logout and login again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "Only an admin can delete doctors."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to delete doctor."
        );
      }
    }
  };

  // ==================================================
  // SEARCH
  // ==================================================

  const filteredDoctors =
    doctors.filter((doctor) => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return true;
      }

      return (
        doctor.name
          ?.toLowerCase()
          .includes(searchText) ||

        doctor.email
          ?.toLowerCase()
          .includes(searchText) ||

        doctor.user?.email
          ?.toLowerCase()
          .includes(searchText) ||

        doctor.specialization
          ?.toLowerCase()
          .includes(searchText) ||

        doctor.phone
          ?.toLowerCase()
          .includes(searchText)
      );
    });

  // ==================================================
  // MAIN PAGE
  // ==================================================

  return (
    <div className="doctor-management-page">

      <div className="doctor-management-container">

        {/* HEADER */}

        <div className="doctor-management-header">

          <div>

            {onBack && (
              <button
                type="button"
                className="doctor-back-button"
                onClick={onBack}
              >
                ← Back to Dashboard
              </button>
            )}

            <div className="doctor-management-title">

              <div className="doctor-management-title-icon">
                <FaUserDoctor />
              </div>

              <div>

                <span>
                  ADMIN MANAGEMENT
                </span>

                <h1>
                  Manage Doctors
                </h1>

                <p>
                  Add, view, edit and manage
                  DermCare doctors.
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            className="doctor-add-button"
            onClick={openAddForm}
          >
            <FaPlus />
            Add Doctor
          </button>

        </div>

        {/* MESSAGE */}

        {message && (
          <div className="doctor-success">
            {message}
          </div>
        )}

        {error &&
          !showForm &&
          !showView && (
            <div className="doctor-error">
              {error}
            </div>
          )}

        {/* SEARCH / REFRESH */}

        <div className="doctor-toolbar">

          <div className="doctor-search">

            <FaMagnifyingGlass />

            <input
              type="text"
              placeholder="Search doctor by name, email, phone or specialization..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <button
            type="button"
            className="doctor-refresh-button"
            onClick={fetchDoctors}
            disabled={loading}
          >
            <FaRotate />
            Refresh
          </button>

        </div>

        {/* COUNT */}

        <div className="doctor-list-header">

          <div>

            <h2>
              Doctors
            </h2>

            <p>
              {filteredDoctors.length}{" "}
              doctor
              {filteredDoctors.length !==
              1
                ? "s"
                : ""}{" "}
              found
            </p>

          </div>

        </div>

        {/* DOCTORS */}

        {loading ? (
          <div className="doctor-empty">
            Loading doctors...
          </div>
        ) : filteredDoctors.length ===
          0 ? (
          <div className="doctor-empty">

            <FaUserDoctor />

            <h3>
              No doctors found
            </h3>

            <p>
              Add a doctor or change your
              search.
            </p>

          </div>
        ) : (
          <div className="doctor-grid">

            {filteredDoctors.map(
              (doctor) => (
                <div
                  className="doctor-card"
                  key={doctor._id}
                >

                  {/* CARD TOP */}

                  <div className="doctor-card-top">

                    <div className="doctor-avatar">
                      <FaUserDoctor />
                    </div>

                    <div className="doctor-card-name">

                      <h3>
                        {doctor.name}
                      </h3>

                      <span>
                        {doctor.specialization ||
                          "Dermatologist"}
                      </span>

                    </div>

                    <span
                      className={`doctor-status ${
                        doctor.isAvailable !==
                        false
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {doctor.isAvailable !==
                      false
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  {/* CARD DETAILS */}

                  <div className="doctor-card-details">

                    <div>

                      <span>
                        Qualification
                      </span>

                      <strong>
                        {doctor.qualification ||
                          doctor.qualifications ||
                          "Not specified"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Experience
                      </span>

                      <strong>
                        {doctor.experience ??
                          doctor.experienceYears ??
                          0}{" "}
                        Years
                      </strong>

                    </div>

                    <div>

                      <span>
                        Consultation Fee
                      </span>

                      <strong>
                        ₹
                        {Number(
                          doctor.consultationFee ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Phone
                      </span>

                      <strong>
                        {doctor.phone ||
                          doctor.user?.phone ||
                          "Not available"}
                      </strong>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="doctor-card-actions">

                    <button
                      type="button"
                      className="doctor-view-button"
                      onClick={() =>
                        openViewDoctor(
                          doctor
                        )
                      }
                    >
                      <FaEye />
                      View
                    </button>

                    <button
                      type="button"
                      className="doctor-edit-button"
                      onClick={() =>
                        openEditForm(
                          doctor
                        )
                      }
                    >
                      <FaPen />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="doctor-delete-button"
                      onClick={() =>
                        handleDelete(
                          doctor
                        )
                      }
                    >
                      <FaTrash />
                      Delete
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {showForm && (
        <div className="doctor-modal-overlay">

          <div className="doctor-modal">

            <div className="doctor-modal-header">

              <div>

                <span>
                  {editingId
                    ? "EDIT DOCTOR"
                    : "NEW DOCTOR"}
                </span>

                <h2>
                  {editingId
                    ? "Edit Doctor"
                    : "Add Doctor"}
                </h2>

              </div>

              <button
                type="button"
                onClick={closeModal}
                className="doctor-modal-close"
              >
                <FaXmark />
              </button>

            </div>

            {error && (
              <div className="doctor-error">
                {error}
              </div>
            )}

            <form
              className="doctor-form"
              onSubmit={handleSubmit}
            >

              <div className="doctor-form-grid">

                <div className="doctor-form-group">

                  <label>
                    Doctor Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="e.g. Dr. Neha Yadav"
                  />

                </div>

                <div className="doctor-form-group">

                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="doctor@dermcare.com"
                  />

                </div>

                <div className="doctor-form-group">

                  <label>
                    Phone *
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter phone number"
                  />

                </div>

                <div className="doctor-form-group">

                  <label>
                    Specialization *
                  </label>

                  <input
                    type="text"
                    name="specialization"
                    value={
                      formData.specialization
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Dermatologist"
                  />

                </div>

                <div className="doctor-form-group">

                  <label>
                    Qualification
                  </label>

                  <input
                    type="text"
                    name="qualification"
                    value={
                      formData.qualification
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="MBBS, MD (Dermatology)"
                  />

                </div>

                <div className="doctor-form-group">

                  <label>
                    Experience (Years)
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="experience"
                    value={
                      formData.experience
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="5"
                  />

                </div>

                <div className="doctor-form-group">

                  <label>
                    Consultation Fee (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="consultationFee"
                    value={
                      formData.consultationFee
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="800"
                  />

                </div>

                <div className="doctor-form-group">

                  <label>
                    License Number
                  </label>

                  <input
                    type="text"
                    name="licenseNumber"
                    value={
                      formData.licenseNumber
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="DOC-123456"
                  />

                </div>

              </div>

              <div className="doctor-form-note">

                <strong>
                  Default Login Password:
                </strong>{" "}
                Doctor@123

              </div>

              <div className="doctor-form-actions">

                <button
                  type="button"
                  className="doctor-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="doctor-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Doctor"
                    : "Add Doctor"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==================================================
          VIEW DOCTOR MODAL
      ================================================== */}

      {showView &&
        selectedDoctor && (
          <div className="doctor-modal-overlay">

            <div className="doctor-modal doctor-view-modal">

              <div className="doctor-modal-header">

                <div>

                  <span>
                    DOCTOR DETAILS
                  </span>

                  <h2>
                    {selectedDoctor.name}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="doctor-modal-close"
                >
                  <FaXmark />
                </button>

              </div>

              <div className="doctor-view-content">

                <div className="doctor-view-avatar">
                  <FaUserDoctor />
                </div>

                <h3>
                  {selectedDoctor.name}
                </h3>

                <p>
                  {
                    selectedDoctor.specialization
                  }
                </p>

                <div className="doctor-view-grid">

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {selectedDoctor.email ||
                        selectedDoctor.user
                          ?.email ||
                        "Not available"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Phone
                    </span>

                    <strong>
                      {selectedDoctor.phone ||
                        selectedDoctor.user
                          ?.phone ||
                        "Not available"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Qualification
                    </span>

                    <strong>
                      {selectedDoctor.qualification ||
                        selectedDoctor.qualifications ||
                        "Not specified"}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Experience
                    </span>

                    <strong>
                      {selectedDoctor.experience ??
                        selectedDoctor.experienceYears ??
                        0}{" "}
                      Years
                    </strong>

                  </div>

                  <div>

                    <span>
                      Consultation Fee
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedDoctor.consultationFee ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  <div>

                    <span>
                      License Number
                    </span>

                    <strong>
                      {selectedDoctor.licenseNumber ||
                        "Not available"}
                    </strong>

                  </div>

                </div>

                <div className="doctor-availability-box">

                  <span>
                    Availability
                  </span>

                  <strong>
                    {selectedDoctor.isAvailable !==
                    false
                      ? "Active"
                      : "Inactive"}
                  </strong>

                  <p>
                    {selectedDoctor.availableDays?.join(
                      ", "
                    ) ||
                      "Monday to Saturday"}
                  </p>

                </div>

                <button
                  type="button"
                  className="doctor-edit-full-button"
                  onClick={() =>
                    openEditForm(
                      selectedDoctor
                    )
                  }
                >
                  <FaPen />
                  Edit Doctor
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default DoctorManagement;