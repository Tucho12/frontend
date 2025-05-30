import React, { useEffect, useState } from "react";
import axios from "axios";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in.");
          return;
        }


        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/payment/landlord-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPayments(response.data);
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
      <h3 className="mb-4">Your Property Payments</h3>

      {payments.length === 0 ? (
        <p>No paid bookings yet.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-success">
              <tr>
                <th>Email</th>
                <th>Property</th>
                <th>Payment Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  <td>{payment.tenant?.email || "N/A"}</td>
                  <td>{payment.property?.title || "N/A"}</td>
                  <td>
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <span className="badge bg-success">Paid</span>
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

export default Payments;
