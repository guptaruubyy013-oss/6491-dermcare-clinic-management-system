import React, { useEffect, useState } from "react";
import {
  FaMagnifyingGlass,
  FaRotate,
  FaEye,
  FaPen,
  FaTrash,
  FaXmark,
} from "react-icons/fa6";

import API from "../../api/axios";
import "./AdminAppointmentManagement.css";

const AdminAppointmentManagement = ({ onBack }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [editingAppointment, setEditingAppointment] =
    useState(null);

  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const statuses = [
    "Confirmed",
    "Checked-In",
    "In-Consultation",
    "Completed",
    "Checked-Out",
    "Cancelled",
  ];

  // =====================================================
  // FETCH APPOINTMENTS
  // =====================================================

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/appointments");

      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error("Fetch appointments error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredAppointments = appointments.filter(
    (appointment) => {
      const searchText = search.toLowerCase();

      const patientName =
        appointment.patient?.name ||
        appointment.patientName ||
        appointment.name ||
        "";

      const patientEmail =
        appointment.patient?.email ||
        appointment.email ||
        "";

      const doctorName =
        appointment.doctor?.name ||
        appointment.doctorName ||
        "";

      const phone =
        appointment.patient?.phone ||
        appointment.phone ||
        "";

      const matchesSearch =
        patientName.toLowerCase().includes(searchText) ||
        patientEmail.toLowerCase().includes(searchText) ||
        doctorName.toLowerCase().includes(searchText) ||
        phone.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    }
  );

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEdit = (appointment) => {
    setEditingAppointment(appointment);

    setEditDate(appointment.date || "");
    setEditTime(appointment.timeSlot || "");
    setEditStatus(
      appointment.status || "Confirmed"
    );
  };

  // =====================================================
  // UPDATE APPOINTMENT
  // =====================================================

  const updateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      await API.put(
        `/appointments/${editingAppointment._id}`,
        {
          date: editDate,
          timeSlot: editTime,
          status: editStatus,
        }
      );

      alert("Appointment updated successfully.");

      setEditingAppointment(null);

      fetchAppointments();
    } catch (err) {
      console.error(
        "Update appointment error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to update appointment."
      );
    }
  };

  // =====================================================
  // CANCEL APPOINTMENT
  // =====================================================

  const cancelAppointment = async (appointment) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) return;

    try {
      await API.patch(
        `/appointments/${appointment._id}/cancel`
      );

      alert(
        "Appointment cancelled successfully."
      );

      fetchAppointments();
    } catch (err) {
      console.error(
        "Cancel appointment error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to cancel appointment."
      );
    }
  };

  // =====================================================
  // DELETE APPOINTMENT
  // =====================================================

  const deleteAppointment = async (appointment) => {
    const confirmDelete = window.confirm(
      "Delete this appointment permanently?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `/appointments/${appointment._id}`
      );

      alert(
        "Appointment deleted successfully."
      );

      fetchAppointments();
    } catch (err) {
      console.error(
        "Delete appointment error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Failed to delete appointment."
      );
    }
  };

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Confirmed":
        return "status-confirmed";

      case "Checked-In":
        return "status-checked";

      case "In-Consultation":
        return "status-consultation";

      case "Completed":
        return "status-completed";

      case "Checked-Out":
        return "status-checkout";

      case "Cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-appointment-page">
        <div className="appointment-loading">
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-appointment-page">

      {/* HEADER */}

      <div className="appointment-header">

        <div>
          <span className="appointment-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>
            Appointment Management
          </h1>

          <p>
            View and manage all clinic appointments.
          </p>
        </div>

        <div className="appointment-header-buttons">

          <button
            className="appointment-refresh-btn"
            onClick={fetchAppointments}
          >
            <FaRotate />
            Refresh
          </button>

          {onBack && (
            <button
              className="appointment-back-btn"
              onClick={onBack}
            >
              ← Back to Admin Dashboard
            </button>
          )}

        </div>

      </div>

      {/* STATS */}

      <div className="appointment-stats">

        <div className="appointment-stat-card">
          <span>Total</span>

          <strong>
            {appointments.length}
          </strong>
        </div>

        <div className="appointment-stat-card">
          <span>Confirmed</span>

          <strong>
            {
              appointments.filter(
                (a) => a.status === "Confirmed"
              ).length
            }
          </strong>
        </div>

        <div className="appointment-stat-card">
          <span>Completed</span>

          <strong>
            {
              appointments.filter(
                (a) => a.status === "Completed"
              ).length
            }
          </strong>
        </div>

        <div className="appointment-stat-card">
          <span>Cancelled</span>

          <strong>
            {
              appointments.filter(
                (a) => a.status === "Cancelled"
              ).length
            }
          </strong>
        </div>

      </div>

      {/* FILTERS */}

      <div className="appointment-filter-box">

        <div className="appointment-search">

          <FaMagnifyingGlass />

          <input
            type="text"
            placeholder="Search patient, doctor, phone or email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">
            All Status
          </option>

          {statuses.map((status) => (
            <option
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}
        </select>

      </div>

      {/* ERROR */}

      {error && (
        <div className="appointment-error">
          {error}
        </div>
      )}

      {/* TABLE */}

      <div className="appointment-table-card">

        {filteredAppointments.length === 0 ? (
          <div className="appointment-empty">

            <h3>
              No appointments found
            </h3>

            <p>
              There are no appointments matching
              your search or filter.
            </p>

          </div>
        ) : (
          <div className="appointment-table-wrapper">

            <table className="appointment-table">

              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Concern</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredAppointments.map(
                  (appointment) => {

                    const patientName =
                      appointment.patient?.name ||
                      appointment.patientName ||
                      appointment.name ||
                      "Patient";

                    const doctorName =
                      appointment.doctor?.name ||
                      appointment.doctorName ||
                      "Any Available Specialist";

                    return (
                      <tr
                        key={appointment._id}
                      >

                        <td>
                          <div className="patient-cell">

                            <strong>
                              {patientName}
                            </strong>

                            <small>
                              {appointment.email ||
                                appointment.patient?.email ||
                                appointment.phone ||
                                appointment.patient?.phone ||
                                ""}
                            </small>

                          </div>
                        </td>

                        <td>
                          {doctorName}
                        </td>

                        <td>
                          {appointment.date || "-"}
                        </td>

                        <td>
                          {appointment.timeSlot || "-"}
                        </td>

                        <td>
                          {appointment.concern ||
                            "General Consultation"}
                        </td>

                        <td>
                          <span
                            className={`appointment-status ${getStatusClass(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </td>

                        <td>

                          <div className="appointment-actions">

                            <button
                              className="action-view"
                              title="View"
                              onClick={() =>
                                setSelectedAppointment(
                                  appointment
                                )
                              }
                            >
                              <FaEye />
                            </button>

                            <button
                              className="action-edit"
                              title="Edit"
                              onClick={() =>
                                openEdit(
                                  appointment
                                )
                              }
                            >
                              <FaPen />
                            </button>

                            {appointment.status !==
                              "Cancelled" &&
                              appointment.status !==
                                "Completed" && (
                                <button
                                  className="action-cancel"
                                  title="Cancel"
                                  onClick={() =>
                                    cancelAppointment(
                                      appointment
                                    )
                                  }
                                >
                                  <FaXmark />
                                </button>
                              )}

                            <button
                              className="action-delete"
                              title="Delete"
                              onClick={() =>
                                deleteAppointment(
                                  appointment
                                )
                              }
                            >
                              <FaTrash />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* VIEW MODAL */}

      {selectedAppointment && (
        <div className="appointment-modal-overlay">

          <div className="appointment-modal">

            <div className="appointment-modal-header">

              <div>
                <span>
                  APPOINTMENT DETAILS
                </span>

                <h2>
                  Appointment Information
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedAppointment(null)
                }
              >
                <FaXmark />
              </button>

            </div>

            <div className="appointment-details-grid">

              <div>
                <label>Patient</label>

                <strong>
                  {selectedAppointment.patient?.name ||
                    selectedAppointment.patientName ||
                    selectedAppointment.name ||
                    "Patient"}
                </strong>
              </div>

              <div>
                <label>Phone</label>

                <strong>
                  {selectedAppointment.patient?.phone ||
                    selectedAppointment.phone ||
                    "-"}
                </strong>
              </div>

              <div>
                <label>Email</label>

                <strong>
                  {selectedAppointment.patient?.email ||
                    selectedAppointment.email ||
                    "-"}
                </strong>
              </div>

              <div>
                <label>Doctor</label>

                <strong>
                  {selectedAppointment.doctor?.name ||
                    selectedAppointment.doctorName ||
                    "Any Available Specialist"}
                </strong>
              </div>

              <div>
                <label>Date</label>

                <strong>
                  {selectedAppointment.date || "-"}
                </strong>
              </div>

              <div>
                <label>Time</label>

                <strong>
                  {selectedAppointment.timeSlot || "-"}
                </strong>
              </div>

              <div>
                <label>Concern</label>

                <strong>
                  {selectedAppointment.concern || "-"}
                </strong>
              </div>

              <div>
                <label>Status</label>

                <strong>
                  {selectedAppointment.status || "-"}
                </strong>
              </div>

              <div>
                <label>Consultation Fee</label>

                <strong>
                  ₹{selectedAppointment.consultationFee || 0}
                </strong>
              </div>

              <div>
                <label>Total Amount</label>

                <strong>
                  ₹{selectedAppointment.totalAmount || 0}
                </strong>
              </div>

              <div>
                <label>Payment Status</label>

                <strong>
                  {selectedAppointment.paymentStatus ||
                    "Unpaid"}
                </strong>
              </div>

              <div>
                <label>Invoice</label>

                <strong>
                  {selectedAppointment.invoiceNumber ||
                    "-"}
                </strong>
              </div>

            </div>

            {selectedAppointment.notes && (
              <div className="appointment-notes">

                <label>Notes</label>

                <p>
                  {selectedAppointment.notes}
                </p>

              </div>
            )}

            <div className="appointment-modal-footer">

              <button
                onClick={() =>
                  setSelectedAppointment(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* EDIT MODAL */}

      {editingAppointment && (
        <div className="appointment-modal-overlay">

          <div className="appointment-modal edit-modal">

            <div className="appointment-modal-header">

              <div>
                <span>
                  ADMIN ACTION
                </span>

                <h2>
                  Edit Appointment
                </h2>
              </div>

              <button
                onClick={() =>
                  setEditingAppointment(null)
                }
              >
                <FaXmark />
              </button>

            </div>

            <div className="edit-form">

              <div className="form-group">

                <label>
                  Appointment Date
                </label>

                <input
                  type="date"
                  value={editDate}
                  onChange={(e) =>
                    setEditDate(e.target.value)
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Time Slot
                </label>

                <input
                  type="text"
                  value={editTime}
                  onChange={(e) =>
                    setEditTime(e.target.value)
                  }
                  placeholder="e.g. 10:00 AM"
                />

              </div>

              <div className="form-group">

                <label>
                  Status
                </label>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value)
                  }
                >

                  {statuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            <div className="appointment-modal-footer">

              <button
                className="modal-cancel-btn"
                onClick={() =>
                  setEditingAppointment(null)
                }
              >
                Cancel
              </button>

              <button
                className="modal-save-btn"
                onClick={updateAppointment}
              >
                Save Changes
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AdminAppointmentManagement;