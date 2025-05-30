import React, { useEffect, useState } from "react";

const LandlordBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch bookings from the backend
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
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Update booking status (Confirm or Cancel)
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

      fetchBookings(); // Refresh data after updating status
    } catch (err) {
      alert("Error updating booking: " + err.message);
    }
  };

  // Delete a booking using the backend DELETE route
  const deleteBooking = async (bookingId) => {
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

      fetchBookings(); // Refresh data after deletion
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
      ) : (
        <table className="table table-bordered mt-3">
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
                    <span className="badge bg-warning text-dark">Pending</span>
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
                  {/* Only allow status updates if NOT paid */}
                  {booking.status === "pending" &&
                    booking.paymentStatus !== "paid" && (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => updateStatus(booking._id, "confirmed")}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-danger btn-sm me-2"
                          onClick={() => updateStatus(booking._id, "cancelled")}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                  {/* Show delete button ONLY if paymentStatus is NOT "paid" */}
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
      )}
    </div>
  );
};

export default LandlordBookings;
