import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import "./AdminDashboard.css";

import {
  FaUsers,
  FaUserDoctor,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaUserShield,
  FaClipboardList,
  FaChartLine,
} from "react-icons/fa6";

import API from "../../api/axios";

import AdminBilling from "./AdminBilling";

import DoctorManagement from "../DoctorManagement/DoctorManagement";

import PatientRecords from "../PatientRecords/PatientRecords";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [showBilling, setShowBilling] =
    useState(false);

  const [showDoctors, setShowDoctors] =
    useState(false);

  const [showPatients, setShowPatients] =
    useState(false);

  const [stats, setStats] = useState([
    {
      title: "Total Patients",
      value: "0",
      icon: <FaUsers />,
      description:
        "Registered patients",
    },
    {
      title: "Total Doctors",
      value: "0",
      icon: <FaUserDoctor />,
      description:
        "Active doctors",
    },
    {
      title: "Appointments",
      value: "0",
      icon: <FaCalendarCheck />,
      description:
        "Total appointments",
    },
    {
      title: "Revenue",
      value: "₹0",
      icon: <FaFileInvoiceDollar />,
      description:
        "Total clinic revenue",
    },
  ]);

  const [loadingStats, setLoadingStats] =
    useState(true);

  // ==========================================
  // FETCH ADMIN DASHBOARD STATISTICS
  // ==========================================

  useEffect(() => {
    const fetchDashboardStats =
      async () => {
        try {
          setLoadingStats(true);

          const [
            patientsResponse,
            doctorsResponse,
            appointmentsResponse,
            billsResponse,
          ] = await Promise.all([
            API.get("/admin/patients"),
            API.get("/admin/doctors"),
            API.get("/appointments"),
            API.get("/billing"),
          ]);

          const patients =
            patientsResponse.data
              ?.patients ||
            patientsResponse.data ||
            [];

          const doctors =
            doctorsResponse.data
              ?.doctors ||
            doctorsResponse.data ||
            [];

          const appointments =
            appointmentsResponse.data
              ?.appointments ||
            appointmentsResponse.data ||
            [];

          const bills =
            billsResponse.data?.bills ||
            billsResponse.data ||
            [];

          const totalRevenue =
            bills.reduce(
              (sum, bill) => {
                const amount =
                  Number(
                    bill.totalAmount ||
                      bill.total ||
                      bill.amount ||
                      0
                  );

                return sum + amount;
              },
              0
            );

          setStats([
            {
              title:
                "Total Patients",
              value:
                patients.length.toString(),
              icon: <FaUsers />,
              description:
                "Registered patients",
            },
            {
              title:
                "Total Doctors",
              value:
                doctors.length.toString(),
              icon: <FaUserDoctor />,
              description:
                "Active doctors",
            },
            {
              title:
                "Appointments",
              value:
                appointments.length.toString(),
              icon: (
                <FaCalendarCheck />
              ),
              description:
                "Total appointments",
            },
            {
              title: "Revenue",
              value: `₹${totalRevenue.toLocaleString(
                "en-IN"
              )}`,
              icon: (
                <FaFileInvoiceDollar />
              ),
              description: `${bills.length} total bills`,
            },
          ]);
        } catch (error) {
          console.error(
            "Error fetching admin dashboard statistics:",
            error.response?.data ||
              error.message
          );
        } finally {
          setLoadingStats(false);
        }
      };

    fetchDashboardStats();
  }, []);

  // ==========================================
  // QUICK ACTIONS
  // ==========================================

  const quickActions = [
    {
      title:
        "Manage Doctors",

      description:
        "Add, view and manage clinic doctors.",

      icon: <FaUserDoctor />,

      action: () => {
        setShowDoctors(true);
        setShowPatients(false);
        setShowBilling(false);
      },
    },

    {
      title:
        "Manage Patients",

      description:
        "View and manage registered patients.",

      icon: <FaUsers />,

      action: () => {
        setShowPatients(true);
        setShowDoctors(false);
        setShowBilling(false);
      },
    },

    {
      title:
        "Appointments",

      description:
        "View and manage clinic appointments.",

      icon: <FaCalendarCheck />,

      action: () => {
        navigate("/appointment");
      },
    },

    {
      title:
        "Billing & Revenue",

      description:
        "Create bills, add products, manage payments and print invoices.",

      icon: (
        <FaFileInvoiceDollar />
      ),

      action: () => {
        setShowBilling(true);
        setShowDoctors(false);
        setShowPatients(false);
      },
    },
  ];

  // ==========================================
  // DOCTOR MANAGEMENT SCREEN
  // ==========================================

  if (showDoctors) {
    return (
      <DoctorManagement
        onBack={() =>
          setShowDoctors(false)
        }
      />
    );
  }

  // ==========================================
  // PATIENT MANAGEMENT SCREEN
  // ==========================================

  if (showPatients) {
    return (
      <div>
        <div
          style={{
            padding:
              "20px 30px",
            background:
              "#ffffff",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <button
            type="button"
            onClick={() =>
              setShowPatients(false)
            }
            style={{
              border: "none",
              background:
                "#f1f5f9",
              padding:
                "10px 18px",
              borderRadius:
                "8px",
              cursor:
                "pointer",
              fontWeight:
                "600",
            }}
          >
            ← Back to Admin Dashboard
          </button>
        </div>

        <PatientRecords />
      </div>
    );
  }

  // ==========================================
  // BILLING SCREEN
  // ==========================================

  if (showBilling) {
    return (
      <AdminBilling
        onBack={() =>
          setShowBilling(false)
        }
      />
    );
  }

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  return (
    <div className="admin-dashboard">

      <div className="admin-container">

        {/* HEADER */}

        <div className="admin-header">

          <div>

            <span className="admin-badge">

              <FaUserShield />

              ADMIN PORTAL

            </span>

            <h1>
              Admin Dashboard
            </h1>

            <p>
              Manage your DermCare
              clinic, staff, patients,
              appointments and overall
              clinic operations.
            </p>

          </div>

          <div className="admin-welcome">

            <div className="admin-welcome-icon">
              🛡️
            </div>

            <div>

              <span>
                Welcome
              </span>

              <strong>
                Clinic Administrator
              </strong>

            </div>

          </div>

        </div>

        {/* STATISTICS */}

        <div className="admin-stats">

          {stats.map(
            (stat, index) => (

              <div
                className="admin-stat-card"
                key={index}
              >

                <div className="admin-stat-icon">
                  {stat.icon}
                </div>

                <div className="admin-stat-content">

                  <span>
                    {stat.title}
                  </span>

                  <strong>
                    {loadingStats
                      ? "..."
                      : stat.value}
                  </strong>

                  <small>
                    {stat.description}
                  </small>

                </div>

              </div>

            )
          )}

        </div>

        {/* SECTION HEADER */}

        <div className="admin-section-header">

          <div>

            <span className="admin-section-label">

              <FaClipboardList />

              MANAGEMENT

            </span>

            <h2>
              Quick Actions
            </h2>

            <p>
              Access important clinic
              management modules.
            </p>

          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="admin-actions">

          {quickActions.map(
            (action, index) => (

              <button
                className={`admin-action-card ${
                  action.title ===
                  "Billing & Revenue"
                    ? "admin-billing-action"
                    : ""
                }`}
                key={index}
                onClick={
                  action.action
                }
                type="button"
              >

                <div className="admin-action-icon">
                  {action.icon}
                </div>

                <div className="admin-action-content">

                  <h3>
                    {action.title}
                  </h3>

                  <p>
                    {action.description}
                  </p>

                  <span className="admin-action-link">
                    Open →
                  </span>

                </div>

              </button>

            )
          )}

        </div>

        {/* OVERVIEW */}

        <div className="admin-overview-grid">

          {/* CLINIC OVERVIEW */}

          <div className="admin-overview-card">

            <div className="admin-overview-title">

              <div className="admin-overview-icon">
                <FaChartLine />
              </div>

              <div>

                <h3>
                  Clinic Overview
                </h3>

                <p>
                  Current clinic management
                  status
                </p>

              </div>

            </div>

            <div className="admin-overview-list">

              <div className="admin-overview-item">

                <span>
                  Patients
                </span>

                <strong>
                  {loadingStats
                    ? "..."
                    : stats[0].value}
                </strong>

              </div>

              <div className="admin-overview-item">

                <span>
                  Doctors
                </span>

                <strong>
                  {loadingStats
                    ? "..."
                    : stats[1].value}
                </strong>

              </div>

              <div className="admin-overview-item">

                <span>
                  Appointments
                </span>

                <strong>
                  {loadingStats
                    ? "..."
                    : stats[2].value}
                </strong>

              </div>

              <div className="admin-overview-item">

                <span>
                  Revenue
                </span>

                <strong>
                  {loadingStats
                    ? "..."
                    : stats[3].value}
                </strong>

              </div>

            </div>

          </div>

          {/* BILLING SYSTEM */}

          <div className="admin-overview-card">

            <div className="admin-overview-title">

              <div className="admin-overview-icon">
                <FaFileInvoiceDollar />
              </div>

              <div>

                <h3>
                  Billing System
                </h3>

                <p>
                  Manage clinic billing
                  and payments
                </p>

              </div>

            </div>

            <div className="admin-billing-info">

              <div>

                <span>
                  Total Bills
                </span>

                <strong>
                  {loadingStats
                    ? "..."
                    : stats[3].description.replace(
                        " total bills",
                        ""
                      )}
                </strong>

              </div>

              <p>
                Create patient bills,
                add clinic products and
                services, record payments
                and print invoices.
              </p>

              <button
                type="button"
                className="admin-billing-button"
                onClick={() =>
                  setShowBilling(true)
                }
              >

                <FaFileInvoiceDollar />

                Open Billing & Revenue

              </button>

            </div>

          </div>

        </div>

        {/* ADMIN NOTE */}

        <div className="admin-note">

          <FaUserShield />

          <div>

            <strong>
              Admin Management
            </strong>

            <p>
              Dashboard statistics are
              connected to the DermCare
              backend. Billing management
              allows the administrator to
              create invoices, manage
              products and payments, and
              print patient bills.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;