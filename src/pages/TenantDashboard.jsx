import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaBell,
  FaHome,
  FaList,
  FaCog,
  FaQuestionCircle,
  FaUser,
} from "react-icons/fa";
import axios from "axios";
// Import components
import Messages from "../components/Messages";
import Support from "../components/Support";
import PropertyList from "../components/PropertyList";
import TenantBookings from "../components/TenantBookings";
import BookProperty from "../components/BookProperty";
import TenantHome from "../components/TenantHome";

const TenantDashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState({
    name: "Loading...",
    email: "Loading...",
  });
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const navigate = useNavigate();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoggedInUser({ email: "Guest" });
        return;
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        if (response.ok) setLoggedInUser(data);
        else setLoggedInUser({ email: "Guest" });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoggedInUser({ email: "Guest" });
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/notifications`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedInUser({ email: "Guest" });
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };
  const Settings = () => {
    const [profile, setProfile] = useState({ name: "", email: "", role: "" });
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            setMessage("No token found. Please log in.");
            setLoading(false);
            return;
          }

          const response = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data.role === "tenant") {
            setProfile(response.data);
          } else {
            setMessage("Unauthorized access! Not an admin.");
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setMessage("Failed to load profile.");
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMessage("No token found. Please log in.");
          return;
        }

        const response = await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/user`,
          { ...profile, password },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setMessage("Profile updated successfully");
        setPassword("");
      } catch (err) {
        console.error("Update failed", err);
        setMessage("Update failed. Please try again.");
      }
    };

    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="container mt-5">
        <div className="card shadow-sm p-4 bg-white rounded">
          <h3 className="card-title text-center mb-4">
            Tenant Profile Settings
          </h3>

          <div className="row mt-3">
            <div className="col-md-6 mb-4 mb-md-0">
              <h4>User Profile</h4>
              {profile && Object.keys(profile).length > 0 ? (
                <div>
                  <p>
                    <strong>Name:</strong> {profile.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {profile.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {profile.role}
                  </p>
                </div>
              ) : (
                <p>No profile found.</p>
              )}
            </div>
            <div className="col-md-6">
              {message && (
                <div className="alert alert-info text-center" role="alert">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="form-control"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    New Password (optional)
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 mt-2">
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Toggle Button */}
      <button
        className="toggle-btn"
        onClick={toggleSidebar}
        style={{
          display: window.innerWidth <= 768 ? "block" : "none",
        }}
      >
        &#9776;
      </button>

      {/* Sidebar */}
      <nav
        className={`sidebar ${isSidebarVisible ? "visible" : ""}`}
        style={{
          position: screenWidth <= 768 ? "absolute" : "relative",
          top: window.innerWidth <= 768 ? "60px" : "0",
          transform:
            window.innerWidth <= 768
              ? isSidebarVisible
                ? "translateY(0)"
                : "translateY(-200%)"
              : "translateX(0)",
          zIndex: 999,
        }}
      >
        <div>
          <h3>Dashboard</h3>
          <ul>
            <li>
              <Link
                to="/tenant"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaHome /> Home
              </Link>
            </li>
            <li>
              <Link
                to="/tenant/propertylist"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaPlus /> Book now
              </Link>
            </li>
            <li>
              <Link
                to="/tenant/bookings"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaList /> Booking Lists
              </Link>
            </li>
            <li>
              <Link
                to="/tenant/support"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaQuestionCircle /> Support
              </Link>
            </li>
            <li>
              <Link to="/tenant/settings">
                <FaCog style={{ marginRight: "10px" }} />
                Settings
              </Link>
            </li>
          </ul>
        </div>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <header className="account-header">
          <div
            className="account-info"
            style={{
              display: "flex",
              flexFlow: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div className="account">
              <div
                className="notifications"
                style={{ position: "relative", cursor: "pointer" }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-8px",
                      backgroundColor: "red",
                      color: "white",
                      fontSize: "12px",
                      borderRadius: "50%",
                      padding: "2px 6px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
                {showNotifications && (
                  <div
                    style={{
                      position: "absolute",
                      top: "30px",
                      right: "0",
                      backgroundColor: "white",
                      boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                      padding: "10px",
                      width: "250px",
                      zIndex: 1000,
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                      Notifications
                    </div>
                    {notifications.filter((n) => !n.isRead).length === 0 ? (
                      <div style={{ fontStyle: "italic" }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications
                        .filter((n) => !n.isRead)
                        .map((n, i) => (
                          <div
                            key={i}
                            style={{
                              borderBottom: "1px solid #eee",
                              padding: "6px 0",
                              fontSize: "14px",
                            }}
                          >
                            {n.message}
                          </div>
                        ))
                    )}
                    <button
                      style={{
                        marginTop: "8px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        const token = localStorage.getItem("token");
                        try {
                          const res = await fetch(
                            `${import.meta.env.VITE_API_BASE_URL}/api/notifications/mark-read`,
                            {
                              method: "PUT",
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          if (res.ok) {
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, isRead: true }))
                            );
                            setUnreadCount(0);
                            setShowNotifications(false);
                          }
                        } catch (err) {
                          console.error(
                            "Error marking notifications as read",
                            err
                          );
                        }
                      }}
                    >
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>
              <FaUser className="account-icon" />
              <h6>{loggedInUser.email}</h6>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Routes>
            <Route path="/" element={<TenantHome />} />
            <Route
              path="bookings"
              element={<TenantBookings user={loggedInUser} />}
            />
            <Route path="propertylist" element={<PropertyList />} />
            <Route path="messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="support"
              element={<Support loggedInUser={loggedInUser} />}
            />
            <Route path="book/:propertyId" element={<BookProperty />} />
            <Route
              path="/messages/:propertyId/:otherId"
              element={<Messages />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default TenantDashboard;
