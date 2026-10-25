import React, { useState, useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

// API, Context & Protected Route
import API from "./api/axios";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layout & Global Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import AIAssistantWidget from "./components/AIAssistantWidget/AIAssistantWidget";

// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import DoctorDashboard from "./pages/Dashboard/DoctorDashboard";
import ReceptionistDashboard from "./pages/Dashboard/ReceptionistDashboard";
import PatientDashboard from "./pages/Dashboard/PatientDashboard";

import Appointment from "./pages/Appointment/Appointment";
import ThankYou from "./pages/Appointment/ThankYou";

// Appointment Management
import AppointmentManagement from "./pages/AppointmentManagement/AppointmentManagement";

import Products from "./pages/Products/Products";
import Services from "./pages/Services/Services";
import ServiceOffers from "./pages/Offers/ServiceOffers";

import PatientHistory from "./pages/Treatments/PatientHistory";

// Patient Records
import PatientRecords from "./pages/PatientRecords/PatientRecords";

// Patient Profile
import PatientProfile from "./pages/PatientProfile/PatientProfile";

// My Appointments
import MyAppointments from "./pages/MyAppointments/MyAppointments";

// Billing
import Billing from "./pages/Billing/Billing";

// Prescriptions
import Prescriptions from "./pages/Prescriptions/Prescriptions";

import NotFound from "./pages/NotFound/NotFound";


// ========================================
// ROLE DASHBOARD
// ========================================

function RoleDashboard() {
  const { user } = useContext(AuthContext);

  const role = user?.role?.toLowerCase().trim();

  if (role === "patient") return <PatientDashboard />;
  if (role === "doctor") return <DoctorDashboard />;
  if (role === "receptionist") return <ReceptionistDashboard />;
  if (role === "admin") return <AdminDashboard />;

  return <Navigate to="/login" replace />;
}


// ========================================
// APP CONTENT
// ========================================

function AppContent() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);


  // ========================================
  // ADD TO CART
  // ========================================

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          qty: 1,
        },
      ];
    });

    setIsCartOpen(true);
  };


  // ========================================
  // REMOVE FROM CART
  // ========================================

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev.filter(
        (item) => item.id !== id
      )
    );
  };


  // ========================================
  // CART TOTAL
  // ========================================

  const cartTotal = cart.reduce(
    (acc, item) =>
      acc + item.price * item.qty,
    0
  );


  // ========================================
  // CHECKOUT
  // ========================================

  const handleCheckout = async () => {
    if (!user) {
      setIsCartOpen(false);

      alert(
        "Please sign in as a Patient to place your order and track pickup."
      );

      navigate("/login");
      return;
    }

    setOrderProcessing(true);

    const pickupDate = new Date();

    pickupDate.setDate(
      pickupDate.getDate() + 1
    );

    const pickupDateString =
      pickupDate.toLocaleDateString(
        "en-IN",
        {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );


    const orderPayload = {
      orderId: `ORD-${Math.floor(
        100000 + Math.random() * 900000
      )}`,

      items: [...cart],

      totalAmount: cartTotal,

      orderDate:
        new Date().toLocaleDateString(
          "en-IN"
        ),

      pickupDate: pickupDateString,

      pickupTimeSlot:
        "10:00 AM - 07:00 PM",

      pickupAddress:
        "DermCare Clinic, 2nd Floor, Healthcare Arcade, Opp. City Mall",

      userEmail: user.email,

      userName: user.name,
    };


    try {
      await API.post(
        "/orders/confirm-order",
        orderPayload
      );
    } catch (err) {
      console.warn(
        "Email service notice:",
        err.response?.data ||
          err.message
      );
    }


    const existingOrders =
      JSON.parse(
        localStorage.getItem(
          `dermcare_orders_${user.email}`
        ) || "[]"
      );


    localStorage.setItem(
      `dermcare_orders_${user.email}`,
      JSON.stringify([
        orderPayload,
        ...existingOrders,
      ])
    );


    setCart([]);

    setOrderProcessing(false);

    setIsCartOpen(false);


    navigate("/dashboard", {
      state: {
        newOrder: orderPayload,
      },
    });
  };


  // ========================================
  // UI
  // ========================================

  return (
    <>
      <Navbar
        cartCount={cart.reduce(
          (a, b) => a + b.qty,
          0
        )}
        onOpenCart={() =>
          setIsCartOpen(true)
        }
      />

      <main
        style={{
          minHeight: "85vh",
        }}
      >
        <Routes>

          {/* HOME */}

          <Route
            path="/"
            element={<Home />}
          />


          {/* PUBLIC PAGES */}

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/service-offers"
            element={<ServiceOffers />}
          />

          <Route
            path="/products"
            element={
              <Products
                cart={cart}
                addToCart={addToCart}
              />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />


          {/* APPOINTMENT */}

          <Route
            path="/appointment"
            element={<Appointment />}
          />

          <Route
            path="/thank-you"
            element={<ThankYou />}
          />


          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleDashboard />
              </ProtectedRoute>
            }
          />


          {/* APPOINTMENT MANAGEMENT */}

          <Route
            path="/appointment-management"
            element={
              <ProtectedRoute>
                <AppointmentManagement />
              </ProtectedRoute>
            }
          />


          {/* PATIENT RECORDS */}

          <Route
            path="/patient-records"
            element={
              <ProtectedRoute>
                <PatientRecords />
              </ProtectedRoute>
            }
          />


          {/* PATIENT PROFILE */}

          <Route
            path="/patient-profile"
            element={
              <ProtectedRoute>
                <PatientProfile />
              </ProtectedRoute>
            }
          />


          {/* MY APPOINTMENTS */}

          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute>
                <MyAppointments />
              </ProtectedRoute>
            }
          />


          {/* PATIENT TREATMENT HISTORY */}

          <Route
            path="/treatments/patient/:patientId"
            element={
              <ProtectedRoute>
                <PatientHistory />
              </ProtectedRoute>
            }
          />


          {/* BILLING */}

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />


          {/* PRESCRIPTIONS */}

          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute>
                <Prescriptions />
              </ProtectedRoute>
            }
          />


          {/* 404 */}

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </main>


      {/* FOOTER */}

      <Footer />


      {/* SHOPPING CART */}

      {isCartOpen && (
        <div
          className="position-fixed top-0 end-0 h-100 bg-white shadow-lg p-4"
          style={{
            width: "400px",
            maxWidth: "90vw",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
          }}
        >

          <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">

            <h5 className="fw-bold mb-0">
              Clinical Order Bag ({cart.length})
            </h5>

            <button
              onClick={() =>
                setIsCartOpen(false)
              }
              className="btn-close"
            ></button>

          </div>


          <div className="flex-grow-1 overflow-auto pe-1">

            {cart.length === 0 ? (

              <div className="text-center text-muted py-5">

                <div className="fs-1 mb-2">
                  🛍️
                </div>

                <p>
                  Your bag is empty.
                </p>

              </div>

            ) : (

              cart.map((item) => (

                <div
                  key={item.id}
                  className="d-flex align-items-center gap-3 mb-3 p-2 bg-light rounded-3"
                >

                  <img
                    src={item.img}
                    alt={item.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />

                  <div className="flex-grow-1">

                    <div className="small fw-bold text-dark">
                      {item.name}
                    </div>

                    <div className="small text-muted">
                      ₹{item.price} × {item.qty}
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.id)
                    }
                    className="btn btn-sm text-danger border-0"
                  >
                    ✕
                  </button>

                </div>

              ))

            )}

          </div>


          {cart.length > 0 && (

            <div className="border-top pt-3">

              <div className="d-flex justify-content-between fw-bold mb-2">

                <span>
                  Total Amount:
                </span>

                <span>
                  ₹{cartTotal}
                </span>

              </div>


              <p
                className="text-muted small mb-3"
                style={{
                  fontSize: "0.75rem",
                }}
              >
                📦{" "}
                <em>
                  Free In-Clinic Packaging & Regimen Guide included.
                </em>
              </p>


              <button
                onClick={handleCheckout}
                disabled={orderProcessing}
                className="btn btn-dark w-100 py-2 rounded-pill fw-bold"
              >
                {orderProcessing
                  ? "Securing Order..."
                  : "Place Order & Clinic Pickup →"}
              </button>

            </div>

          )}

        </div>
      )}


      {/* AI ASSISTANT */}

      <AIAssistantWidget />

    </>
  );
}


// ========================================
// APP
// ========================================

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


export default App;