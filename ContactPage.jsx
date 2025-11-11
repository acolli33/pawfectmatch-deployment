import React, { useState } from "react";

export default function ContactPage() {
  const chatList = [
    { id: 1, name: "Shelter A", lastMessage: "Hi, any questions?" },
    { id: 2, name: "Shelter B", lastMessage: "Your application is approved." },
    { id: 3, name: "Shelter C", lastMessage: "Hello!" },
  ];

  const [selectedChat, setSelectedChat] = useState(chatList[0]);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "shelter" },
    { text: "Hi! I'm interested in adopting a cat.", sender: "adopter" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { text: input, sender: "adopter" }]);
    setInput("");
  };

  return (
    <div style={styles.container}>
      {/* Left side：Chat list */}
      <div style={styles.leftPane}>
        <h3 style={{ textAlign: "center" }}>Chats</h3>
        {chatList.map(chat => (
          <div
            key={chat.id}
            style={{
              padding: "15px",
              cursor: "pointer",
              backgroundColor: selectedChat.id === chat.id ? "#ddd" : "#fff",
              borderBottom: "1px solid #ccc",
            }}
            onClick={() => {
              setSelectedChat(chat);
              setMessages([
                { text: "Hello! How can I help you today?", sender: "shelter" },
                { text: "Hi! I'm interested in adopting a cat.", sender: "adopter" },
              ]);
            }}
          >
            <strong>{chat.name}</strong>
            <p style={{ margin: 0, fontSize: "12px", color: "#555" }}>{chat.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* Right side：Selected chat */}
      <div style={styles.rightPane}>
        <h3>{selectedChat.name}</h3>
        <div style={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.message,
                alignSelf: msg.sender === "adopter" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "adopter" ? "#8fbc8f" : "#FFF",
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <textarea
          style={styles.textarea}
          placeholder="Type your message"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button style={styles.button} onClick={handleSend}>
          Send
        </button>
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
  },
  leftPane: {
    width: "30%",
    borderRight: "1px solid #ccc",
    backgroundColor: "#f4f4f4",
    overflowY: "auto",
  },
  rightPane: {
    width: "70%",
    display: "flex",
    flexDirection: "column",
    padding: "10px",
    height: "100vh",
    boxSizing: "border-box",
  },
  chatBox: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "10px",
    flexGrow: 1,
    overflowY: "auto",
    marginBottom: "10px",
    backgroundColor: "#add6e8",
  },
  message: {
    maxWidth: "70%",
    padding: "8px 12px",
    borderRadius: "15px",
    marginBottom: "5px",
    wordBreak: "break-word",
  },
  textarea: {
    width: "100%",
    height: "60px",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    resize: "vertical",
    marginBottom: "10px",
    boxSizing: "border-box",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    alignSelf: "flex-end",
  },
};
