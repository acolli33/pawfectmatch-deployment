// This code was partially developed with the help of ChatGPT(GenAI).
// The code was reviewed, modified, and tested before use.

import { useAuth } from '../auth/AuthContext.jsx';
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ContactPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [threads, setThreads] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableAnimals, setAvailableAnimals] = useState([]);

  const activeChatIdRef = useRef(null);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    const loadThreads = async () => {
      if (!user) return;

      try {
        setLoadingThreads(true);
        const res = await fetch(`${API_BASE_URL}/api/messages/threads`, {
          headers: {
            "Content-Type": "application/json",
            "x-demo-email": user.email,
            "x-demo-role": user.role,
          },
        });

        const result = await res.json();
        if (!res.ok) {
          console.error(result.error);
          return
        }

        setThreads(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingThreads(false);
      }
    }; loadThreads();
  }, [user]);

  useEffect(() => {
    if (!activeChatId || !user) return;
    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await fetch(
          `${API_BASE_URL}/api/messages/threads/${activeChatId}`,
          {
            headers: {
              "x-demo-email": user.email,
              "x-demo-role": user.role,
            },
          }
        );

        const result = await res.json();
        setMessages(Array.isArray(result.data) ? result.data : []);

        await fetch(
          `${API_BASE_URL}/api/messages/threads/${activeChatId}/read`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "x-demo-email": user.email,
              "x-demo-role": user.role,
            },
          }
        );

        setThreads(prev =>
          prev.map(t =>
            t.id === activeChatId
            ? { ...t, unread_count: 0 }
            : t
          )
        );
      } finally {
        setLoadingMessages(false);
      }
    };
    
    loadMessages();
  }, [activeChatId, user]);

  const handleSend = async () => {
    if (!message.trim() || !activeChatId || !user) return;

    const res = await fetch(
      `${API_BASE_URL}/api/messages/threads/${activeChatId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-demo-email": user.email,
          "x-demo-role": user.role,
        },
        body: JSON.stringify({ content: message }),
      }
    );

    const result = await res.json();
    const newMessage = result.data;
    
    setMessage("");

    setMessages(prev => [...prev, newMessage]);
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase
    .channel("messages-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      async (payload) => {
        const newMessage = payload.new;
        const activeChatId = activeChatIdRef.current;

        if (newMessage.sender_id !== user.id) {
          await fetch(
            `${API_BASE_URL}/api/messages/${newMessage.id}/delivered`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "x-demo-email": user.email,
                "x-demo-role": user.role,
              },
            }
          );
        }
        if (newMessage.thread_id === activeChatIdRef.current) {
          const res = await fetch(
            `${API_BASE_URL}/api/messages/threads/${activeChatIdRef.current}`,
            {
              headers: {
                "x-demo-email": user.email,
                "x-demo-role": user.role,
              },
            }
          );
          const result = await res.json();
          setMessages(Array.isArray(result.data) ? result.data: []);
      }

        setThreads(prev => {
          const exists = prev.some(
            t => t.id === newMessage.thread_id
          );

          if (!exists) {
            return prev;
          }

          const updated = prev.map(t => 
              t.id === newMessage.thread_id
                ? {
                  ...t,
                  last_message: newMessage.content,
                  last_message_time: newMessage.created_at,
                  unread_count:
                    t.id === activeChatId ? 0 : (t.unread_count || 0) + 1,
                }
                : t
            );
            
            return [...updated].sort(
            (a, b) =>
              new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0)
           );
       });
      }
    )

    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        const updatedMessage = payload.new;

        setMessages(prev =>
          prev.map(m => 
            m.id === updatedMessage.id
            ? updatedMessage
            : m
          )
        );
      }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadAvailableAnimals = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/available-animals`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-demo-email": user.email,
            "x-demo-role": user.role,
          },
        }
      );

      const result = await res.json();

      setAvailableAnimals(result.data || []);

      setShowNewChatModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateThread = async (animalId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/threads`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-demo-email": user.email,
            "x-demo-role": user.role,
          },
          body: JSON.stringify({
            animal_id: animalId,
          }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        console.error(result.error);
        return;
      }

      const newThread = result.data;

      setThreads(prev => {
        const exists = prev.some(t => t.id === newThread.id);
        
        if (exists) {
          return prev;
        }
        
        return [newThread, ...prev];
      });

      setActiveChatId(newThread.id);

      setShowNewChatModal(false);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
    <div style={styles.container}>
      {/* Left side: Chat list */}
      <div style={styles.leftPane}>

      <div style={styles.threadSection}>
        {/* Back Button */}
        <button
          onClick={() => navigate(user?.role === "adopter" ? "/adopter-menu" : "/shelter-menu")}
          style={styles.backButton}
        >
          ← Back to Main Menu
        </button>

        {/* Thread list */}
        <div style={styles.threadList}>
          {threads?.map(thread => (
            <div
              key={thread.id}
              onClick={() => setActiveChatId(thread.id)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                backgroundColor:
                  thread.id === activeChatId ? "#EADFD2" : "transparent",
                color: "#2C2C34",
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
            {/* Animal info on the thread */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img 
                src={thread.primary_photo_url}
                alt={thread.animal_name}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }} 
              />
            {/* Name */}
            <div style={{ color: "#2C2C34", fontWeight: "500" }}>
              {thread.animal_name || "Unknown Animal"}
              {thread.other_party_name && (
                <span style={{ fontWeight: "400", fontSize: "13px" }}>
                  {" "}({thread.other_party_name})
                </span>
              )}
            </div>
          </div>

            {/* unread count */}
            {thread.unread_count > 0 && (
                <div
                  style={{
                    backgroundColor: "#B46D92",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 6px",
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "11px",                 
                  }}
                >
                {thread.unread_count > 99 ? "99+" : thread.unread_count}
              </div>
            )}
          </div>
        ))}
      </div>
      </div>

      {user?.role === "adopter" && (
        <div style={styles.newConversationContainer}>
          <button
          style={styles.newConversationButton}
          onClick={loadAvailableAnimals}
          >
            + New Conversation
          </button>
          </div>
        )}
      </div>
      
      {/* Right side: Selected chat */}
      <div style={styles.rightPane}>
        <div style={styles.chatHeader}>
          <strong>Chat</strong>
        </div>
      <div style={styles.chatBox}>
        {loadingThreads || threads === null ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#800",
            fontSize: "16px"
          }}>
            Loading conversations...
          </div>
        ) : user?.role === "shelter" && threads.length === 0 ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            color: "#800",
            fontSize: "16px"
          }}>
            No conversation history with adopters.
          </div>
        ) : !activeChatId ? (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#800",
              fontSize: "16px"
            }}>
              Please select a conversation <br />
              from the thread list on the left.
            </div>
          ) : loadingMessages ? (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#800",
              fontSize: "16px"
            }}>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              height: "100%",
              color: "#800",
              fontSize: "16px",
              textAlign: "center",
              lineHeight: "1.6",
            }}
          >
            No messages yet. <br />
            Start the conversation by sending a message.
          </div>
          ) : (
            messages.map((msg, idx) => {
              const activeThread = threads.find(
                t => t.id === activeChatId
              );

              const myId = user?.role === "adopter"
                ? activeThread?.adopter_id
                : activeThread?.shelter_user_id;

              const isMine = msg.sender_id === myId;

              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent:
                      isMine ? "flex-end" : "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      ...styles.message,
                      backgroundColor:
                      isMine ? "#2F3A56" : "#D7C3AE",
                      color:
                      isMine ? "#FFF7ED" : "#2C2C34",
                    }}
                  >
                    <div>{msg.content}</div>
                    <div style={{ fontSize: "11px", marginTop: "4px", opacity: 1, 
                      color: isMine ? "#ffffff" : "#1f2937",}}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                      {isMine && (
                        <span style={{ marginLeft: "6px", fontSize: "8px", opacity: 0.7}}>
                          {msg.read 
                          ? "Read"
                          : msg.delivered
                          ? "Delivered"
                          : "Sent"
                          }
                          </span>
                      )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activeChatId && (
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
            )}
      </div>
      {showNewChatModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
            <h3 style={styles.modalTitle}>
              Start New Conversation
            </h3>
            </div>

            <div style={styles.modalList}>
              {availableAnimals.length === 0 ? (
                <div style={{ padding: "20px"}}>
                No available animals.
                </div>
              ) : (
                availableAnimals.map(animal => (
                  <div
                    key={animal.id}
                    onClick={() => handleCreateThread(animal.id)}
                    style={styles.animalCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F3E8DC";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >

                  <img
                    src={animal.primary_photo_url}
                    alt={animal.name}
                    style={styles.animalImage}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#2C2C34",
                      }}
                    >
                      {animal.name}
                  </div>

                  <div style={{
                    fontSize: "13px",
                    color: "#6B7280",
                    marginTop: "2px",
                    }}
                  >
                    {animal.breed}
                  </div>
                </div>
              </div>
              ))
            )}
            </div>

            <div style={styles.modalFooter}></div>
              <button
                onClick={() => setShowNewChatModal(false)}
                style={styles.closeButton}
              >
                Close
              </button>
            </div>
          </div>
        )}
        </div>
      </>
  );    
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#FFF7ED",
    color: "#2C2C34"
  },
  leftPane: {
    width: "320px",
    borderRight: "1px solid #D7C3AE",
    backgroundColor: "#FFF7ED",
    display: "flex",
    flexDirection: "column",
    color: "#2C2C34", 
    height: "100vh",
  },
  rightPane: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#FFF7ED",
  },
  backButton: {
    padding: "14px 16px",
    border: "none",
    backgroundColor: "#2F3A56",
    color: "#FFF7ED",
    cursor: "pointer",
    fontWeight: "600",
    textAlign: "left",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    marginBottom: "12px",
    transition: "all 0.2s ease-in-out",
    fontFamily: "Arial, sans-serif",
  },
  chatHeader: {
    padding: "18px 24px",
    borderBottom: "1px solid #D7C3AE",
    backgroundColor: "#FFF7ED",
    color: "#2F3A56",
    fontSize: "20px",
    letterSpacing: "0.5px",
  },
  chatBox: {
    flex: 1,
    padding: "24px",
    overflowY: "auto",
    backgroundColor: "#FFF7ED",
  },
  message: {
    maxWidth: "65%",
    padding: "12px 16px",
    borderRadius: "16px",
    wordBreak: "break-word",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    lineHeight: "1.4",
    fontSize: "15px",
  },
  inputContainer: {
    padding: "18px 20px",
    borderTop: "1px solid #D7C3AE",
    backgroundColor: "#FFF7ED",
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #D7C3AE",
    resize: "none",
    fontFamily: "Arial, sans-serif",
    fontSize: "15px",
    outline: "none",
    backgroundColor: "#FFF7ED",
    color: "#2C2C34",
  },
  button: {
    padding: "10px 24px",
    backgroundColor: "#2F3A56",
    color: "#FFF7ED",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.2s ease-in-out",
    fontFamily: "Arial, sans-serif",
  },
  threadSection: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  threadList: {
    flex: 1,
    overflowY: "auto",
  },
  newConversationContainer: {
    padding: "16px",
    borderTop: "1px solid #D7C3AE",
    backgroundColor: "#FFF7ED",
    position: "sticky",
    bottom: 0,
  },
  newConversationButton: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#B46D92",
    color: "#FFF7ED",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
  animalCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #D7C3AE",
    transition: "background-color 0.2s ease",
  },
  animalImage: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    objectFit: "cover",
    flexShrink: 0,
  },
  closeButton: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "2F3A56",
    color: "#FFF7ED",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-end",
    alignItems: "stretch",
    zIndex: 1000,
  },
  modal: {
    width: "360px",
    height: "100%",
    backgroundColor: "FFF7ED",
    borderLeft: "1px solid #D7C3AE",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    padding: "20px 24px",
    borderBottom: "1px solid #D7C3AE",
    backgroundColor: "#FFF7ED",
    flexShrink: 0,
  },
  modalTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#2F3A56",
  },
  modalList: {
    flex: 1,
    overflowY: "auto",
    backgroundColor: "#FFF7ED",
  },
  modalFooter: {
    padding: "16px 24px",
    borderTop: "1px solid #D7C3AE",
    backgroundColor: "#FFF7ED",
    flexShrink: 0,
  },
};
