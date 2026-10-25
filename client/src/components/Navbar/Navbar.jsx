import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Navbar = ({ cartCount = 0, onOpenCart }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky-top bg-white border-bottom shadow-sm">
      {/* Top Clinical Helpline Bar */}
      <div
        className="py-1 px-3 text-center text-white small fw-semibold"
        style={{ backgroundColor: "#000000", letterSpacing: "0.5px" }}
      >
        <span>
          📞 Clinic Toll-Free Consultation: <strong>1800-209-5292</strong>{" "}
          (9:00 AM - 8:00 PM IST)
        </span>
      </div>

      <nav className="navbar navbar-expand-lg bg-white py-2">
        <div className="container position-relative">

          {/* Brand */}
          <Link
            className="navbar-brand fw-bold d-flex align-items-center gap-2"
            to="/"
            style={{
              color: "#0e3b43",
              fontSize: "1.45rem",
              letterSpacing: "-0.5px",
            }}
          >
            <span>✨</span> DermCare
          </Link>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">

            {/* Main Nav Links */}
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-3 fw-semibold small text-uppercase">

              {/* Home */}
              <li className="nav-item">
                <Link className="nav-link text-dark" to="/">
                  Home
                </Link>
              </li>

              {/* Services */}
              <li className="nav-item">
                <Link className="nav-link text-dark fw-bold" to="/services">
                  Services
                </Link>
              </li>

              {/* Service Offers */}
              <li className="nav-item">
                <Link
                  className="nav-link text-danger fw-bold d-flex align-items-center gap-1"
                  to="/service-offers"
                >
                  Service Offers
                  <span
                    className="badge bg-danger text-white rounded-pill px-2 py-0"
                    style={{ fontSize: "0.6rem" }}
                  >
                    HOT
                  </span>
                </Link>
              </li>

              {/* Products Mega Dropdown */}
              <li
                className="nav-item position-relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <Link
                  className="nav-link text-dark d-flex align-items-center gap-1"
                  to="/products"
                >
                  Products <span style={{ fontSize: "0.65rem" }}>▼</span>
                </Link>

                {megaMenuOpen && (
                  <div
                    className="position-absolute bg-white shadow-lg rounded-4 p-4 border"
                    style={{
                      top: "100%",
                      left: "-120px",
                      width: "680px",
                      zIndex: 1050,
                    }}
                  >
                    <div className="row g-4 text-capitalize">

                      {/* Skin Types */}
                      <div className="col-4">
                        <h6
                          className="fw-bold text-dark border-bottom pb-2 mb-2"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Skin Types
                        </h6>

                        <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
                          <li>
                            <Link
                              to="/products"
                              className="text-decoration-none text-secondary"
                            >
                              Oily & Acne-Prone
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/products"
                              className="text-decoration-none text-secondary"
                            >
                              Dry & Barrier Care
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/products"
                              className="text-decoration-none text-secondary"
                            >
                              Sensitive & Rosacea
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/products"
                              className="text-decoration-none text-secondary"
                            >
                              Mature Anti-Aging
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Hair Concerns */}
                      <div className="col-4">
                        <h6
                          className="fw-bold text-dark border-bottom pb-2 mb-2"
                          style={{ fontSize: "0.9rem" }}
                        >
                          Hair Concerns
                        </h6>

                        <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
                          <li>
                            <Link
                              to="/products"
                              className="text-decoration-none text-secondary"
                            >
                              Hair Fall & Density
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/products"
                              className="text-decoration-none text-secondary"
                            >
                              Dandruff & Scalp Itch
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/products"
                              className="text-decoration-none text-secondary"
                            >
                              Dry & Damaged Hair
                            </Link>
                          </li>

                          <li>
                            <Link
                              to="/products"
                              className="text-decoration-none text-secondary"
                            >
                              Curly & Coarse Hair
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Treatment Hampers */}
                      <div className="col-4 bg-light rounded-3 p-3">
                        <h6
                          className="fw-bold text-dark mb-1"
                          style={{ fontSize: "0.88rem" }}
                        >
                          🎁 Treatment Hampers
                        </h6>

                        <p
                          className="small text-muted mb-2"
                          style={{ fontSize: "0.75rem" }}
                        >
                          Complete doctor regimens with bundled savings.
                        </p>

                        <Link
                          to="/products"
                          className="btn btn-sm btn-dark rounded-pill w-100 fw-bold"
                          style={{ fontSize: "0.75rem" }}
                        >
                          View All Hampers →
                        </Link>
                      </div>

                    </div>
                  </div>
                )}
              </li>

              {/* ONLY ONE BOOK APPOINTMENT */}
              <li className="nav-item">
                <Link
                  className="nav-link text-dark fw-bold"
                  to="/appointment"
                >
                  Book Appointment
                </Link>
              </li>

              {/* Clinic Portal */}
              {user && (
                <li className="nav-item">
                  <Link
                    className="nav-link text-primary fw-bold"
                    to="/dashboard"
                  >
                    Clinic Portal
                  </Link>
                </li>
              )}

            </ul>

            {/* Right Side Controls */}
            <div className="d-flex align-items-center gap-3">

              {/* Shopping Bag */}
              <button
                onClick={onOpenCart}
                className="btn btn-light rounded-circle position-relative p-2 border"
                style={{ width: "40px", height: "40px" }}
                title="View Shopping Bag"
              >
                🛍️

                {cartCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Logged In User */}
              {user ? (
                <>
                  <span className="badge bg-light text-dark border py-2 px-3 text-uppercase">
                    {user.name} ({user.role})
                  </span>

                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                  >
                    Logout
                  </button>
                </>
              ) : (
                /* Sign In Only */
                <Link
                  to="/login"
                  className="btn btn-outline-dark btn-sm rounded-pill px-3"
                >
                  Sign In
                </Link>
              )}

            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;