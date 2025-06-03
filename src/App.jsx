import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { jwtDecode as jwt_decode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import LandlordDashboard from "./pages/LandlordDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import PropertyList from "./components/PropertyList";
import socket from "./socket";
import Messages from "../src/components/Messages"
import ChapaCallback from "./components/ChapaCallback";

function App() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUserRole(decoded.role);

        // 🔌 Join the socket room
        socket.emit("join", decoded.id);

        // 🔔 Listen for real-time notifications
        socket.on("notification", (data) => {
          toast.info(data.message); // show toast notification
        });
      } catch (err) {
        console.error("Invalid token", err);
        localStorage.removeItem("token");
      }
    }
    setLoading(false); // Mark as done

    return () => {
      socket.disconnect(); // Clean up socket connection on unmount
    };
  }, []);

  const isAuthenticated = () => !!localStorage.getItem("token");

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <main className="App-contain">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/login"
              element={<Login setUserRole={setUserRole} />}
            />
            <Route
              path="/admin/*"
              element={
                isAuthenticated() && userRole === "admin" ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/landlord/*"
              element={
                isAuthenticated() && userRole === "landlord" ? (
                  <LandlordDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/tenant/*"
              element={
                isAuthenticated() && userRole === "tenant" ? (
                  <TenantDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/properties" element={<PropertyList />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route
              path="/messages/:propertyId/:otherId"
              element={<Messages />}
            />
            <Route path="/chapa/callback" element={<ChapaCallback />} />
          </Routes>
        </main>
        {/* 🧁 Toast Container for Notifications */}
        <ToastContainer position="top-right" autoClose={5000} />
        <div className="telegram-bot">
          <a
            href="https://t.me/house_rental_system_bot"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-telegram fa-3x"></i>
          </a>
        </div>
      </div>
    </Router>
  );
}

export default App;
