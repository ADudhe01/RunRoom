import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          RunRoom
        </Link>
        <div className="nav-links">
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
      </div>

      <div className="navbar-right">
        <motion.div
          className="points-pill"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          ⭐ {Math.floor(points)} pts
        </motion.div>

        {user ? (
          <>
            <Link to="/profile" className="user-chip">
              <span className="user-chip__avatar">{getInitials(user.name)}</span>
              <span className="user-chip__label">Profile</span>
            </Link>
            <button className="ghost-button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/profile" className="ghost-button">
              Login
            </Link>
            <Link to="/register" className="primary-button compact">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
