import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const ChapaCallback = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const receiptRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: "Chapa Payment Receipt",
  });

 useEffect(() => {
  const verifyPayment = async () => {
    const params = new URLSearchParams(location.search);
    const tx_ref = params.get("tx_ref");

    console.log("Verifying payment with tx_ref:", tx_ref); 

    if (!tx_ref) {
      setError("Missing transaction reference.");
      setLoading(false);
      return;
    }

    try {

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/verify/${tx_ref}`
      );

      console.log("Verification response:", response.data); // Log response

      if (
        response.status === 200 &&
        response.data?.message === "Payment verified successfully"
      ) {
        setReceipt(response.data.data);
      } else {
        setError(response.data?.message || "Payment verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err); // Full error object
      setError(
        err.response?.data?.message ||
          err.message ||
          "Error verifying payment."
      );
    } finally {
      setLoading(false);
    }
  };

  verifyPayment();
}, [location.search]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Verifying payment...</span>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="alert alert-danger w-75 text-center" role="alert">
          ❌ {error}
        </div>
      </div>
    );

  if (!receipt) return null;

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div
            ref={receiptRef}
            className="border rounded shadow-sm p-4 bg-white"
          >
            <h2 className="text-center text-success mb-4">
              <i className="bi bi-check-circle-fill"></i> Chapa Payment Receipt
            </h2>
            <hr />
            <div className="mb-3">
              <p className="mb-1">
                <strong>Transaction Reference:</strong> {receipt.tx_ref}
              </p>
              <p className="mb-1">
                <strong>Status:</strong>{" "}
                <span
                  className={`badge ${
                    receipt.status === "success"
                      ? "bg-success"
                      : "bg-warning text-dark"
                  }`}
                >
                  {receipt.status}
                </span>
              </p>
              <p className="mb-1">
                <strong>Payment Method:</strong> {receipt.method || "N/A"}
              </p>
              <p className="mb-1">
                <strong>Amount:</strong> {receipt.amount} {receipt.currency}
              </p>
              {/* <p className="mb-1">
                <strong>Customer:</strong> {receipt.first_name}{" "}
                {receipt.last_name}
              </p> */}
              <p className="mb-1">
                <strong>Email:</strong> {receipt.email}
              </p>
              <p className="mb-1">
                <strong>Paid At:</strong>{" "}
                {new Date(receipt.created_at).toLocaleString()}
              </p>
            </div>
            <hr />
            <p className="text-center text-muted small">
              Thank you for your payment with Chapa 💚
            </p>
          </div>

          <div className="text-center mt-4">
            <button onClick={handlePrint} className="btn btn-success">
              <i className="bi bi-printer me-2"></i>Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapaCallback;
