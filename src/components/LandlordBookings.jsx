import React, { useEffect, useState } from "react";

const LandlordBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/bookings/landlord`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch bookings.");

      setBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      fetchBookings();
    } catch (err) {
      alert("Error updating booking: " + err.message);
    }
  };

  const deleteBooking = async (bookingId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this booking?"
    );
    if (!confirmDelete) return; // Stop if the user cancels

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete booking");

      fetchBookings(); // Refresh data
    } catch (err) {
      alert("Error deleting booking: " + err.message);
    }
  };
  

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5">
      <h2>Bookings for My Properties</h2>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : isMobile ? (
        // Mobile View - Card Layout
        <div className="d-flex flex-column gap-3">
          {bookings.map((booking) => (
            <div key={booking._id} className="card shadow-sm p-3">
              <p>
                <strong>Property: </strong>
                {booking.property?.title}
              </p>
              <p>
                <strong>Tenant:</strong> {booking.tenant?.name || "Tenant"}
              </p>
              <p>
                <strong>Check-In:</strong>{" "}
                {new Date(booking.startDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Check-Out:</strong>{" "}
                {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Status:</strong> {booking.status}
              </p>
              <p>
                <strong>Payment:</strong>{" "}
                {booking.paymentStatus === "paid" ? (
                  <span className="badge bg-success">Paid</span>
                ) : booking.paymentStatus === "pending" ? (
                  <span className="badge bg-warning text-dark">Pending</span>
                ) : (
                  <span className="badge bg-danger">Failed</span>
                )}
              </p>
              <p>
                <strong>Paid At:</strong>{" "}
                {booking.paidAt
                  ? new Date(booking.paidAt).toLocaleDateString()
                  : "N/A"}
              </p>

              <div className="d-flex flex-wrap gap-2 mt-2">
                {booking.status === "pending" &&
                  booking.paymentStatus !== "paid" && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => updateStatus(booking._id, "confirmed")}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateStatus(booking._id, "cancelled")}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                {booking.paymentStatus !== "paid" && (
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => deleteBooking(booking._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop View - Table
        <div className="table-responsive mt-3">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id}>
                  <td>{booking.property?.title}</td>
                  <td>{booking.tenant?.name || "Tenant"}</td>
                  <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                  <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                  <td>{booking.status}</td>
                  <td>
                    {booking.paymentStatus === "paid" ? (
                      <span className="badge bg-success">Paid</span>
                    ) : booking.paymentStatus === "pending" ? (
                      <span className="badge bg-warning text-dark">
                        Pending
                      </span>
                    ) : (
                      <span className="badge bg-danger">Failed</span>
                    )}
                  </td>
                  <td>
                    {booking.paidAt
                      ? new Date(booking.paidAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    {booking.status === "pending" &&
                      booking.paymentStatus !== "paid" && (
                        <>
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() =>
                              updateStatus(booking._id, "confirmed")
                            }
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-danger btn-sm me-2"
                            onClick={() =>
                              updateStatus(booking._id, "cancelled")
                            }
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    {booking.paymentStatus !== "paid" && (
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => deleteBooking(booking._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LandlordBookings;
