import React, {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import API from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "./Appointment.css";

const Appointment = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [doctors, setDoctors] = useState([]);
  const [selectedService, setSelectedService] =
    useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    doctorId: "",
    doctorName: "",
    concern: "General Consultation",
    date: "",
    timeSlot: "",
    notes: "",
  });

  const [loadingDoctors, setLoadingDoctors] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==================================================
  // GET SELECTED SERVICE / PROCEDURE
  // ==================================================

  useEffect(() => {
    const serviceFromState =
      location.state?.selectedProcedure ||
      location.state?.service ||
      null;

    const params = new URLSearchParams(
      location.search
    );

    const serviceNameFromUrl =
      params.get("serviceName") ||
      params.get("service") ||
      "";

    const servicePriceFromUrl =
      params.get("servicePrice") ||
      params.get("price") ||
      "";

    const serviceIdFromUrl =
      params.get("serviceId") ||
      params.get("id") ||
      "";

    if (serviceFromState) {
      const serviceName =
        serviceFromState.name ||
        serviceFromState.title ||
        serviceFromState.serviceName ||
        "Selected Service";

      const servicePrice =
        serviceFromState.price ??
        serviceFromState.consultationFee ??
        serviceFromState.amount ??
        "";

      const serviceId =
        serviceFromState._id ||
        serviceFromState.id ||
        serviceFromState.serviceId ||
        "";

      const serviceDescription =
        serviceFromState.description ||
        serviceFromState.desc ||
        "";

      setSelectedService({
        id: serviceId,
        name: serviceName,
        price: servicePrice,
        description: serviceDescription,
      });

      setFormData((prev) => ({
        ...prev,
        concern: serviceName,
      }));

      return;
    }

    if (serviceNameFromUrl) {
      setSelectedService({
        id: serviceIdFromUrl,
        name: serviceNameFromUrl,
        price: servicePriceFromUrl,
        description: "",
      });

      setFormData((prev) => ({
        ...prev,
        concern: serviceNameFromUrl,
      }));
    }
  }, [
    location.state,
    location.search,
  ]);

  // ==================================================
  // CHECK USER ROLE
  // ==================================================

  useEffect(() => {
    if (!user) {
      setFormData((prev) => ({
        ...prev,
        patientName: "",
        email: "",
        phone: "",
        doctorId: "",
        doctorName: "",
      }));

      setDoctors([]);
      setError(
        "Please login or register as a patient before booking an appointment."
      );

      return;
    }

    // ----------------------------------------------
    // ONLY PATIENT CAN USE THIS BOOKING PAGE
    // ----------------------------------------------

    if (user.role !== "patient") {
      setError(
        "Only registered patients can book an appointment from this page."
      );

      setFormData((prev) => ({
        ...prev,
        patientName: "",
        email: "",
        phone: "",
        doctorId: "",
        doctorName: "",
      }));

      return;
    }

    setError("");

    setFormData((prev) => ({
      ...prev,

      patientName:
        user.name || "",

      email:
        user.email || "",

      phone:
        user.phone || "",
    }));
  }, [user]);

  // ==================================================
  // LOAD DOCTORS
  // ONLY AFTER PATIENT LOGIN
  // ==================================================

  useEffect(() => {
    const fetchDoctors = async () => {
      // --------------------------------------------
      // DO NOT CALL PROTECTED API WITHOUT LOGIN
      // --------------------------------------------

      if (!user || user.role !== "patient") {
        setDoctors([]);
        setLoadingDoctors(false);
        return;
      }

      try {
        setLoadingDoctors(true);
        setError("");

        const response =
          await API.get("/admin/doctors");

        const doctorList =
          response.data?.doctors ||
          [];

        setDoctors(doctorList);

        // --------------------------------------------
        // SELECT FIRST REAL DOCTOR
        // --------------------------------------------

        if (doctorList.length > 0) {
          const firstDoctor =
            doctorList[0];

          const firstDoctorUserId =
            firstDoctor?.user?._id ||
            firstDoctor?.user?.id ||
            "";

          if (firstDoctorUserId) {
            setFormData((prev) => ({
              ...prev,

              doctorId:
                firstDoctorUserId,

              doctorName:
                firstDoctor?.name ||
                firstDoctor?.user?.name ||
                "",
            }));
          }
        }
      } catch (err) {
        console.error(
          "Error loading doctors:",
          err
        );

        setDoctors([]);

        const status =
          err.response?.status;

        if (status === 401) {
          setError(
            "Your login session has expired. Please login again."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load doctors. Please refresh the page."
          );
        }
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [user]);

  // ==================================================
  // HANDLE INPUT CHANGE
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

    setMessage("");

    if (user?.role === "patient") {
      setError("");
    }
  };

  // ==================================================
  // HANDLE DOCTOR CHANGE
  // ==================================================

  const handleDoctorChange = (e) => {
    const selectedUserId =
      e.target.value;

    const selectedDoctor =
      doctors.find(
        (doctor) =>
          (
            doctor?.user?._id ||
            doctor?.user?.id ||
            ""
          ) === selectedUserId
      );

    setFormData((prev) => ({
      ...prev,

      doctorId:
        selectedUserId,

      doctorName:
        selectedDoctor?.name ||
        selectedDoctor?.user?.name ||
        "",
    }));

    setMessage("");
    setError("");
  };

  // ==================================================
  // NOTES VALIDATION
  // ==================================================

  const sanitizeNotes = (value) => {
    return value.replace(
      /[^a-zA-Z0-9\s.,!?'"()\-/:;%+#@&]/g,
      ""
    );
  };

  const validateNotes = (value) => {
    const regex =
      /^[a-zA-Z0-9\s.,!?'"()\-/:;%+#@&]*$/;

    return regex.test(value);
  };

  const handleNotesChange = (e) => {
    const value =
      e.target.value;

    const cleanedValue =
      sanitizeNotes(value);

    setFormData((prev) => ({
      ...prev,

      notes:
        cleanedValue,
    }));

    setMessage("");
    setError("");
  };

  // ==================================================
  // GO TO LOGIN / REGISTER
  // ==================================================

  const handleLoginRegister = () => {
    navigate("/register");
  };

  // ==================================================
  // SUBMIT APPOINTMENT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // ----------------------------------------------
    // CHECK LOGIN
    // ----------------------------------------------

    const patientId =
      user?._id ||
      user?.id ||
      user?.userId ||
      null;

    if (!patientId) {
      setError(
        "Please login or register before booking an appointment."
      );

      return;
    }

    // ----------------------------------------------
    // ONLY PATIENT ROLE CAN BOOK
    // ----------------------------------------------

    if (user?.role !== "patient") {
      setError(
        "Only users with a patient account can book an appointment."
      );

      return;
    }

    // ----------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------

    if (!formData.patientName.trim()) {
      setError(
        "Please enter patient name."
      );

      return;
    }

    if (!formData.email.trim()) {
      setError(
        "Please enter email."
      );

      return;
    }

    if (!formData.phone.trim()) {
      setError(
        "Please enter phone number."
      );

      return;
    }

    if (!formData.doctorName.trim()) {
      setError(
        "Please select a doctor."
      );

      return;
    }

    if (!formData.doctorId) {
      setError(
        "Please select a valid doctor."
      );

      return;
    }

    if (!formData.date) {
      setError(
        "Please select appointment date."
      );

      return;
    }

    if (!formData.timeSlot) {
      setError(
        "Please select appointment time."
      );

      return;
    }

    if (!formData.concern.trim()) {
      setError(
        "Please enter appointment concern."
      );

      return;
    }

    if (
      !validateNotes(
        formData.notes
      )
    ) {
      setError(
        "Notes contain unsupported special characters. Please use simple text."
      );

      return;
    }

    // ==================================================
    // APPOINTMENT PAYLOAD
    // ==================================================

    const payload = {
      patient:
        patientId,

      patientId:
        patientId,

      patientName:
        formData.patientName,

      name:
        formData.patientName,

      email:
        formData.email,

      phone:
        formData.phone,

      doctor:
        formData.doctorId,

      doctorId:
        formData.doctorId,

      doctorName:
        formData.doctorName,

      concern:
        formData.concern,

      date:
        formData.date,

      timeSlot:
        formData.timeSlot,

      notes:
        formData.notes || "",

      serviceId:
        selectedService?.id ||
        null,

      serviceName:
        selectedService?.name ||
        null,

      servicePrice:
        selectedService?.price !== "" &&
        selectedService?.price !==
          undefined &&
        selectedService?.price !==
          null
          ? Number(
              selectedService.price
            )
          : null,
    };

    console.log(
      "Booking appointment payload:",
      payload
    );

    try {
      setSubmitting(true);

      const response =
        await API.post(
          "/appointments",
          payload
        );

      console.log(
        "Appointment created:",
        response.data
      );

      setMessage(
        "Appointment booked successfully! The selected doctor can now see this appointment in the Doctor Dashboard."
      );

      setFormData((prev) => ({
        ...prev,

        date:
          "",

        timeSlot:
          "",

        notes:
          "",

        concern:
          selectedService?.name ||
          "General Consultation",
      }));
    } catch (err) {
      console.error(
        "Appointment booking error:",
        err
      );

      const status =
        err.response?.status;

      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "";

      if (status === 409) {
        setError(
          serverMessage ||
            "This doctor already has an appointment at this time. Please choose another time."
        );
      } else if (status === 400) {
        setError(
          serverMessage ||
            "Invalid appointment details. Please check your information."
        );
      } else if (status === 401) {
        setError(
          "Session expired. Please login again."
        );
      } else if (status === 403) {
        setError(
          serverMessage ||
            "You are not allowed to book an appointment."
        );
      } else if (status === 404) {
        setError(
          serverMessage ||
            "Doctor or appointment service was not found."
        );
      } else {
        setError(
          serverMessage ||
            "Something went wrong while booking the appointment."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ==================================================
  // TODAY'S DATE
  // ==================================================

  const today =
    new Date()
      .toISOString()
      .split("T")[0];

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="appointment-page">

      {/* HEADER */}

      <div className="appointment-header">

        <button
          type="button"
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

        <h1>
          Book an Appointment
        </h1>

        <p>
          Schedule your consultation
          with our experienced
          dermatologists.
        </p>

      </div>

      <div className="appointment-container">

        {/* LOGIN REQUIRED */}

        {!user && (
          <div className="appointment-error">

            <p>
              Please login or register
              as a patient before booking
              an appointment.
            </p>

            <button
              type="button"
              onClick={
                handleLoginRegister
              }
              className="login-register-btn"
            >
              Login / Register
            </button>

          </div>
        )}

        {/* NON-PATIENT WARNING */}

        {user &&
          user.role !== "patient" && (
            <div className="appointment-error">

              <p>
                You are logged in as{" "}
                <strong>
                  {user.role}
                </strong>
                . Only patient accounts
                can book appointments
                from this page.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/dashboard"
                  )
                }
                className="login-register-btn"
              >
                Go to Dashboard
              </button>

            </div>
          )}

        {/* SELECTED SERVICE */}

        {selectedService && (
          <div className="selected-service-card">

            <div>

              <span className="selected-label">
                Selected Service
              </span>

              <h3>
                {selectedService.name}
              </h3>

              {selectedService.description && (
                <p>
                  {
                    selectedService.description
                  }
                </p>
              )}

              {selectedService.price !==
                "" &&
                selectedService.price !==
                  null &&
                selectedService.price !==
                  undefined && (
                  <strong>
                    Consultation Price: ₹
                    {Number(
                      selectedService.price
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                )}

            </div>

            <div className="service-note">
              Your selected procedure
              will be added to your
              appointment.
            </div>

          </div>
        )}

        {/* FORM */}

        <form
          className="appointment-form"
          onSubmit={handleSubmit}
        >

          {/* PATIENT INFORMATION */}

          <section className="appointment-section">

            <h2>
              Patient Information
            </h2>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Patient Name *
                </label>

                <input
                  type="text"
                  name="patientName"
                  value={
                    formData.patientName
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter patient name"
                  disabled={
                    user?.role !== "patient"
                  }
                />

              </div>

              <div className="form-group">

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
                  placeholder="Enter email"
                  disabled={
                    user?.role !== "patient"
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Phone *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter phone number"
                  disabled={
                    user?.role !== "patient"
                  }
                />

              </div>

            </div>

          </section>

          {/* DOCTOR SELECTION */}

          <section className="appointment-section">

            <h2>
              Doctor Selection
            </h2>

            <div className="form-group">

              <label>
                Select Doctor *
              </label>

              <select
                name="doctorId"
                value={
                  formData.doctorId
                }
                onChange={
                  handleDoctorChange
                }
                disabled={
                  loadingDoctors ||
                  doctors.length === 0 ||
                  user?.role !== "patient"
                }
              >

                <option value="">
                  {!user
                    ? "Login to view doctors"
                    : loadingDoctors
                    ? "Loading doctors..."
                    : doctors.length === 0
                    ? "No doctors available"
                    : "Select a doctor"}
                </option>

                {doctors.map(
                  (doctor) => {

                    const doctorUserId =
                      doctor?.user?._id ||
                      doctor?.user?.id ||
                      "";

                    const doctorName =
                      doctor?.name ||
                      doctor?.user?.name ||
                      "Doctor";

                    const specialization =
                      doctor?.specialization ||
                      "Dermatologist";

                    if (!doctorUserId) {
                      return null;
                    }

                    return (
                      <option
                        key={
                          doctorUserId
                        }
                        value={
                          doctorUserId
                        }
                      >
                        {doctorName} -{" "}
                        {
                          specialization
                        }
                      </option>
                    );
                  }
                )}

              </select>

            </div>

          </section>

          {/* APPOINTMENT DETAILS */}

          <section className="appointment-section">

            <h2>
              Appointment Details
            </h2>

            <div className="form-grid">

              <div className="form-group">

                <label>
                  Appointment Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={
                    formData.date
                  }
                  onChange={
                    handleChange
                  }
                  min={today}
                  disabled={
                    user?.role !== "patient"
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Time Slot *
                </label>

                <select
                  name="timeSlot"
                  value={
                    formData.timeSlot
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    user?.role !== "patient"
                  }
                >

                  <option value="">
                    Select time
                  </option>

                  <option value="10:00 AM">
                    10:00 AM
                  </option>

                  <option value="11:00 AM">
                    11:00 AM
                  </option>

                  <option value="12:00 PM">
                    12:00 PM
                  </option>

                  <option value="02:00 PM">
                    02:00 PM
                  </option>

                  <option value="03:00 PM">
                    03:00 PM
                  </option>

                  <option value="04:00 PM">
                    04:00 PM
                  </option>

                  <option value="05:00 PM">
                    05:00 PM
                  </option>

                  <option value="06:00 PM">
                    06:00 PM
                  </option>

                </select>

              </div>

              <div className="form-group full-width">

                <label>
                  Appointment Type
                </label>

                <input
                  type="text"
                  value={
                    selectedService?.name ||
                    "Consultation Only"
                  }
                  readOnly
                />

              </div>

            </div>

          </section>

          {/* ADDITIONAL INFORMATION */}

          <section className="appointment-section">

            <h2>
              Additional Information
            </h2>

            <div className="form-group">

              <label>
                Notes / Concern
              </label>

              <textarea
                name="notes"
                value={
                  formData.notes
                }
                onChange={
                  handleNotesChange
                }
                placeholder="Tell us about your skin or hair concern..."
                rows="5"
                disabled={
                  user?.role !== "patient"
                }
              />

              <small>
                Please use simple text
                and standard
                punctuation.
              </small>

            </div>

          </section>

          {/* ERROR */}

          {error && (
            <div className="appointment-error">

              <p>
                {error}
              </p>

              {!user && (
                <button
                  type="button"
                  onClick={
                    handleLoginRegister
                  }
                  className="login-register-btn"
                >
                  Login / Register
                </button>
              )}

            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <div className="appointment-success">
              {message}
            </div>
          )}

          {/* SUBMIT */}

          <div className="appointment-submit">

            <button
              type="submit"
              disabled={
                submitting ||
                loadingDoctors ||
                doctors.length === 0 ||
                user?.role !== "patient"
              }
            >
              {submitting
                ? "Booking..."
                : "Confirm & Book Slot"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default Appointment;