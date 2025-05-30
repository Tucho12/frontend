import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaBell,
  FaHome,
  FaList,
  FaMoneyBill,
  FaCog,
  FaQuestionCircle,
  FaUser,
  FaCalendarCheck,
  FaCommentAlt, // Added Messenger icon
  FaTimes, // Added X icon
} from "react-icons/fa";
import axios from "axios";
import PropertyUpload from "../components/PropertyUpload";
import Listings from "../components/Listings";
import LandlordHome from "../components/LandlordHome";
import Support from "../components/Support";
import Payments from "../components/Payments";
import LandlordBookings from "../components/LandlordBookings";

const LandlordDashboard = () => {
  const [loggedInUser, setLoggedInUser] = useState({
    name: "Loading...",
    email: "Guest",
  });
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessages, setShowMessages] = useState(false); // State to toggle message panel
  const [messages, setMessages] = useState([]); // To store the messages
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [replyText, setReplyText] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState(null);


  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch logged-in user data from the backend
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
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setLoggedInUser(data); // Set the fetched user data
        } else {
          console.error("Failed to fetch user data:", data.message);
          setLoggedInUser({ email: "Guest" });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoggedInUser({ email: "Guest" });
      }
    };
    fetchUserData();
  }, []);

  // Fetch notifications and calculate unread count
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/notifications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications); // Set all notifications
          setUnreadCount(data.unreadCount); // Set unread count
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();
  }, []);

  const fetchMessages = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        const userId = loggedInUser._id; // Current landlord ID

        // Filter messages where landlord is either sender or receiver
        const landlordMessages = data.filter(
          (msg) => msg.receiver._id === userId || msg.sender._id === userId
        );

        // Group by tenant ID
        const groupedMessages = {};

        landlordMessages.forEach((msg) => {
          const tenantId =
            msg.sender.role === "tenant" ? msg.sender._id : msg.receiver._id;
          if (!groupedMessages[tenantId]) {
            groupedMessages[tenantId] = [];
          }
          groupedMessages[tenantId].push(msg);
        });

        setMessages(groupedMessages);
      } else {
        console.error("Failed to fetch messages:", response.statusText);
        setMessages({});
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages({});
    }
  };

  // Fetch messages
  useEffect(() => {
    if (loggedInUser && loggedInUser._id) {
      fetchMessages();
    }
  }, [loggedInUser]);


  // Logout functionality
  const logout = () => {
    localStorage.removeItem("token"); // Clear token from localStorage
    setLoggedInUser({ email: "Guest" });
    navigate("/login"); // Redirect to login page after logout
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Handle sending a reply
  const handleSendReply = async () => {
    const token = localStorage.getItem("token");
    if (!token || replyText.trim() === "" || !selectedTenantId) {
      alert("Please select a tenant and enter a message.");
      return;
    }
    try {
      const userId = loggedInUser._id;

      // ✅ Correct way to get last message
      const lastMessage = messages[selectedTenantId]?.slice(-1)[0];
      const propertyId = lastMessage?.property?._id;

      if (!userId || !propertyId) {
        console.error("Missing required fields for sending reply");
        alert("Sender or Property ID is missing.");
        return;
      }

      const messageData = {
        sender: userId,
        receiver: selectedTenantId, // landlord replying to tenant
        property: propertyId,
        content: replyText,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(messageData),
        }
      );

      if (response.ok) {
        const newMessage = await response.json();
        setReplyText("");

        // ✅ Update the messages correctly
        setMessages((prevMessages) => ({
          ...prevMessages,
          [selectedTenantId]: [...prevMessages[selectedTenantId], newMessage],
        }));

        alert("Reply sent successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to send reply:", errorData);
        alert(`Failed to send reply: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert(`Error sending reply: ${error.message}`);
    }
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

          if (response.data.role === "landlord") {
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
            Landlord Profile Settings
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
          display: screenWidth <= 768 ? "block" : "none", // Use screenWidth instead of window.innerWidth
        }}
      >
        &#9776;
      </button>

      {/* Sidebar */}
      <nav
        className={`sidebar ${isSidebarVisible ? "visible" : ""}`}
        style={{
          position: window.innerWidth <= 768 ? "absolute" : "relative",
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
                className="plus"
                to="/landlord/propertyupload"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaPlus />
                Create Listing
              </Link>
            </li>
            <li>
              <Link
                to="/landlord"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaHome />
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/landlord/listings"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaList />
                Listings
              </Link>
            </li>
            <li>
              <Link
                to="/landlord/booked"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaCalendarCheck />
                Booked
              </Link>
            </li>
            <li>
              <Link
                to="/landlord/support"
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaQuestionCircle />
                Support
              </Link>
            </li>
             <li>
                          <Link to="/landlord/settings">
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
        {/* Header Section */}
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
              {/* 🔔 Notifications */}
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

              {/* 📨 Messenger Icon */}
              <div
                className="messages"
                style={{
                  position: "relative",
                  cursor: "pointer",
                  marginLeft: "20px",
                }}
                onClick={() => setShowMessages(!showMessages)}
              >
                <FaCommentAlt size={20} />
                {/* Show red badge for unread messages */}
                {Object.values(messages).some((tenantMsgs) =>
                  tenantMsgs.some(
                    (msg) => !msg.isRead && msg.sender.role === "tenant"
                  )
                ) && (
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
                    {/* Optional: show total number of unread messages */}
                    {
                      Object.values(messages)
                        .flat()
                        .filter(
                          (msg) => !msg.isRead && msg.sender.role === "tenant"
                        ).length
                    }
                  </span>
                )}
              </div>

              {/* Message Panel */}
              {showMessages && (
                <div
                  style={{
                    position: "absolute",
                    top: "90px",
                    right: "0",
                    backgroundColor: "white",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                    padding: "10px",
                    width: "350px",
                    zIndex: 1000,
                    maxHeight: "500px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Title and Close */}
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    Messages
                    <FaTimes
                      style={{ cursor: "pointer", fontSize: "16px" }}
                      onClick={() => setShowMessages(false)}
                    />
                  </div>

                  {/* List of Tenants */}
                  <div
                    style={{
                      marginBottom: "10px",
                      borderBottom: "1px solid #ccc",
                      paddingBottom: "8px",
                    }}
                  >
                    {messages && Object.keys(messages).length === 0 ? (
                      <div style={{ fontStyle: "italic" }}>No messages</div>
                    ) : (
                      messages &&
                      Object.keys(messages).map((tenantId) => (
                        <div
                          key={tenantId}
                          style={{
                            padding: "6px",
                            backgroundColor:
                              selectedTenantId === tenantId ? "#eee" : "#fff",
                            borderBottom: "1px solid #f0f0f0",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedTenantId(tenantId)}
                        >
                          {messages[tenantId][0]?.sender?.name ||
                            messages[tenantId][0]?.sender?.email ||
                            "Tenant"}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Window */}
                  <div
                    style={{
                      flexGrow: 1,
                      overflowY: "auto",
                      paddingRight: "5px",
                    }}
                  >
                    {selectedTenantId && messages[selectedTenantId] ? (
                      messages[selectedTenantId]
                        .sort(
                          (a, b) =>
                            new Date(a.createdAt) - new Date(b.createdAt)
                        )
                        .map((msg) => {
                          const isLandlordMessage =
                            msg.sender._id === loggedInUser._id;
                          return (
                            <div
                              key={msg._id}
                              style={{
                                marginBottom: "10px",
                                textAlign: isLandlordMessage ? "right" : "left",
                              }}
                            >
                              <div
                                style={{
                                  display: "inline-block",
                                  maxWidth: "70%",
                                  padding: "8px 12px",
                                  borderRadius: "12px",
                                  backgroundColor: isLandlordMessage
                                    ? "#4caf50"
                                    : "#f1f1f1",
                                  color: isLandlordMessage ? "white" : "black",
                                }}
                              >
                                {msg.content}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div
                        style={{
                          fontStyle: "italic",
                          textAlign: "center",
                          marginTop: "20px",
                        }}
                      >
                        Select a tenant to view messages
                      </div>
                    )}
                  </div>

                  {/* Reply Box */}
                  {selectedTenantId && (
                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                        }}
                      />
                      <button
                        onClick={handleSendReply}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "#4caf50",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                        }}
                      >
                        Send
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Account Icon */}
              <FaUser className="account-icon" />
              <h6>{loggedInUser.email}</h6>
            </div>
          </div>
        </header>

        {/* Routes */}
        <div className="content-area">
          <Routes>
            <Route path="/" element={<LandlordHome />} />
            <Route path="propertyupload" element={<PropertyUpload />} />
            <Route path="listings" element={<Listings />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="support"
              element={<Support loggedInUser={loggedInUser} />}
            />
            <Route path="booked" element={<LandlordBookings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default LandlordDashboard;
