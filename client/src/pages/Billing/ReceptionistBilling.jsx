import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaCircleCheck,
  FaClock,
  FaEnvelope,
  FaFileInvoiceDollar,
  FaMagnifyingGlass,
  FaMoneyBillWave,
  FaPhone,
  FaReceipt,
  FaRotate,
  FaUser,
  FaXmark,
} from "react-icons/fa6";

import { Link } from "react-router-dom";
import API from "../../api/axios";

import "./ReceptionistBilling.css";

const ReceptionistBilling = () => {
  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedBill, setSelectedBill] = useState(null);

  // ======================================================
  // FETCH ALL BILLS
  // ======================================================

  const fetchBills = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await API.get("/billing");

        setBills(response.data?.bills || []);
      } catch (error) {
        console.error("Receptionist billing fetch error:", error);

        alert(
          error.response?.data?.message ||
            "Unable to load billing records."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ======================================================
  // LOAD
  // ======================================================

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // ======================================================
  // FORMAT CURRENCY
  // ======================================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ======================================================
  // STATUS CLASS
  // ======================================================

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "reception-billing-status reception-billing-paid";
    }

    if (status === "Partially Paid") {
      return "reception-billing-status reception-billing-partial";
    }

    if (status === "Cancelled") {
      return "reception-billing-status reception-billing-cancelled";
    }

    return "reception-billing-status reception-billing-pending";
  };

  // ======================================================
  // FILTER BILLS
  // ======================================================

  const filteredBills = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return bills.filter((bill) => {
      const patientName = String(
        bill.patientName ||
          bill.patient?.name ||
          bill.name ||
          ""
      ).toLowerCase();

      const patientEmail = String(
        bill.patientEmail ||
          bill.patient?.email ||
          bill.email ||
          ""
      ).toLowerCase();

      const patientPhone = String(
        bill.patientPhone ||
          bill.patient?.phone ||
          bill.phone ||
          ""
      ).toLowerCase();

      const billNumber = String(
        bill.billNumber || ""
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        patientName.includes(searchText) ||
        patientEmail.includes(searchText) ||
        patientPhone.includes(searchText) ||
        billNumber.includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        bill.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, search, statusFilter]);

  // ======================================================
  // SUMMARY
  // ======================================================

  const totalBills = bills.length;

  const paidBills = bills.filter(
    (bill) => bill.paymentStatus === "Paid"
  ).length;

  const pendingBills = bills.filter(
    (bill) =>
      bill.paymentStatus !== "Paid" &&
      bill.paymentStatus !== "Cancelled"
  ).length;

  const totalRevenue = bills.reduce(
    (total, bill) =>
      total + Number(bill.totalAmount || 0),
    0
  );

  const pendingAmount = bills.reduce(
    (total, bill) => {
      const billTotal = Number(
        bill.totalAmount || 0
      );

      const paidAmount = Number(
        bill.paidAmount || 0
      );

      return (
        total +
        Math.max(billTotal - paidAmount, 0)
      );
    },
    0
  );

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="reception-billing-page">
        <div className="reception-billing-loading">
          <div className="reception-billing-loading-icon">
            <FaFileInvoiceDollar />
          </div>

          <h2>Loading Billing Records</h2>

          <p>
            Please wait while we retrieve clinic bills.
          </p>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div className="reception-billing-page">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="reception-billing-hero">

        <div className="reception-billing-hero-content">

          <div>

            <Link
              to="/dashboard"
              className="reception-billing-back"
            >
              <FaArrowLeft />
              Back to Receptionist Dashboard
            </Link>

            <span className="reception-billing-label">
              RECEPTIONIST PORTAL
            </span>

            <h1>
              Billing Support
            </h1>

            <p>
              Manage clinic bills, check payment status
              and assist patients with billing enquiries.
            </p>

          </div>

          <div className="reception-billing-hero-icon">
            <FaFileInvoiceDollar />
          </div>

        </div>

      </section>

      {/* ==================================================
          MAIN CONTAINER
      ================================================== */}

      <main className="reception-billing-container">

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <section className="reception-billing-summary">

          <div className="reception-billing-summary-card">

            <div className="reception-summary-icon blue">
              <FaFileInvoiceDollar />
            </div>

            <div>
              <span>TOTAL BILLS</span>
              <strong>{totalBills}</strong>
              <small>Clinic invoices</small>
            </div>

          </div>

          <div className="reception-billing-summary-card">

            <div className="reception-summary-icon green">
              <FaCircleCheck />
            </div>

            <div>
              <span>PAID BILLS</span>
              <strong>{paidBills}</strong>
              <small>Completed payments</small>
            </div>

          </div>

          <div className="reception-billing-summary-card">

            <div className="reception-summary-icon orange">
              <FaClock />
            </div>

            <div>
              <span>PENDING BILLS</span>
              <strong>{pendingBills}</strong>
              <small>Need payment</small>
            </div>

          </div>

          <div className="reception-billing-summary-card">

            <div className="reception-summary-icon purple">
              <FaMoneyBillWave />
            </div>

            <div>
              <span>TOTAL BILLED</span>
              <strong>
                {formatCurrency(totalRevenue)}
              </strong>
              <small>
                Pending: {formatCurrency(pendingAmount)}
              </small>
            </div>

          </div>

        </section>

        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <section className="reception-billing-filter">

          <div className="reception-billing-search">

            <FaMagnifyingGlass />

            <input
              type="text"
              placeholder="Search patient, phone, email or bill number..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="reception-billing-clear"
              >
                <FaXmark />
              </button>
            )}

          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="reception-billing-status-filter"
          >
            <option value="All">
              All Payments
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Partially Paid">
              Partially Paid
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Cancelled">
              Cancelled
            </option>
          </select>

          <button
            type="button"
            className="reception-billing-refresh"
            onClick={() => fetchBills(true)}
            disabled={refreshing}
          >
            <FaRotate
              className={
                refreshing
                  ? "reception-billing-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </section>

        {/* ==================================================
            RECORD HEADER
        ================================================== */}

        <section className="reception-billing-records">

          <div className="reception-billing-section-header">

            <div>
              <span>BILLING RECORDS</span>

              <h2>
                Clinic Bills
              </h2>
            </div>

            <div className="reception-billing-count">
              {filteredBills.length}{" "}
              {filteredBills.length === 1
                ? "Record"
                : "Records"}
            </div>

          </div>

          {/* ==================================================
              EMPTY
          ================================================== */}

          {filteredBills.length === 0 ? (

            <div className="reception-billing-empty">

              <div className="reception-billing-empty-icon">
                <FaFileInvoiceDollar />
              </div>

              <h3>
                No Billing Records Found
              </h3>

              <p>
                {search || statusFilter !== "All"
                  ? "Try changing your search or payment filter."
                  : "No clinic bills have been generated yet."}
              </p>

            </div>

          ) : (

            <div className="reception-billing-list">

              {filteredBills.map((bill) => {

                const billTotal = Number(
                  bill.totalAmount || 0
                );

                const paidAmount = Number(
                  bill.paidAmount || 0
                );

                const pending =
                  Math.max(
                    billTotal - paidAmount,
                    0
                  );

                const patientName =
                  bill.patientName ||
                  bill.patient?.name ||
                  bill.name ||
                  "Patient";

                const patientEmail =
                  bill.patientEmail ||
                  bill.patient?.email ||
                  bill.email ||
                  "Email not available";

                const patientPhone =
                  bill.patientPhone ||
                  bill.patient?.phone ||
                  bill.phone ||
                  "Phone not available";

                return (
                  <article
                    className="reception-billing-card"
                    key={bill._id}
                  >

                    {/* CARD HEADER */}

                    <div className="reception-billing-card-header">

                      <div className="reception-billing-patient">

                        <div className="reception-billing-avatar">
                          {patientName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <span>
                            PATIENT
                          </span>

                          <h3>
                            {patientName}
                          </h3>

                          <div className="reception-billing-contact">

                            <small>
                              <FaPhone />
                              {patientPhone}
                            </small>

                            <small>
                              <FaEnvelope />
                              {patientEmail}
                            </small>

                          </div>

                        </div>

                      </div>

                      <div
                        className={getStatusClass(
                          bill.paymentStatus
                        )}
                      >

                        {bill.paymentStatus ===
                        "Paid" ? (
                          <FaCircleCheck />
                        ) : (
                          <FaClock />
                        )}

                        {bill.paymentStatus ||
                          "Pending"}

                      </div>

                    </div>

                    {/* BILL INFORMATION */}

                    <div className="reception-billing-info">

                      <div>
                        <span>
                          <FaReceipt />
                          BILL NUMBER
                        </span>

                        <strong>
                          {bill.billNumber ||
                            "N/A"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          <FaCalendarDays />
                          BILL DATE
                        </span>

                        <strong>
                          {formatDate(
                            bill.createdAt
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          <FaMoneyBillWave />
                          TOTAL
                        </span>

                        <strong>
                          {formatCurrency(
                            billTotal
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          <FaCircleCheck />
                          PAID
                        </span>

                        <strong className="reception-paid">
                          {formatCurrency(
                            paidAmount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          <FaClock />
                          PENDING
                        </span>

                        <strong className="reception-pending">
                          {formatCurrency(
                            pending
                          )}
                        </strong>
                      </div>

                    </div>

                    {/* SERVICES */}

                    {bill.services &&
                      bill.services.length > 0 && (

                        <div className="reception-billing-services">

                          <h4>
                            <FaReceipt />
                            Services &amp; Charges
                          </h4>

                          <div className="reception-billing-table-wrapper">

                            <table>

                              <thead>
                                <tr>
                                  <th>
                                    Service
                                  </th>

                                  <th>
                                    Qty
                                  </th>

                                  <th>
                                    Price
                                  </th>

                                  <th>
                                    Total
                                  </th>
                                </tr>
                              </thead>

                              <tbody>

                                {bill.services.map(
                                  (
                                    service,
                                    index
                                  ) => (

                                    <tr
                                      key={
                                        service._id ||
                                        index
                                      }
                                    >

                                      <td>
                                        {service.name ||
                                          "Service"}
                                      </td>

                                      <td>
                                        {service.quantity ||
                                          1}
                                      </td>

                                      <td>
                                        {formatCurrency(
                                          service.price
                                        )}
                                      </td>

                                      <td>
                                        <strong>
                                          {formatCurrency(
                                            service.total
                                          )}
                                        </strong>
                                      </td>

                                    </tr>

                                  )
                                )}

                              </tbody>

                            </table>

                          </div>

                        </div>

                      )}

                    {/* FOOTER */}

                    <div className="reception-billing-card-footer">

                      <div>

                        <span>
                          PAYMENT METHOD
                        </span>

                        <strong>
                          {bill.paymentMethod ||
                            "Not Paid"}
                        </strong>

                      </div>

                      <button
                        type="button"
                        className="reception-view-bill"
                        onClick={() =>
                          setSelectedBill(bill)
                        }
                      >
                        <FaReceipt />
                        View Bill
                      </button>

                    </div>

                  </article>
                );
              })}

            </div>

          )}

        </section>

      </main>

      {/* ==================================================
          BILL DETAILS MODAL
      ================================================== */}

      {selectedBill && (

        <div
          className="reception-billing-modal-overlay"
          onClick={() =>
            setSelectedBill(null)
          }
        >

          <div
            className="reception-billing-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="reception-billing-modal-header">

              <div>

                <span>
                  BILL DETAILS
                </span>

                <h2>
                  {selectedBill.billNumber ||
                    "Clinic Bill"}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBill(null)
                }
              >
                <FaXmark />
              </button>

            </div>

            <div className="reception-billing-modal-body">

              <div className="reception-modal-patient">

                <div className="reception-billing-avatar">
                  {(
                    selectedBill.patientName ||
                    selectedBill.patient?.name ||
                    selectedBill.name ||
                    "P"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <span>
                    PATIENT
                  </span>

                  <h3>
                    {selectedBill.patientName ||
                      selectedBill.patient?.name ||
                      selectedBill.name ||
                      "Patient"}
                  </h3>

                  <p>
                    {selectedBill.patientEmail ||
                      selectedBill.patient?.email ||
                      selectedBill.email ||
                      "Email not available"}
                  </p>

                </div>

              </div>

              <div className="reception-modal-grid">

                <div>
                  <span>Bill Date</span>
                  <strong>
                    {formatDate(
                      selectedBill.createdAt
                    )}
                  </strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>
                    {selectedBill.paymentStatus ||
                      "Pending"}
                  </strong>
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>
                    {selectedBill.paymentMethod ||
                      "Not Paid"}
                  </strong>
                </div>

                <div>
                  <span>Total Amount</span>
                  <strong>
                    {formatCurrency(
                      selectedBill.totalAmount
                    )}
                  </strong>
                </div>

              </div>

              {selectedBill.notes && (
                <div className="reception-modal-notes">

                  <span>
                    NOTES
                  </span>

                  <p>
                    {selectedBill.notes}
                  </p>

                </div>
              )}

            </div>

            <div className="reception-billing-modal-footer">

              <button
                type="button"
                onClick={() =>
                  setSelectedBill(null)
                }
                className="reception-modal-close"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ReceptionistBilling;