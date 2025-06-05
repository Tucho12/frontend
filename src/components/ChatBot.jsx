import React, { useState } from "react";

const ChatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="white"
    viewBox="0 0 24 24"
    width="28px"
    height="28px"
  >
    <path d="M20 2H4a2 2 0 0 0-2 2v16l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    width="28px"
    height="28px"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me anything about renting." },
  ]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessages((msgs) => [
          ...msgs,
          { from: "bot", text: `Error: ${errorData.error || "Unknown error"}` },
        ]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMessages((msgs) => [...msgs, { from: "bot", text: data.reply }]);
    } catch (error) {
      setMessages((msgs) => [...msgs, { from: "bot", text: "Network error" }]);
    }
    setLoading(false);
  };

  return (
    <div
      className="chatbot-container"
      style={{
        position: "fixed",
        bottom: 20,
        left: 25,
        width: 320,
        zIndex: 1000,
      }}
    >
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: "#007bff",
          border: "none",
          borderRadius: "50%",
          width: 50,
          height: 50,
          color: "white",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          transition: "background-color 0.3s ease",
        }}
        aria-label={isOpen ? "Close Chatbot" : "Open Chatbot"}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {isOpen && (
        <div
          className="chatbot-box"
          style={{
            marginTop: 10,
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            height: 400,
          }}
        >
          <div
            className="chatbot-messages"
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              fontSize: 14,
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  marginBottom: 8,
                  textAlign: msg.from === "user" ? "right" : "left",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    padding: "8px 12px",
                    borderRadius: 20,
                    backgroundColor:
                      msg.from === "user" ? "#007bff" : "#e5e5ea",
                    color: msg.from === "user" ? "white" : "black",
                    maxWidth: "75%",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
          </div>

          <div
            className="chatbot-input"
            style={{
              borderTop: "1px solid #ccc",
              padding: 8,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              type="text"
              value={input}
              placeholder={
                loading ? "Waiting for reply..." : "Ask me something..."
              }
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
              disabled={loading}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 20,
                border: "1px solid #ccc",
                fontSize: 14,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 20,
                padding: "0 16px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 16,
              }}
              aria-label="Send Message"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
