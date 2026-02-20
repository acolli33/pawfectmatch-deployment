import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getChats,
  sendMessage,
  receiveMessage,
  CURRENT_USER_ID,
} from "../services/chatService";

export default function ContactPage() {
  const navigate = useNavigate();

  const [chatList, setChatList] = useState([]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getChats().then(setChatList);
  }, []);

  const activeChat = chatList.find(chat => chat.id === activeChatId);

  const storedChats = [...chatList].sort(
    (a, b) => b.lastActivityAt - a.lastActivityAt
  );

  const openChat = (chatId) => {
    setActiveChatId(chatId);
  
    setChatList(prev => {
      const selectedChat = prev.find(chat => chat.id === chatId);
      const otherChats = prev.filter(chat => chat.id !== chatId);
      return [
        { ...selectedChat, unread: 0 },
        ...otherChats,
      ];
    });
  };
  

  const handleSend = async () => {
    if (!message.trim()) return;

    const updatedChats = await sendMessage(activeChatId, message);
    setChatList(updatedChats);
    setMessage("");

    setTimeout(async () => {
      const reply = await receiveMessage(
        activeChatId,
        "Thanks for your message! We'll get back to you soon.",
        activeChatId
      );
      setChatList(reply);
    }, 3000);
  };

  return (
    <div style={styles.container}>
      {/* Left side: Chat list */}
      <div style={styles.leftPane}>

        {/* Back Button */}
        <button
          onClick={() => navigate("/menu")}
          style={styles.backButton}
        >
          ← Back to Main Menu
        </button>

        {storedChats.map(chat => (
          <div
            key={chat.id}
            onClick={() => openChat(chat.id)}
            style={{
              padding: "16px",
              borderBottom: "1px solid #e5e7eb",
              cursor: "pointer",
              backgroundColor: chat.id === activeChatId ? "#dbeafe" : "#fff",
              borderLeft: chat.id === activeChatId ? "4px solid #2563eb" : "4px solid transparent",
            }}
          >
            <div style={{ fontWeight: "600" }}>{chat.name}</div>
            <div style={{ fontSize: "13px", color: "#111827" }}>
              {chat.lastMessage}
            </div>

            {chat.unread > 0 && (
              <div
                style={{
                  marginTop: "6px",
                  display: "inline-block",
                  backgroundColor: "#2563eb",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontSize: "12px",
                }}
              >
                {chat.unread}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side: Selected chat */}
      <div style={styles.rightPane}>
        {activeChat && (
          <>
            <div style={styles.chatHeader}>
              <strong>{activeChat.name}</strong>
            </div>

            <div style={styles.chatBox}>
              {activeChat.messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.sender === CURRENT_USER_ID ? "flex-end" : "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      ...styles.message,
                      backgroundColor:
                        msg.sender === CURRENT_USER_ID ? "#2563eb" : "#e5e7eb",
                      color:
                        msg.sender === CURRENT_USER_ID ? "#fff" : "#000",
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: "11px", marginTop: "4px", opacity: 1, 
                      color: msg.sender === CURRENT_USER_ID ? "#ffffff" : "#1f2937"}}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.inputContainer}>
              <label htmlFor="messageInput" style={{ display: "none" }}>
                Message
              </label>
              <textarea
                id="messageInput"
                aria-label="Message input"
                style={styles.textarea}
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button style={styles.button} onClick={handleSend}>
                Send
              </button>
            </div>
          </>
        )}
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
  backButton: {
    padding: "14px 16px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    textAlign: "left",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "12px",
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




ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー

export const CURRENT_USER_ID = "adopter";

let chats = [
  {
    id: 1,
    name: "Happy Paws Shelter",
    lastActivityAt: Date.now(),
    lastMessage: "Hi, any questions about Max?",
    time: "2m ago",
    unread: 0,
    messages: [
      { text: "Hello! How can I help you today?", sender: "shelter", time: "10:30 AM" },
      { text: "Hi! I'm interested in adopting a cat.", sender: "adopter", time: "10:32 AM" },
      { text: "That's wonderful! Do you have any specific preferences?", sender: "shelter", time: "10:33 AM" },
    ],
  },
  {
    id: 2,
    name: "Rescue Haven",
    lastActivityAt: Date.now(),
    lastMessage: "Your application is approved!",
    time: "1h ago",
    unread: 0,
    messages: [
      { text: "Congrats! Your application has been approved.", sender: "shelter", time: "9:00 AM" },
    ],
  },
  {
    id: 3,
    name: "City Animal Shelter",
    lastActivityAt: Date.now(),
    lastMessage: "Would you like to schedule a visit?",
    time: "3h ago",
    unread: 0,
    messages: [
      { text: "Would you like to schedule a visit?", sender: "shelter", time: "8:00 AM" },
    ],
  },
];

export const getChats = async () => {
  return JSON.parse(JSON.stringify(chats));
};

export const sendMessage = async (chatId, text) => {
  const now = Date.now();
  const time = new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  chats = chats.map(chat => {
    if (chat.id !== chatId) return chat;

    const newMessage = {
      text,
      sender: CURRENT_USER_ID,
      time,
    };

    return {
      ...chat,
      messages: [...chat.messages, newMessage],
      lastMessage: text,
      time: "Just now",
      lastActivityAt: now,
    };
  });

  return JSON.parse(JSON.stringify(chats));
};

export const receiveMessage = async (chatId, text, activeChatId) => {
  const now = Date.now();
  const time = new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  chats = chats.map(chat => {
    if (chat.id !== chatId) return chat;

    const newMessage = {
      text,
      sender: "shelter",
      time,
    };

    return {
      ...chat,
      messages: [...chat.messages, newMessage],
      lastMessage: text,
      time: "Just now",
      lastActivityAt: now,
      unread: chatId === activeChatId ? chat.unread : chat.unread + 1,
    };
  });

  return JSON.parse(JSON.stringify(chats));
};

