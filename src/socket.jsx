import { io } from "socket.io-client";

// Create a single shared socket instance
const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"], // Use WebSocket for better performance
  autoConnect: false, // Prevent automatic connection unless you explicitly call connect()
});

// Explicitly connect to the socket server
socket.connect();

// Log socket connection events
socket.on("connect", () => {
  console.log("Connected to WebSocket server!");
});

socket.on("connect_error", (err) => {
  console.error("Failed to connect to WebSocket server:", err.message);
});

// Ping-pong test to verify communication
socket.on("pong", () => {
  console.log("Received pong from server");
});

// Send a ping to the server for the test
socket.emit("ping");

export default socket;
