import React, { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarDays,
  FaCalendarPlus,
  FaCircleCheck,
  FaClock,
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaReceipt,
  FaRotate,
  FaTriangleExclamation,
} from "react-icons/fa6";

import { AuthContext } from "../../context/AuthContext";
import "./Billing.css";

const API_URL = "http://localhost:5000";

const Billing = () => {
  const { user } = useContext(AuthContext);

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // GET PATIENT ID
  // ======================================================

  const patientId = user?._id || user?.id;

  // ======================================================
  // FETCH PATIENT BILLS
  // ======================================================

  const fetchBills = useCallback(
    async (showRefresh = false) => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          `${API_URL}/api/billing/patient/${patientId}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch billing records."
          );
        }

        setBills(data.bills || []);
      } catch (err) {
        console.error("Billing fetch error:", err);

        setError(
          err.message ||
            "Unable to load your billing records. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [patientId]
  );

  // ======================================================
  // LOAD BILLS
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
      return "Date not available";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ======================================================
  // PAYMENT STATUS CLASS
  // ======================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "billing-status billing-status-paid";

      case "Partially Paid":
        return "billing-status billing-status-partial";

      case "Cancelled":
        return "billing-status billing-status-cancelled";

      default:
        return "billing-status billing-status-pending";
    }
  };

  // ======================================================
  // CALCULATE SUMMARY
  // ======================================================

  const totalBills = bills.length;

  const totalBilled = bills.reduce(
    (total, bill) =>
      total + Number(bill.totalAmount || 0),
    0
  );

  const totalPaid = bills.reduce(
    (total, bill) =>
      total + Number(bill.paidAmount || 0),
    0
  );

  const pendingAmount = Math.max(
    totalBilled - totalPaid,
    0
  );

  // ======================================================
  // LOADING STATE
  // ======================================================

  if (loading) {
    return (
      <div className="billing-page">

        <section className="billing-loading">

          <div className="billing-loading-icon">
            <FaReceipt />
          </div>

          <h2>Loading Billing Records</h2>

          <p>
            Please wait while we retrieve your clinic bills.
          </p>

        </section>

      </div>
    );
  }

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div className="billing-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <section className="billing-hero">

        <div className="billing-hero-content">

          <div className="billing-hero-text">

            <Link
              to="/dashboard"
              className="billing-back-link"
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>

            <p className="billing-label">
              PATIENT PORTAL
            </p>

            <h1>
              Billing &amp; Payments
            </h1>

            <p className="billing-description">
              View your clinic bills, payment history
              and outstanding treatment charges in one place.
            </p>

          </div>

          <div className="billing-hero-icon">
            <FaFileInvoiceDollar />
          </div>

        </div>

      </section>

      {/* ==================================================
          PATIENT INFORMATION
      ================================================== */}

      <section className="billing-container">

        <div className="billing-patient-bar">

          <div className="billing-patient-info">

            <div className="billing-patient-avatar">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : "P"}
            </div>

            <div>
              <span className="billing-small-label">
                PATIENT
              </span>

              <h3>
                {user?.name || "Patient"}
              </h3>

              <p>
                {user?.email || "Email not available"}
              </p>
            </div>

          </div>

          <button
            type="button"
            className="billing-refresh-button"
            onClick={() => fetchBills(true)}
            disabled={refreshing}
          >
            <FaRotate
              className={
                refreshing
                  ? "billing-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div className="billing-error">

            <div className="billing-error-icon">
              <FaTriangleExclamation />
            </div>

            <div>
              <h3>
                Unable to Load Billing Records
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchBills()}
                className="billing-retry-button"
              >
                Try Again
              </button>
            </div>

          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        {!error && (
          <section className="billing-summary-grid">

            {/* TOTAL BILLS */}

            <div className="billing-summary-card">

              <div className="billing-summary-icon billing-summary-blue">
                <FaFileInvoiceDollar />
              </div>

              <div>
                <span>
                  TOTAL BILLS
                </span>

                <strong>
                  {totalBills}
                </strong>

                <small>
                  Clinic invoices
                </small>
              </div>

            </div>

            {/* TOTAL BILLED */}

            <div className="billing-summary-card">

              <div className="billing-summary-icon billing-summary-purple">
                <FaReceipt />
              </div>

              <div>
                <span>
                  TOTAL BILLED
                </span>

                <strong>
                  {formatCurrency(totalBilled)}
                </strong>

                <small>
                  Total clinic charges
                </small>
              </div>

            </div>

            {/* TOTAL PAID */}

            <div className="billing-summary-card">

              <div className="billing-summary-icon billing-summary-green">
                <FaCircleCheck />
              </div>

              <div>
                <span>
                  TOTAL PAID
                </span>

                <strong>
                  {formatCurrency(totalPaid)}
                </strong>

                <small>
                  Amount received
                </small>
              </div>

            </div>

            {/* PENDING */}

            <div className="billing-summary-card">

              <div className="billing-summary-icon billing-summary-orange">
                <FaClock />
              </div>

              <div>
                <span>
                  PENDING AMOUNT
                </span>

                <strong>
                  {formatCurrency(pendingAmount)}
                </strong>

                <small>
                  Outstanding balance
                </small>
              </div>

            </div>

          </section>
        )}

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {!error && bills.length === 0 && (
          <section className="billing-empty">

            <div className="billing-empty-icon">
              <FaFileInvoiceDollar />
            </div>

            <h2>
              No Billing Records Yet
            </h2>

            <p>
              Your clinic bills and payment records
              will appear here once a bill has been generated.
            </p>

            <Link
              to="/appointment"
              className="billing-primary-button"
            >
              <FaCalendarPlus />
              Book an Appointment
            </Link>

          </section>
        )}

        {/* ==================================================
            BILL RECORDS
        ================================================== */}

        {!error && bills.length > 0 && (
          <section className="billing-records-section">

            <div className="billing-section-heading">

              <div>
                <span>
                  PAYMENT HISTORY
                </span>

                <h2>
                  Your Clinic Bills
                </h2>
              </div>

              <div className="billing-record-count">
                {totalBills}{" "}
                {totalBills === 1
                  ? "Bill"
                  : "Bills"}
              </div>

            </div>

            <div className="billing-records-list">

              {bills.map((bill) => {

                const billPaid =
                  Number(
                    bill.paidAmount || 0
                  );

                const billTotal =
                  Number(
                    bill.totalAmount || 0
                  );

                const billPending =
                  Math.max(
                    billTotal - billPaid,
                    0
                  );

                return (
                  <article
                    className="billing-record-card"
                    key={bill._id}
                  >

                    {/* ======================================
                        BILL HEADER
                    ====================================== */}

                    <div className="billing-record-header">

                      <div className="billing-record-title">

                        <div className="billing-record-icon">
                          <FaFileInvoiceDollar />
                        </div>

                        <div>

                          <span>
                            BILL NUMBER
                          </span>

                          <h3>
                            {bill.billNumber ||
                              "N/A"}
                          </h3>

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

                    {/* ======================================
                        BILL INFORMATION
                    ====================================== */}

                    <div className="billing-info-grid">

                      <div className="billing-info-item">

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

                      <div className="billing-info-item">

                        <span>
                          <FaMoneyBillWave />
                          PAYMENT METHOD
                        </span>

                        <strong>
                          {bill.paymentMethod ||
                            "Not Paid"}
                        </strong>

                      </div>

                      <div className="billing-info-item">

                        <span>
                          <FaCircleCheck />
                          PAID AMOUNT
                        </span>

                        <strong className="billing-paid-text">
                          {formatCurrency(
                            billPaid
                          )}
                        </strong>

                      </div>

                      <div className="billing-info-item">

                        <span>
                          <FaClock />
                          PENDING
                        </span>

                        <strong className="billing-pending-text">
                          {formatCurrency(
                            billPending
                          )}
                        </strong>

                      </div>

                    </div>

                    {/* ======================================
                        SERVICES
                    ====================================== */}

                    <div className="billing-services">

                      <div className="billing-subsection-title">
                        <FaReceipt />
                        Services &amp; Charges
                      </div>

                      <div className="billing-table-wrapper">

                        <table className="billing-table">

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

                            {bill.services &&
                            bill.services.length > 0 ? (

                              bill.services.map(
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
                              )

                            ) : (

                              <tr>

                                <td
                                  colSpan="4"
                                  className="billing-no-services"
                                >
                                  No service details
                                  available.
                                </td>

                              </tr>

                            )}

                          </tbody>

                        </table>

                      </div>

                    </div>

                    {/* ======================================
                        BILL TOTALS
                    ====================================== */}

                    <div className="billing-bottom-section">

                      <div className="billing-notes">

                        {bill.notes && (
                          <>
                            <span>
                              BILL NOTES
                            </span>

                            <p>
                              {bill.notes}
                            </p>
                          </>
                        )}

                      </div>

                      <div className="billing-totals">

                        <div className="billing-total-row">

                          <span>
                            Subtotal
                          </span>

                          <strong>
                            {formatCurrency(
                              bill.subtotal
                            )}
                          </strong>

                        </div>

                        <div className="billing-total-row">

                          <span>
                            Discount
                          </span>

                          <strong>
                            -{" "}
                            {formatCurrency(
                              bill.discount
                            )}
                          </strong>

                        </div>

                        <div className="billing-total-row">

                          <span>
                            Tax
                          </span>

                          <strong>
                            {formatCurrency(
                              bill.tax
                            )}
                          </strong>

                        </div>

                        <div className="billing-total-row billing-grand-total">

                          <span>
                            Total Amount
                          </span>

                          <strong>
                            {formatCurrency(
                              bill.totalAmount
                            )}
                          </strong>

                        </div>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>

          </section>
        )}

        {/* ==================================================
            BOTTOM ACTIONS
        ================================================== */}

        <section className="billing-help-section">

          <div className="billing-help-content">

            <div className="billing-help-icon">
              <FaMoneyBillWave />
            </div>

            <div>

              <span>
                NEED ASSISTANCE?
              </span>

              <h2>
                Have a question about your bill?
              </h2>

              <p>
                Contact the DermCare reception team
                for billing or payment-related assistance.
              </p>

            </div>

          </div>

          <Link
            to="/appointment"
            className="billing-help-button"
          >
            <FaCalendarPlus />
            Book Consultation
          </Link>

        </section>

        {/* ==================================================
            BACK TO DASHBOARD
        ================================================== */}

        <div className="billing-bottom-navigation">

          <Link
            to="/dashboard"
            className="billing-dashboard-link"
          >
            <FaArrowLeft />
            Back to Patient Dashboard
          </Link>

        </div>

      </section>

    </div>
  );
};

export default Billing;