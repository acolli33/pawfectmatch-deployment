import React, { useState } from "react";

export default function ContactPage() {
  const chatList = [
    { id: 1, name: "Happy Paws Shelter", lastMessage: "Hi, any questions about Max?", time: "2m ago" },
    { id: 2, name: "Rescue Haven", lastMessage: "Your application is approved!", time: "1h ago" },
    { id: 3, name: "City Animal Shelter", lastMessage: "Would you like to schedule a visit?", time: "3h ago" },
  ];

  const [selectedChat, setSelectedChat] = useState(chatList[0]);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "shelter", time: "10:30 AM" },
    { text: "Hi! I'm interested in adopting a cat.", sender: "adopter", time: "10:32 AM" },
    { text: "That's wonderful! Do you have any specific preferences?", sender: "shelter", time: "10:33 AM" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setMessages([...messages, { text: input, sender: "adopter", time: timeStr }]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      {/* Left side: Chat list */}
      <div style={styles.leftPane}>
        <h3 style={{ textAlign: "center", color: "#2563eb" }}>Messages</h3>
        {chatList.map(chat => (
          <div
            key={chat.id}
            style={{
              padding: "15px",
              cursor: "pointer",
              backgroundColor: selectedChat.id === chat.id ? "#e0f2fe" : "#fff",
              borderBottom: "1px solid #ccc",
              borderLeft: selectedChat.id === chat.id ? "3px solid #2563eb" : "3px solid transparent",
            }}
            onClick={() => {
              setSelectedChat(chat);
              setMessages([
                { text: "Hello! How can I help you today?", sender: "shelter", time: "10:30 AM" },
                { text: "Hi! I'm interested in adopting a cat.", sender: "adopter", time: "10:32 AM" },
                { text: "That's wonderful! Do you have any specific preferences?", sender: "shelter", time: "10:33 AM" },
              ]);
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <strong style={{ color: "#1e3a8a" }}>{chat.name}</strong>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>{chat.time}</span>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "#4b5563" }}>{chat.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* Right side: Selected chat */}
      <div style={styles.rightPane}>
        <div style={styles.chatHeader}>
          <h3 style={{ margin: 0, color: "#1e3a8a" }}>{selectedChat.name}</h3>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>Active now</p>
        </div>
        
        <div style={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: msg.sender === "adopter" ? "flex-end" : "flex-start",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  ...styles.message,
                  backgroundColor: msg.sender === "adopter" ? "#2563eb" : "#f3f4f6",
                  color: msg.sender === "adopter" ? "#ffffff" : "#1f2937",
                }}
              >
                <p style={{ margin: "0 0 4px 0", fontSize: "14px" }}>{msg.text}</p>
                <p style={{ 
                  margin: 0, 
                  fontSize: "11px", 
                  color: msg.sender === "adopter" ? "#bfdbfe" : "#6b7280",
                  textAlign: "right" 
                }}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.inputContainer}>
          <textarea
            style={styles.textarea}
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
          />
          <button 
            style={{
              ...styles.button,
              opacity: input.trim() === "" ? 0.5 : 1,
              cursor: input.trim() === "" ? "not-allowed" : "pointer",
            }} 
            onClick={handleSend}
            disabled={input.trim() === ""}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9fafb",
  },
  leftPane: {
    width: "320px",
    borderRight: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  rightPane: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ffffff",
  },
  chatHeader: {
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
  },
  chatBox: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    backgroundColor: "#f9fafb",
  },
  message: {
    maxWidth: "65%",
    padding: "10px 14px",
    borderRadius: "12px",
    wordBreak: "break-word",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  inputContainer: {
    padding: "16px 20px",
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    resize: "none",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "10px 24px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s",
  },
};

