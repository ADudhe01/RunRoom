import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Room3D from "./pages/Room3D";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";

function PageShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageShell>
              <Home />
            </PageShell>
          }
        />
        <Route
          path="/shop"
          element={
            <PageShell>
              <Shop />
            </PageShell>
          }
        />
        <Route
          path="/room"
          element={
            <PageShell>
              <Room3D />
            </PageShell>
          }
        />
        <Route
          path="/profile"
          element={
            <PageShell>
              <Profile />
            </PageShell>
          }
        />
        <Route
          path="/register"
          element={
            <PageShell>
              <Register />
            </PageShell>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-root">
        <Navbar />
        <main className="app-main">
          <AnimatedRoutes />
        </main>
      </div>
    </Router>
  );
}
