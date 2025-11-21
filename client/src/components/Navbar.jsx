import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/room", label: "Room" },
];

function getInitials(name = "") {
  const [first = "", second = ""] = name.trim().split(" ");
  const initials = `${first[0] || ""}${second[0] || ""}`;
  return initials.toUpperCase() || "RR";
}

export default function Navbar() {
  const { user, points, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const handleMobileLinkClick = (to) => {
    navigate(to);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo-container">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="RunRoom" className="logo-img" />
            <span className="logo-text">RunRoom</span>
          </Link>
        </div>

        <div className="nav-links desktop-only">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={location.pathname === link.to ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <motion.div
            className="points-pill desktop-only"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            ⭐ {Math.floor(points)} pts
          </motion.div>

          {user ? (
            <>
              <Link to="/profile" className="user-chip desktop-only">
                <span className="user-chip__avatar">{getInitials(user.name)}</span>
                <span className="user-chip__label">Profile</span>
              </Link>
              <button className="ghost-button desktop-only" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/profile" className="ghost-button desktop-only">
                Login
              </Link>
              <Link to="/register" className="primary-button compact desktop-only">
                Register
              </Link>
            </>
          )}

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={isMobileMenuOpen ? "open" : ""}></span>
            <span className={isMobileMenuOpen ? "open" : ""}></span>
            <span className={isMobileMenuOpen ? "open" : ""}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Side Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-menu-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="mobile-menu-header">
                <motion.div
                  className="points-pill mobile-points"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                >
                  ⭐ {Math.floor(points)} pts
                </motion.div>
              </div>

              <div className="mobile-menu-content">
                <nav className="mobile-nav-links">
                  {NAV_LINKS.map((link, index) => (
                    <motion.button
                      key={link.to}
                      className={`mobile-nav-link ${
                        location.pathname === link.to ? "active" : ""
                      }`}
                      onClick={() => handleMobileLinkClick(link.to)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      {link.label}
                    </motion.button>
                  ))}
                </nav>

                <div className="mobile-menu-divider"></div>

                <div className="mobile-menu-actions">
                  {user ? (
                    <>
                      <motion.button
                        className="mobile-nav-link profile-link"
                        onClick={() => handleMobileLinkClick("/profile")}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <span className="user-chip__avatar">{getInitials(user.name)}</span>
                        <span>Profile</span>
                      </motion.button>
                      <motion.button
                        className="mobile-nav-link logout-link"
                        onClick={handleLogout}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Logout
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        className="mobile-nav-link secondary"
                        onClick={() => handleMobileLinkClick("/profile")}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        Login
                      </motion.button>
                      <motion.button
                        className="mobile-nav-link primary"
                        onClick={() => handleMobileLinkClick("/register")}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        Register
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
