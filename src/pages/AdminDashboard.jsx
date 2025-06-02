// src/pages/AdminDashboard.jsx
import React, { useRef, useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FaTh,
  FaUser,
  FaCity,
  FaFileContract,
  FaMoneyBill,
  FaChartLine,
  FaBell,
  FaShieldAlt,
  FaCog,
  FaComment,
} from "react-icons/fa";

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    bookedCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("Admin token not found. Please login again.");
          return;
        }

        const [usersRes, propertiesRes, bookingsRes, bookingStatusRes] =
          await Promise.all([
            axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/admin/users-count`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/admin/properties-count`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/admin/bookings-count`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/admin/bookings-status`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);

        setStats({
          totalUsers: usersRes.data.totalUsers,
          totalProperties: propertiesRes.data.totalProperties,
          totalBookings: bookingsRes.data.totalBookings,
          bookedCount: bookingStatusRes.data.bookedCount,
          pendingCount: bookingStatusRes.data.pendingCount,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: "Booked", count: stats.bookedCount },
    { name: "Pending", count: stats.pendingCount },
  ];

  if (loading) return <p className="text-center mt-5">Loading analytics...</p>;

  return (
    <div className="container my-5 analytics-dashboard">
      <h2 className="text-center mb-4">📊 Analytics Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-center shadow-sm stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <p className="card-text display-6">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Properties</h5>
              <p className="card-text display-6">{stats.totalProperties}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center shadow-sm stat-card">
            <div className="card-body">
              <h5 className="card-title">Total Booked</h5>
              <p className="card-text display-6">{stats.totalBookings}</p>
            </div>
          </div>
        </div>
      </div>
      <h4 className="mt-5">Booking Status Overview</h4>
      <ResponsiveContainer width="70%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#dddd" />
        </BarChart>
      </ResponsiveContainer>

      <div className="text-center mt-4">
        <button className="btn btn-outline-primary px-4 py-2" disabled>
          Export Report (Coming Soon)
        </button>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });
  const [editUserId, setEditUserId] = useState(null);
  const [editRole, setEditRole] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
        newUser,
        {
          withCredentials: true,
        }
      );
      setUsers([...users, newUser]);
      setNewUser({ name: "", email: "", role: "", password: "" });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Do you want to delete this user?");
    if (!confirmDelete) return;
    const token = localStorage.getItem("token");
    try {
      await await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h3 className="mb-3 text-center">User Management</h3>

        <h5 className="mb-3">All Users</h5>
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ width: "200px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {editUserId === user._id ? (
                      <input
                        type="text"
                        className="form-control"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        placeholder="Edit Role"
                      />
                    ) : (
                      user.role
                    )}
                  </td>
                  <td>
                    {editUserId === user._id ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleEditRole(user._id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditUserId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h5 className="mt-5">Add New User</h5>
        <form onSubmit={handleAddUser} className="row g-3 mt-2">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-md-1">
            <button type="submit" className="btn btn-success w-100">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const PropertyManagement = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/properties`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        

        const propertiesWithLandlord = await Promise.all(
          response.data.map(async (property) => {
            if (typeof property.landlord === "object") {
              return { ...property, landlordData: property.landlord };
            }
            const landlordResponse = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/api/auth/user/${
                property.landlord
              }`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            return { ...property, landlordData: landlordResponse.data };
          })
        );

        setProperties(propertiesWithLandlord);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleApprove = async (propertyId) => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/properties/${propertyId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProperties((prev) =>
        prev.map((property) =>
          property._id === propertyId
            ? { ...property, status: "approved" }
            : property
        )
      );
    } catch (error) {
      console.error("Error approving property:", error);
    }
  };

  const handleReject = async (propertyId) => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/properties/${propertyId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProperties((prev) =>
        prev.map((property) =>
          property._id === propertyId
            ? { ...property, status: "rejected" }
            : property
        )
      );
    } catch (error) {
      console.error("Error rejecting property:", error);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProperties((prev) =>
        prev.filter((property) => property._id !== propertyId)
      );
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container my-4">
      <div className="card shadow p-4">
        <h3 className="mb-4 text-center">Property Management</h3>
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Location</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property._id}>
                  <td>
                    {property.images?.[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        style={{
                          width: "100px",
                          height: "70px",
                          objectFit: "cover",
                        }}
                        className="img-thumbnail"
                      />
                    ) : (
                      <span className="text-muted">No Image</span>
                    )}
                  </td>
                  <td>{property.title}</td>
                  <td>{property.location}</td>
                  <td>
                    {property.landlordData ? (
                      <>
                        <strong>{property.landlordData.name}</strong>
                        <br />
                        <small>{property.landlordData.email}</small>
                      </>
                    ) : (
                      "Unknown"
                    )}
                  </td>
                  <td>
                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button
                        onClick={() => handleDelete(property._id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const RentalAgreements = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/bookings`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust if needed
            },
          }
        );
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading)
    return <div className="text-center mt-4">Loading bookings...</div>;

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">Booking Overview</h3>
      <div className="table-responsive mt-3">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>No</th>
              <th>Tenant</th>
              <th>Property</th>
              <th>Landlord</th>
              <th>Status</th>
              <th>Date Booked</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={booking._id}>
                <td>{index + 1}</td>
                <td>
                  {booking.tenant?.name}
                  <br />
                  <small>{booking.tenant?.email}</small>
                </td>
                <td>{booking.property?.title}</td>
                <td>
                  {booking.property?.landlord?.name}
                  <br />
                  <small>{booking.property?.landlord?.email}</small>
                </td>
                <td>
                  <span
                    className={`badge ${
                      booking.status === "confirmed"
                        ? "bg-success"
                        : booking.status === "canceled"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td>{new Date(booking.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const receiptRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: "Payment Receipt",
  });

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in.");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/payments`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPayments(response.data); // Adjusted to match new data format
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load payments. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading)
    return <div className="text-center mt-5">Loading payments...</div>;
  if (error)
    return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <h3 className="mb-4">All Property Payments</h3>

      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-success">
              <tr>
                <th>Tenant</th>
                <th>Email</th>
                <th>Property</th>
                <th>Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Paid At</th>
                <th>Tx Ref</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.booking?.tenant?.email?.split("@")[0]}</td>
                  <td>{payment.booking?.tenant?.email}</td>
                  <td>{payment.booking?.property?.title || "N/A"}</td>
                  <td>{payment.booking?.property?.landlord?.email || "N/A"}</td>
                  <td>
                    {payment.amount} {payment.currency}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        payment.status === "success"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>{payment.tx_ref}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success me-2"
                      onClick={() => {
                        setPayments((prev) =>
                          prev.map((p) =>
                            p._id === payment._id
                              ? { ...p, showReceipt: true }
                              : p
                          )
                        );
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Receipts Modal-style View */}
          {payments.map(
            (payment) =>
              payment.showReceipt && (
                <div
                  key={payment._id}
                  className="mt-5 border rounded shadow-sm p-4 bg-white"
                  ref={receiptRef}
                >
                  <h4 className="text-success text-center mb-3">
                    <i className="bi bi-receipt-cutoff me-2"></i> Payment
                    Receipt
                  </h4>
                  <hr />
                  <p>
                    <strong>Tenant Email:</strong>{" "}
                    {payment.booking?.tenant?.email}
                  </p>
                  <p>
                    <strong>Property:</strong>{" "}
                    {payment.booking?.property?.title}
                  </p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {payment.booking?.property?.location || "N/A"}
                  </p>
                  <p>
                    <strong>Amount:</strong> {payment.amount} {payment.currency}
                  </p>
                  <p>
                    <strong>Status:</strong> {payment.status}
                  </p>
                  <p>
                    <strong>Transaction Ref:</strong> {payment.tx_ref}
                  </p>
                  <p>
                    <strong>Paid At:</strong>{" "}
                    {new Date(payment.paidAt).toLocaleString()}
                  </p>
                  <hr />
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={handlePrint}
                    >
                      <i className="bi bi-printer me-1"></i> Print
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() =>
                        setPayments((prev) =>
                          prev.map((p) =>
                            p._id === payment._id
                              ? { ...p, showReceipt: false }
                              : p
                          )
                        )
                      }
                    >
                      Close
                    </button>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
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

        if (response.data.role === "admin") {
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
        <h3 className="card-title text-center mb-4">Admin Profile Settings</h3>

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

const Feedback = () => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/contact`
        );
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      }
    };

    fetchFeedback();
  }, []);

  // Mark a message as read
  const handleMarkAsRead = async (id) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/contact/${id}/mark-read`
      );
      if (res.data) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === id ? { ...msg, read: true } : msg
          )
        );
        // Update unread count
        setUnreadCount((prevCount) => prevCount - 1);
      }
    } catch (err) {
      console.error("Error marking message as read", err);
    }
  };

  return (
    <div
      className="card my-4 shadow"
      style={{ borderRadius: "15px", overflow: "hidden" }}
    >
      <div
        className="card-header text-white"
        style={{
          background:
            "linear-gradient(135deg,rgb(36, 3, 69) 0%,rgb(86, 127, 197) 100%)",
          padding: "1rem 1.5rem",
          position: "sticky", // 👈 make it sticky
          top: "", // 👈 sticks when 1px from the top
          zIndex: 10, // 👈 optional, to stay above scrolling content
        }}
      >
        <h3 className="mb-0">User Feedback</h3>
      </div>
      <div
        className="card-body"
        style={{
          backgroundColor: "#f8f9fa",
          maxHeight: "500px",
          overflowY: "auto",
        }}
      >
        {messages.length === 0 ? (
          <p className="text-muted">No messages yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {messages.map((msg) => (
              <li
                key={msg._id}
                className="list-group-item"
                style={{
                  backgroundColor: "#ffffff",
                  borderLeft: "5px solidrgb(46, 109, 218)",
                  marginBottom: "10px",
                  borderRadius: "10px",
                }}
              >
                <h5 className="mb-1 text-primary">
                  {msg.name} <small className="text-muted">({msg.email})</small>
                </h5>
                <p className="mb-2 text-dark fst-italic">"{msg.message}"</p>
                <small className="text-secondary">
                  Sent on:{" "}
                  {msg.createdAt
                    ? new Date(msg.createdAt).toLocaleString()
                    : "Invalid date"}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [loggedInUser, setLoggedInUser] = useState({
    name: "Loading...",
    email: "Loading...",
  });
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

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

  // Logout functionality
  const logout = () => {
    localStorage.removeItem("token"); // Clear token from localStorage
    setLoggedInUser({ email: "Guest" });
    navigate("/login"); // Redirect to login page after logout
  };

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/contact`
        );
        const unreadMessages = res.data.filter((msg) => !msg.read);
        setUnreadCount(unreadMessages.length);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchUnreadMessages();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <button
        className="toggle-btn"
        onClick={toggleSidebar}
        style={{
          display: screenWidth <= 768 ? "block" : "none", // Use screenWidth instead of window.innerWidth
        }}
      >
        &#9776;
      </button>
      <nav
        className={`sidebar ${isSidebarVisible ? "visible" : ""}`}
        style={{
          position: window.innerWidth <= 768 ? "absolute" : "relative",
          top: window.innerWidth <= 768 ? "60px" : "0",
          width: "250px",
          transform:
            window.innerWidth <= 768
              ? isSidebarVisible
                ? "translateY(0)"
                : "translateY(-200%)"
              : "translateX(0)",
          zIndex: 999,
        }}
      >
        <ul>
          <li>
            <Link
              to="/admin/analytics"
              style={{
                marginBottom: "25px",
                marginLeft: "15px",
                marginTop: "25px",
                background: "#f9f9",
                fontSize: "20px",
              }}
            >
              <FaTh style={{ marginRight: "10px" }} />
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin/user-management">
              <FaUser style={{ marginRight: "10px" }} />
              User Management
            </Link>
          </li>
          <li>
            <Link to="/admin/property-management">
              <FaCity style={{ marginRight: "10px" }} />
              Property Mgmt
            </Link>
          </li>
          <li>
            <Link to="/admin/agreements">
              <FaFileContract style={{ marginRight: "10px" }} />
              Rental Agreements
            </Link>
          </li>
          <li>
            <Link to="/admin/payments">
              <FaMoneyBill style={{ marginRight: "10px" }} />
              Payment Mgmt
            </Link>
          </li>
          <li>
            <Link to="/admin/settings">
              <FaCog style={{ marginRight: "10px" }} />
              Settings
            </Link>
          </li>
          <li style={{ position: "relative" }}>
            <Link to="/admin/feedback" className="d-flex align-items-center">
              <FaComment style={{ marginRight: "10px" }} />
              Feedback
              {unreadCount > 0 && (
                <span
                  className="badge bg-danger rounded-pill ms-2"
                  style={{
                    fontSize: "0.7rem",
                    position: "absolute",
                    top: "0",
                    right: "-10px",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          </li>
        </ul>
        {/* Logout Button */}
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
              
              <FaUser className="account-icon" /> {/* Account Icon */}
              <h6>{loggedInUser.email}</h6>
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
                {/* Dropdown */}
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
                    {notifications.filter((note) => !note.isRead).length ===
                    0 ? (
                      <div style={{ fontStyle: "italic" }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications
                        .filter((note) => !note.isRead) // Filter only unread notifications
                        .map((note, index) => (
                          <div
                            key={index}
                            style={{
                              borderBottom: "1px solid #eee",
                              padding: "6px 0",
                              fontSize: "14px",
                            }}
                          >
                            {note.message}
                          </div>
                        ))
                    )}
                    {/* Mark all as read */}
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
                            `${
                              import.meta.env.VITE_API_BASE_URL
                            }/api/notifications/mark-read`,
                            {
                              method: "PUT",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );
                          if (res.ok) {
                            setNotifications((prevNotifications) =>
                              prevNotifications.map((note) => ({
                                ...note,
                                isRead: true,
                              }))
                            ); // Mark all as read in UI
                            setUnreadCount(0); // Reset unread count
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
            </div>
          </div>
        </header>

        {/* Routes */}
        <div className="content-area">
          <Routes>
            <Route path="/" element={<Analytics />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route
              path="/property-management"
              element={<PropertyManagement />}
            />
            <Route path="/agreements" element={<RentalAgreements />} />
            <Route path="/payments" element={<PaymentManagement />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/feedback" element={<Feedback />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
