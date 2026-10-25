
import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaPlus,
  FaTrash,
  FaPenToSquare,
  FaXmark,
  FaMagnifyingGlass,
  FaFileInvoiceDollar,
} from "react-icons/fa6";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import API from "../../api/axios";
import {
  clinicalHampers,
  clinicProducts,
} from "../Products/Products";
import "./AdminBilling.css";

const services = [
  { id: "service-1", name: "Dermatology Consultation", price: 1000, type: "Service" },
  { id: "service-2", name: "Acne Treatment Consultation", price: 1200, type: "Service" },
  { id: "service-3", name: "Hair Consultation", price: 900, type: "Service" },
  { id: "service-4", name: "Skin Analysis", price: 500, type: "Service" },
  { id: "service-5", name: "Chemical Peel Treatment", price: 2500, type: "Service" },
  { id: "service-6", name: "Laser Treatment", price: 3500, type: "Service" },
  { id: "service-7", name: "PRP Hair Treatment", price: 4500, type: "Service" },
];

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || value.id || "";
};

const getName = (item) =>
  item?.name || item?.title || item?.productName || "Clinic Product";

const getPrice = (item) =>
  Number(item?.price ?? item?.sellingPrice ?? item?.amount ?? 0);

const getPatientName = (patient) => {
  if (!patient) return "Unknown patient";
  if (typeof patient === "string") return patient;
  return patient.name || patient.fullName || patient.email || "Unknown patient";
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const AdminBilling = ({ onBack }) => {
  const [patients, setPatients] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [items, setItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [paymentMethod, setPaymentMethod] = useState("Not Paid");
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBillId, setEditingBillId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const catalogItems = useMemo(() => {
    const normalizedProducts = (clinicProducts || []).map((product, index) => ({
      id: `product-${product.id ?? product._id ?? index}`,
      name: getName(product),
      price: getPrice(product),
      type: "Medicine",
      discountEligible: true,
    }));

    const normalizedHampers = (clinicalHampers || []).map((hamper, index) => ({
      id: `hamper-${hamper.id ?? hamper._id ?? index}`,
      name: getName(hamper),
      price: getPrice(hamper),
      type: "Hamper",
      discountEligible: false,
    }));

    return [...services, ...normalizedProducts, ...normalizedHampers];
  }, []);

  const selectedPatient = patients.find(
    (patient) => getId(patient) === selectedPatientId
  );

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const discountEligibleSubtotal = items.reduce((sum, item) => {
    return item.discountEligible
      ? sum + Number(item.price || 0) * Number(item.quantity || 1)
      : sum;
  }, 0);

  const discountAmount = Math.min(
    discountEligibleSubtotal,
    discountEligibleSubtotal *
      (Math.max(0, Number(discountPercent) || 0) / 100)
  );

  const totalAmount = Math.max(0, subtotal - discountAmount);

  const filteredCatalog = catalogItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredHistory = recentBills.filter((bill) => {
    const search = historySearch.toLowerCase();
    const patientName = getPatientName(bill.patient).toLowerCase();
    const billNumber = String(bill.billNumber || "").toLowerCase();

    return patientName.includes(search) || billNumber.includes(search);
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [patientsResponse, billsResponse] = await Promise.all([
        API.get("/admin/patients"),
        API.get("/billing"),
      ]);

      const patientData = Array.isArray(patientsResponse.data)
        ? patientsResponse.data
        : patientsResponse.data?.patients || [];

      const billData = Array.isArray(billsResponse.data)
        ? billsResponse.data
        : billsResponse.data?.bills || [];

      setPatients(patientData);
      setRecentBills(billData);
    } catch (err) {
      console.error(
        "Could not load billing data:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message ||
          "Unable to load patients or bills. Check the backend and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (paymentStatus === "Paid") {
      setPaidAmount(totalAmount);
    } else if (paymentStatus === "Pending") {
      setPaidAmount(0);
    } else {
      setPaidAmount((current) =>
        Math.min(Math.max(0, Number(current) || 0), totalAmount)
      );
    }
  }, [paymentStatus, totalAmount]);

  const resetForm = (preserveMessage = false) => {
    setSelectedPatientId("");
    setItems([]);
    setDiscountPercent(0);
    setPaymentStatus("Pending");
    setPaymentMethod("Not Paid");
    setPaidAmount(0);
    setNotes("");
    setEditingBillId("");
    setSearchTerm("");
    setError("");

    if (!preserveMessage) {
      setMessage("");
    }
  };

  const addItem = (catalogItem) => {
    setMessage("");
    setError("");

    setItems((currentItems) => {
      const existing = currentItems.find(
        (item) => item.id === catalogItem.id
      );

      if (existing) {
        return currentItems.map((item) =>
          item.id === catalogItem.id
            ? { ...item, quantity: Number(item.quantity || 1) + 1 }
            : item
        );
      }

      return [...currentItems, { ...catalogItem, quantity: 1 }];
    });
  };

  const changeQuantity = (itemId, quantity) => {
    const safeQuantity = Math.max(1, Number(quantity) || 1);

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: safeQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  const startEditingBill = (bill) => {
    const billId = getId(bill);
    const billPatientId = getId(bill.patient);

    const mappedItems = (bill.services || []).map((service, index) => {
      const itemType = service.type || "Service";

      return {
        id: `edit-${billId}-${index}`,
        name: service.name || service.serviceName || "Bill item",
        type: itemType,
        price: Number(service.price || 0),
        quantity: Math.max(1, Number(service.quantity || 1)),
        discountEligible:
          itemType === "Medicine" || service.discountEligible === true,
      };
    });

    const eligibleAmount = mappedItems.reduce(
      (sum, item) =>
        sum + (item.discountEligible ? item.price * item.quantity : 0),
      0
    );

    const savedDiscount = Number(bill.discount || 0);
    const inferredDiscountPercent =
      eligibleAmount > 0
        ? Math.min(100, (savedDiscount / eligibleAmount) * 100)
        : 0;

    setEditingBillId(billId);
    setSelectedPatientId(billPatientId);
    setItems(mappedItems);
    setDiscountPercent(Number(inferredDiscountPercent.toFixed(2)));
    setPaymentStatus(bill.paymentStatus || "Pending");
    setPaymentMethod(bill.paymentMethod || "Not Paid");
    setPaidAmount(Number(bill.paidAmount || 0));
    setNotes(bill.notes || "");
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!selectedPatientId) {
      setError("Please select a patient.");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one service or product to the bill.");
      return;
    }

    if (
      paymentStatus === "Partially Paid" &&
      Number(paidAmount) > totalAmount
    ) {
      setError("The paid amount cannot be greater than the bill total.");
      return;
    }

    const billIdBeingEdited = editingBillId;

    const finalPaidAmount =
      paymentStatus === "Paid"
        ? totalAmount
        : paymentStatus === "Pending"
          ? 0
          : Math.min(Math.max(0, Number(paidAmount) || 0), totalAmount);

    const payload = {
      patient: selectedPatientId,
      services: items.map((item) => ({
        name: item.name,
        type: item.type,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        total: Number(item.price || 0) * Number(item.quantity || 1),
        discountEligible: Boolean(item.discountEligible),
      })),
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discountAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentStatus,
      paymentMethod,
      paidAmount: Number(finalPaidAmount.toFixed(2)),
      notes,
    };

    setSaving(true);

    try {
      if (billIdBeingEdited) {
        await API.put(`/billing/${billIdBeingEdited}`, payload);
      } else {
        await API.post("/billing", payload);
      }

      resetForm(true);
      await fetchData();

      setMessage(
        billIdBeingEdited
          ? "Bill updated successfully."
          : "Bill created successfully."
      );
    } catch (err) {
      console.error(
        "Could not save bill:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to save the bill. Please check the details and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteBill = async (bill) => {
    const billId = getId(bill);

    if (!billId) {
      setError("This bill does not have a valid ID.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete bill ${
        bill.billNumber || ""
      }? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await API.delete(`/billing/${billId}`);

      setRecentBills((currentBills) =>
        currentBills.filter((item) => getId(item) !== billId)
      );

      if (editingBillId === billId) {
        resetForm();
      }

      setMessage("Bill deleted successfully.");
    } catch (err) {
      console.error(
        "Could not delete bill:",
        err.response?.data || err.message
      );
      setError(
        err.response?.data?.message || "Unable to delete this bill."
      );
    }
  };

  const downloadBillPDF = (bill) => {
    const doc = new jsPDF();
    const billItems = bill.services || [];
    const billSubtotal = Number(bill.subtotal || 0);
    const billDiscount = Number(bill.discount || 0);
    const billTotal = Number(bill.totalAmount || 0);
    const billPaid = Number(bill.paidAmount || 0);

    doc.setFontSize(20);
    doc.text("DermCare Clinic", 14, 20);

    doc.setFontSize(10);
    doc.text("Dermatology & Hair Clinic Management", 14, 27);
    doc.text(`Bill Number: ${bill.billNumber || "N/A"}`, 14, 38);
    doc.text(`Patient: ${getPatientName(bill.patient)}`, 14, 45);
    doc.text(
      `Date: ${
        bill.createdAt
          ? new Date(bill.createdAt).toLocaleDateString("en-IN")
          : new Date().toLocaleDateString("en-IN")
      }`,
      14,
      52
    );

    autoTable(doc, {
      startY: 60,
      head: [["Item", "Type", "Qty", "Unit Price", "Amount"]],
      body: billItems.map((item) => [
        item.name || item.serviceName || "Bill item",
        item.type || "Service",
        String(item.quantity || 1),
        formatCurrency(item.price),
        formatCurrency(
          item.total ??
            Number(item.price || 0) * Number(item.quantity || 1)
        ),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [33, 87, 91] },
    });

    const finalY = (doc.lastAutoTable?.finalY || 65) + 10;

    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(billSubtotal)}`, 14, finalY);
    doc.text(`Discount: -${formatCurrency(billDiscount)}`, 14, finalY + 7);

    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(billTotal)}`, 14, finalY + 16);

    doc.setFontSize(10);
    doc.text(`Paid: ${formatCurrency(billPaid)}`, 14, finalY + 24);
    doc.text(
      `Balance Due: ${formatCurrency(Math.max(0, billTotal - billPaid))}`,
      14,
      finalY + 31
    );
    doc.text(
      `Payment Status: ${bill.paymentStatus || "Pending"}`,
      14,
      finalY + 38
    );

    if (bill.notes) {
      doc.text("Notes:", 14, finalY + 48);
      doc.text(String(bill.notes), 14, finalY + 55, { maxWidth: 180 });
    }

    const safeBillNumber = String(
      bill.billNumber || getId(bill) || "DermCare-Bill"
    ).replace(/[^a-z0-9-_]/gi, "-");

    doc.save(`${safeBillNumber}.pdf`);
  };

  return (
    <div className="admin-billing-page">
      <div className="admin-billing-container">
        <div className="admin-billing-topbar">
          <button
            type="button"
            className="admin-billing-back"
            onClick={onBack}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>

          <button
            type="button"
            className="admin-billing-new"
            onClick={() => resetForm()}
          >
            <FaPlus /> New Bill
          </button>
        </div>

        <div className="admin-billing-heading">
          <div className="admin-billing-heading-icon">
            <FaFileInvoiceDollar />
          </div>
          <div>
            <h1>Billing & Revenue</h1>
            <p>Create bills, manage payments, and download bill PDFs.</p>
          </div>
        </div>

        {message && (
          <div className="admin-billing-alert success">{message}</div>
        )}

        {error && <div className="admin-billing-alert error">{error}</div>}

        <div className="admin-billing-content">
          <main className="admin-billing-main">
            <form onSubmit={handleSubmit}>
              <section className="admin-billing-card">
                <div className="admin-billing-section-header">
                  <div>
                    <h2>Patient Information</h2>
                    <p>Select the patient for this bill.</p>
                  </div>
                  {editingBillId && (
                    <span className="admin-editing-label">Editing bill</span>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="billing-patient">Select Patient *</label>
                  <select
                    id="billing-patient"
                    value={selectedPatientId}
                    onChange={(event) =>
                      setSelectedPatientId(event.target.value)
                    }
                    required
                  >
                    <option value="">Choose a registered patient</option>
                    {patients.map((patient) => (
                      <option key={getId(patient)} value={getId(patient)}>
                        {getPatientName(patient)}
                        {patient.email ? ` — ${patient.email}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPatient && (
                  <div className="admin-selected-patient">
                    <div className="admin-patient-avatar">
                      {getPatientName(selectedPatient).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{getPatientName(selectedPatient)}</strong>
                      <span>{selectedPatient.email || "No email provided"}</span>
                      <span>{selectedPatient.phone || "No phone provided"}</span>
                    </div>
                  </div>
                )}
              </section>

              <section className="admin-billing-card">
                <div className="admin-billing-section-header">
                  <div>
                    <h2>Services & Products</h2>
                    <p>Choose a service, clinic product, or clinical hamper.</p>
                  </div>
                </div>

                <div className="admin-catalog-search">
                  <FaMagnifyingGlass />
                  <input
                    type="text"
                    placeholder="Search services and products..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>

                <div className="admin-catalog-category-label">
                  Available Items
                </div>

                <div className="admin-billing-catalog-grid">
                  {filteredCatalog.map((item) => (
                    <button
                      type="button"
                      className="admin-catalog-card-button"
                      key={item.id}
                      onClick={() => addItem(item)}
                    >
                      <span
                        className={`admin-catalog-type ${item.type.toLowerCase()}`}
                      >
                        {item.type}
                      </span>
                      <strong>{item.name}</strong>
                      <span className="admin-catalog-price">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="admin-catalog-add">
                        <FaPlus /> Add to bill
                      </span>
                    </button>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <p className="admin-billing-empty">
                      No services or products match your search.
                    </p>
                  )}
                </div>
              </section>

              <section className="admin-billing-card">
                <div className="admin-billing-section-header">
                  <div>
                    <h2>Bill Items</h2>
                    <p>Review quantities and amounts before saving.</p>
                  </div>
                  <span className="admin-item-count">
                    {items.length} item(s)
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="admin-billing-empty">
                    No items added yet. Select a service or product above.
                  </div>
                ) : (
                  <div className="admin-billing-items">
                    {items.map((item) => (
                      <div className="admin-billing-item" key={item.id}>
                        <div className="admin-billing-item-info">
                          <strong>{item.name}</strong>
                          <span>{item.type}</span>
                          <small>{formatCurrency(item.price)} each</small>
                        </div>

                        <div className="admin-quantity-control">
                          <label htmlFor={`qty-${item.id}`}>Qty</label>
                          <input
                            id={`qty-${item.id}`}
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) =>
                              changeQuantity(item.id, event.target.value)
                            }
                          />
                        </div>

                        <strong className="admin-billing-line-total">
                          {formatCurrency(item.price * item.quantity)}
                        </strong>

                        <button
                          type="button"
                          className="admin-remove-item"
                          title="Remove item"
                          onClick={() => removeItem(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-billing-card">
                <div className="admin-billing-section-header">
                  <div>
                    <h2>Payment Details</h2>
                    <p>Set the payment status and method.</p>
                  </div>
                </div>

                <div className="admin-payment-grid">
                  <div className="admin-form-group">
                    <label htmlFor="payment-status">Payment Status</label>
                    <select
                      id="payment-status"
                      value={paymentStatus}
                      onChange={(event) => setPaymentStatus(event.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="payment-method">Payment Method</label>
                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    >
                      <option value="Not Paid">Not Paid</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Online">Online</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="paid-amount">Amount Paid (₹)</label>
                    <input
                      id="paid-amount"
                      type="number"
                      min="0"
                      max={totalAmount}
                      step="0.01"
                      value={paidAmount}
                      disabled={paymentStatus !== "Partially Paid"}
                      onChange={(event) =>
                        setPaidAmount(Number(event.target.value) || 0)
                      }
                    />
                    <small>
                      Paid fills the total automatically; Pending sets it to ₹0.
                    </small>
                  </div>

                  <div className="admin-form-group">
                    <label htmlFor="discount-percent">Product Discount (%)</label>
                    <input
                      id="discount-percent"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discountPercent}
                      onChange={(event) =>
                        setDiscountPercent(
                          Math.min(
                            100,
                            Math.max(0, Number(event.target.value) || 0)
                          )
                        )
                      }
                    />
                    <small>
                      Applies to clinic products only, not services or hampers.
                    </small>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="billing-notes">Notes (optional)</label>
                  <textarea
                    id="billing-notes"
                    rows="3"
                    placeholder="Add payment notes or other details..."
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
              </section>

              <div className="admin-billing-form-actions">
                {editingBillId && (
                  <button
                    type="button"
                    className="admin-cancel-edit-button"
                    onClick={() => resetForm()}
                  >
                    <FaXmark /> Cancel Edit
                  </button>
                )}

                <button
                  type="submit"
                  className="admin-create-bill-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingBillId
                      ? "Update Bill"
                      : "Create Bill"}
                </button>
              </div>
            </form>
          </main>

          <aside className="admin-billing-sidebar">
            <section className="admin-billing-summary-card">
              <div className="admin-billing-section-header">
                <div>
                  <h2>Bill Summary</h2>
                  <p>Current bill calculation</p>
                </div>
              </div>

              <div className="admin-billing-total-row">
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>

              <div className="admin-billing-total-row">
                <span>Product discount</span>
                <strong className="admin-discount-value">
                  -{formatCurrency(discountAmount)}
                </strong>
              </div>

              <div className="admin-billing-total-row final">
                <span>Total Amount</span>
                <strong>{formatCurrency(totalAmount)}</strong>
              </div>

              <div className="admin-billing-total-row">
                <span>Amount Paid</span>
                <strong>{formatCurrency(paidAmount)}</strong>
              </div>

              <div className="admin-billing-total-row">
                <span>Balance Due</span>
                <strong>
                  {formatCurrency(
                    Math.max(0, totalAmount - Number(paidAmount || 0))
                  )}
                </strong>
              </div>

              <div className="admin-summary-status">
                <span>Status</span>
                <strong
                  className={`admin-payment-badge ${paymentStatus
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {paymentStatus}
                </strong>
              </div>

              <p className="admin-summary-note">
                Taxes are not included. The discount is calculated only on
                eligible clinic products.
              </p>
            </section>
          </aside>
        </div>

        <section className="admin-billing-card admin-billing-history">
          <div className="admin-billing-section-header">
            <div>
              <h2>Bill History</h2>
              <p>Edit, delete, or download an individual bill as a PDF.</p>
            </div>
            <span className="admin-item-count">
              {recentBills.length} bill(s)
            </span>
          </div>

          <div className="admin-catalog-search admin-history-search">
            <FaMagnifyingGlass />
            <input
              type="text"
              placeholder="Search by patient or bill number..."
              value={historySearch}
              onChange={(event) => setHistorySearch(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="admin-billing-empty">
              Loading billing records...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="admin-billing-empty">No bills found.</div>
          ) : (
            <div className="admin-history-list">
              {filteredHistory.map((bill) => {
                const billId = getId(bill);
                const billTotal = Number(bill.totalAmount || 0);
                const billPaid = Number(bill.paidAmount || 0);

                return (
                  <div className="admin-history-row" key={billId}>
                    <div className="admin-history-main">
                      <div className="admin-history-icon">
                        <FaFileInvoiceDollar />
                      </div>

                      <div>
                        <strong>
                          {bill.billNumber || `Bill ${billId.slice(-6)}`}
                        </strong>
                        <span>{getPatientName(bill.patient)}</span>
                        <small>
                          {bill.createdAt
                            ? new Date(bill.createdAt).toLocaleDateString("en-IN")
                            : "Date unavailable"}
                        </small>
                      </div>
                    </div>

                    <div className="admin-history-amount">
                      <strong>{formatCurrency(billTotal)}</strong>
                      <span>
                        Due:{" "}
                        {formatCurrency(Math.max(0, billTotal - billPaid))}
                      </span>
                      <span
                        className={`admin-payment-badge ${String(
                          bill.paymentStatus || "Pending"
                        )
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {bill.paymentStatus || "Pending"}
                      </span>
                    </div>

                    <div className="admin-history-actions">
                      <button
                        type="button"
                        className="admin-history-edit"
                        onClick={() => startEditingBill(bill)}
                        title="Edit bill"
                      >
                        <FaPenToSquare /> Edit
                      </button>

                      <button
                        type="button"
                        className="admin-history-download"
                        onClick={() => downloadBillPDF(bill)}
                        title="Download bill PDF"
                      >
                        <FaDownload /> PDF
                      </button>

                      <button
                        type="button"
                        className="admin-history-delete"
                        onClick={() => deleteBill(bill)}
                        title="Delete bill"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminBilling;
