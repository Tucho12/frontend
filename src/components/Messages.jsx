import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { propertyId, otherId } = useParams(); // Extract route parameters

  // Fetch messages for the specific property
  useEffect(() => {
    if (!propertyId) {
      console.error("Property ID is undefined.");
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/messages/property/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
        alert("Failed to fetch messages.");
      }
    };

    fetchMessages();
  }, [propertyId]);

  // Send a reply to the tenant
  const sendMessage = async () => {
    if (!newMessage.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const landlordId = "your_landlord_id"; // Replace with actual landlord ID

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/messages/send`,
        {
          sender: landlordId,
          receiver: otherId,
          property: propertyId,
          content: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const savedMessage = response.data;

      // Update the local state
      setMessages((prevMessages) => [...prevMessages, savedMessage]);
      setNewMessage(""); // Clear the input field
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Messages</h3>
      <div className="messages overflow-auto" style={{ height: "300px" }}>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="mb-2">
              <strong>{message.sender === otherId ? "Tenant" : "You"}:</strong>{" "}
              {message.content}
            </div>
          ))
        )}
      </div>
      <div className="input-group mt-3">
        <input
          type="text"
          className="form-control"
          placeholder="Type a reply..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Messages;
