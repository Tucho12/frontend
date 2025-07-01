import React, { useEffect, useState } from "react";
import socket from "../socket"; // Import the Socket.IO client instance
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const TenantBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [messagesByProperty, setMessagesByProperty] = useState({});
  const [newMessage, setNewMessage] = useState("");

  // Fetch tenant's bookings
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view bookings.");
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/bookings/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch bookings.");
        }
        const data = await res.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Open chat window with landlord and fetch messages
  const startChat = async (booking) => {
    console.log("Booking object in startChat:", booking);
    const landlordId = booking?.property?.landlord?._id;
    const propertyId = booking?.property?._id;
    if (!landlordId || !propertyId) {
      alert("Landlord or Property ID is missing from booking data.");
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/landlords/${landlordId}`
      );
      const { name, email } = response.data;

      // Fetch messages for the selected property
      const messagesResponse = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/messages/property/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessagesByProperty((prevMessages) => ({
        ...prevMessages,
        [propertyId]: messagesResponse.data,
      }));
      setSelectedBooking({
        ...booking,
        landlordName: name,
        landlordEmail: email,
      });
      setChatOpen(true);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        alert(`${status} Error: ${data.message}`);
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      alert("Message cannot be empty.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token); // Decode the token to get user ID
      const userId = decodedToken.id;
      const propertyId = selectedBooking.property._id;
      const messageData = {
        sender: userId,
        receiver: selectedBooking.property.landlord._id, // Landlord ID
        property: selectedBooking.property._id, // Full property object (not just ID)
        content: newMessage, // The message content
      };

      // Send the message data via an API request
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages`,
        messageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 201) {
        throw new Error("Failed to save message to the database.");
      }

      // Update the local state for messages by property ID
      setMessagesByProperty((prevMessages) => ({
        ...prevMessages,
        [propertyId]: [...(prevMessages[propertyId] || []), response.data],
      }));

      // Clear the new message input field
      setNewMessage("");

      // Emit the message via socket
      socket.emit("send-message", {
        bookingId: selectedBooking._id,
        message: response.data, // This should be the saved message from the API
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message: " + error.message);
    }
  };

  // Listen for incoming messages
  useEffect(() => {
    const handleMessageReceived = (message) => {
      const propertyId = message.property._id;
      // Update the messagesByProperty state with the new message
      setMessagesByProperty((prevMessages) => ({
        ...prevMessages,
        [propertyId]: [...(prevMessages[propertyId] || []), message],
      }));
    };

    // Attach listener for incoming messages
    socket.on("receive-message", handleMessageReceived);

    // Cleanup listener on unmount
    return () => {
      socket.off("receive-message", handleMessageReceived);
    };
  }, []);

  const handleChapaPayment = async (booking) => {
    if (booking.status !== "confirmed") {
      alert("You can only pay for confirmed bookings.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You must be logged in to initiate a payment.");
        return;
      }
      if (!user?._id) {
        alert("You must be logged in.");
        return;
      }

      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const months =
        end.getMonth() -
        start.getMonth() +
        12 * (end.getFullYear() - start.getFullYear()) +
        1;

      const totalAmount = booking.property.price * months;

      alert(
        `Your total payment amount is ${totalAmount} ETB for ${months} month(s).`
      );

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/payment/initiate`,
        {
          amount: totalAmount,
          currency: "ETB",
          propertyId: booking.property._id,
          bookingId: booking._id,
          returnUrl: `${window.location.origin}/chapa/callback`,
          tx_ref: `tx-${booking._id}-${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { checkoutUrl } = response.data;

      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank");
      } else {
        alert("Failed to initiate payment. Missing checkout URL.");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      alert(`Error initiating payment: ${message}`);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Remove the deleted booking from state
        setBookings((prev) => prev.filter((b) => b._id !== bookingId));
      } else {
        throw new Error("Failed to delete the booking.");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      const message = error.response?.data?.message || error.message;
      alert(`Failed to cancel booking: ${message}`);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Your Bookings</h3>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : bookings.length === 0 ? (
        <p>You have not booked any properties yet.</p>
      ) : (
        <div className="row">
          {bookings.map((booking) => (
            <div className="col-md-4 mb-4" key={booking._id}>
              <div className="card p-3">
                {/* Property Image */}
                <div className="d-flex justify-content-center">
                  {booking.property.images &&
                  booking.property.images.length > 0 ? (
                    <img
                      src={booking.property.images[0]} // Show only the first image
                      alt={`${booking.property.title} - Image 1`}
                      className="img-fluid mb-2 rounded"
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <p>No images available for this property.</p>
                  )}
                </div>

                <h5 className="mt-3">{booking.property.title}</h5>
                <p>
                  <strong>Location:</strong> {booking.property.location}
                </p>
                <p>
                  <strong>Price:</strong> ${booking.property.price}
                </p>
                <p>
                  <strong>From:</strong>{" "}
                  {new Date(booking.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>To:</strong>{" "}
                  {new Date(booking.endDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      booking.status === "confirmed"
                        ? "text-success"
                        : booking.status === "cancelled"
                        ? "text-danger"
                        : "text-warning"
                    }
                  >
                    {booking.status}
                  </span>
                  {booking.paymentStatus === "paid" && (
                    <span className="text-success ms-2">✅ Paid</span>
                  )}
                </p>

                {booking.status === "confirmed" && (
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-outline-primary btn-sm custom-hover"
                      onClick={() => startChat(booking)}
                    >
                      Chat
                    </button>

                    {booking.paymentStatus !== "paid" && (
                      <button
                        className="btn btn-outline-success"
                        onClick={() => handleChapaPayment(booking)}
                      >
                        Pay
                      </button>
                    )}
                  </div>
                )}

                {booking.status === "pending" && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteBooking(booking._id)}
                  >
                    Undo Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Window */}
      {chatOpen && selectedBooking && (
        <div
          style={{
            position: "absolute",
            top: "90px",
            right: "0",
            backgroundColor: "white",
            boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
            padding: "10px",
            width: "350px", // Match landlord's chat width
            zIndex: 1000,
            maxHeight: "400px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Title Bar */}
          <div
            style={{
              fontWeight: "bold",
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h5>Chat with {selectedBooking.landlordName}</h5>
            <button
              className="btn btn-close"
              onClick={() => setChatOpen(false)} // Hide the chat window
            ></button>
          </div>

          {/* Messages List */}
          <div style={{ flexGrow: 1, overflowY: "auto" }}>
            {Array.isArray(messagesByProperty[selectedBooking.property._id]) &&
            messagesByProperty[selectedBooking.property._id].length === 0 ? (
              <div style={{ fontStyle: "italic" }}>No messages</div>
            ) : (
              Array.isArray(messagesByProperty[selectedBooking.property._id]) &&
              messagesByProperty[selectedBooking.property._id]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((msg, index) => {
                  const isTenantMessage =
                    msg.sender._id === selectedBooking.tenant._id; // Check if the message is from the tenant
                  return (
                    <div
                      key={index}
                      style={{
                        marginBottom: "10px",
                        textAlign: isTenantMessage ? "right" : "left", // Align sender (tenant) to right, receiver (landlord) to left
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          maxWidth: "70%",
                          padding: "8px",
                          borderRadius: "12px",
                          backgroundColor: isTenantMessage
                            ? "#28a745"
                            : "#f1f1f1", // Green for tenant, light gray for landlord
                          color: isTenantMessage ? "white" : "black", // White text for tenant, black for landlord
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Reply Input and Send Button */}
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Type your reply..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantBookings;
