// This code was partially developed with the help of ChatGPT(GenAI).
// The code was reviewed, modified, and tested before use.
 
import { useAuth } from '../auth/AuthContext.jsx';
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
 
export default function ContactPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
 
  const [threads, setThreads] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableAnimals, setAvailableAnimals] = useState([]);
 
  const activeChatIdRef = useRef(null);
  const threadsRef = useRef([]);
  const userRef = useRef(null);
  const chatBoxRef = useRef(null);
 
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);
 
  useEffect(() => {
    threadsRef.current = Array.isArray(threads) ? threads : [];
  }, [threads]);
 
  useEffect(() => {
    userRef.current = user;
  }, [user]);
 
useEffect(() => {
    if (!activeChatId) return;
    if (loadingMessages) return;
    if (!chatBoxRef.current) return;
    if (!messages.length) return;

    requestAnimationFrame(() => {
      if (!chatBoxRef.current) return;

      chatBoxRef.current.scrollTop =
        chatBoxRef.current.scrollHeight;
    });
  }, [activeChatId, loadingMessages, messages.length]);
  
  const getHeaders = () => ({
    "Content-Type": "application/json",
    "x-demo-email": user?.email,
    "x-demo-role": user?.role,
    "x-demo-token": localStorage.getItem("pm_token"),
  });
 
  const loadThreads = async (showLoading = false) => {
    if (!user) return;
 
    try {
      if (showLoading) {
        setLoadingThreads(true);
      }
 
      const res = await fetch(`${API_BASE_URL}/api/messages/threads?_=${Date.now()}`, {
        headers: getHeaders(),
        cache: "no-store",
      });
 
      const result = await res.json();
      if (!res.ok) {
        console.error(result.error);
        return;
      }
 
      setThreads(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) {
        setLoadingThreads(false);
      }
    }
  };
 

  useEffect(() => {
    const threadId = searchParams.get("threadId");

    if (!threadId) return;
    if (!Array.isArray(threads)) return;

    const matchingThread = threads.find(
      (thread) => String(thread.id) === String(threadId)
    );

    if (matchingThread) {
      setActiveChatId(matchingThread.id);
    }
  }, [searchParams, threads]);


  const markThreadRead = async (threadId) => {
    if (!threadId || !user) return;
 
    await fetch(
      `${API_BASE_URL}/api/messages/threads/${threadId}/read`,
      {
        method: "PATCH",
        headers: getHeaders(),
      }
    );
 
    setThreads(prev => {
      const currentThreads = Array.isArray(prev) ? prev : [];
 
      return currentThreads.map(t =>
        String(t.id) === String(threadId)
          ? { ...t, unread_count: 0 }
          : t
      );
    });
  };
 
  const isAtBottom = () => {
    if (!chatBoxRef.current) return false;
  
    const { scrollTop, scrollHeight, clientHeight } =
      chatBoxRef.current;
  
    return scrollHeight - scrollTop - clientHeight < 30;
  };

  const getCurrentUserIdForThread = (thread) => {
    if (!thread || !userRef.current) return null;
 
    return userRef.current.role === "adopter"
      ? thread.adopter_id
      : thread.shelter_user_id;
  };
 
  const updateThreadForNewMessage = (newMessage) => {
    setThreads(prev => {
      const currentThreads = Array.isArray(prev) ? prev : [];
      const currentActiveChatId = activeChatIdRef.current;
 
      const updated = currentThreads.map(t => {
        if (String(t.id) !== String(newMessage.thread_id)) {
          return t;
        }
 
        const currentUserId = getCurrentUserIdForThread(t);
        const isMine =
          currentUserId &&
          String(newMessage.sender_id) === String(currentUserId);
 
        const isActiveThread =
          String(t.id) === String(currentActiveChatId);
 
        return {
          ...t,
          last_message: newMessage.content,
          last_message_time: newMessage.created_at,
          unread_count:
            !isMine && !isActiveThread
              ? Number(t.unread_count || 0) + 1
              : isActiveThread
                ? 0
                : Number(t.unread_count || 0),
        };
      });
 
      return [...updated].sort(
        (a, b) =>
          new Date(b.last_message_time || b.updated_at || b.created_at || 0) -
          new Date(a.last_message_time || a.updated_at || a.created_at || 0)
      );
    });
  };
 
  useEffect(() => {
    loadThreads(true);
  }, [user]);
 
  useEffect(() => {
    if (!activeChatId || !user) return;
 
    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const res = await fetch(
          `${API_BASE_URL}/api/messages/threads/${activeChatId}?_=${Date.now()}`,
          {
            headers: {
              "x-demo-email": user.email,
              "x-demo-role": user.role,
              "x-demo-token": localStorage.getItem("pm_token"),
            },
            cache: "no-store",
          }
        );
 
        const result = await res.json();
        setMessages(Array.isArray(result.data) ? result.data : []);
       } finally {
        setLoadingMessages(false);
      }
    };
   
    loadMessages();
  }, [activeChatId, user]);

  useEffect(() => {
    if (!activeChatId || !user || loadingMessages) return;
    markThreadRead(activeChatId);
  }, [activeChatId, loadingMessages, user]);
 
  const handleSend = async () => {
    if (!message.trim() || !activeChatId || !user) return;
 
    const res = await fetch(
      `${API_BASE_URL}/api/messages/threads/${activeChatId}/messages`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ content: message }),
      }
    );
 
    const result = await res.json();
    const newMessage = result.data;
   
    setMessage("");
 
    setMessages(prev => {
      const currentMessages = Array.isArray(prev) ? prev : [];
      const exists = currentMessages.some(m => String(m.id) === String(newMessage.id));
 
      if (exists) {
        return currentMessages;
      }
 
      return [...currentMessages, newMessage];
    });
 
    updateThreadForNewMessage(newMessage);
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
 
        if (!newMessage) return;
 
        const currentThreads = threadsRef.current;
        const messageThread = currentThreads.find(
          t => String(t.id) === String(newMessage.thread_id)
        );
 
        if (!messageThread) {
          await loadThreads(false);
          return;
        }
 
        const currentUserId = getCurrentUserIdForThread(messageThread);
        const isMine =
          currentUserId &&
          String(newMessage.sender_id) === String(currentUserId);
 
        if (!isMine) {
          await fetch(
            `${API_BASE_URL}/api/messages/${newMessage.id}/delivered`,
            {
              method: "PATCH",
              headers: getHeaders(),
            }
          );
        }
 
        if (String(newMessage.thread_id) === String(activeChatId)) {
          const res = await fetch(
            `${API_BASE_URL}/api/messages/threads/${activeChatIdRef.current}?_=${Date.now()}`,
            {
              headers: {
                "x-demo-email": user.email,
                "x-demo-role": user.role,
                "x-demo-token": localStorage.getItem("pm_token"),
              },
              cache: "no-store",
            }
          );
          const result = await res.json();
          setMessages(Array.isArray(result.data) ? result.data : []);
 
        }
 
        updateThreadForNewMessage(newMessage);
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
            String(m.id) === String(updatedMessage.id)
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
 
  useEffect(() => {
    if (!user) return;
 
    const interval = setInterval(() => {
      const currentActiveChatId = activeChatIdRef.current;
 
      loadThreads(false);
 
      if (currentActiveChatId) {
        fetch(
          `${API_BASE_URL}/api/messages/threads/${currentActiveChatId}?_=${Date.now()}`,
          {
            headers: getHeaders(),
            cache: "no-store",
          }
        )
          .then(res => res.json())
          .then(result => {
            setMessages(Array.isArray(result.data) ? result.data : []);
          })
          .catch(err => console.error(err));
      }
    }, 1000);
 
    return () => clearInterval(interval);
  }, [user]);
 
  const loadAvailableAnimals = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/available-animals?_=${Date.now()}`,
        {
          headers: getHeaders(),
          cache: "no-store",
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
          headers: getHeaders(),
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
        const currentThreads = Array.isArray(prev) ? prev : [];
        const exists = currentThreads.some(t => String(t.id) === String(newThread.id));
       
        if (exists) {
          return currentThreads;
        }
       
        return [newThread, ...currentThreads];
      });
 
      setActiveChatId(newThread.id);
 
      setShowNewChatModal(false);
 
      await loadThreads(false);
 
    } catch (err) {
      console.error(err);
    }
  };

  const handleChatScroll = async () => {
    if (!activeChatId) return;
  
    if (isAtBottom()) {
      await markThreadRead(activeChatId);
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
                  String(thread.id) === String(activeChatId) ? "#EADFD2" : "transparent",
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
            {Number(thread.unread_count || 0) > 0 && (
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
                {Number(thread.unread_count || 0) > 99
                  ? "99+"
                  : Number(thread.unread_count || 0)}
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
      <div ref={chatBoxRef} style={styles.chatBox} onScroll={handleChatScroll}>
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
                t => String(t.id) === String(activeChatId)
              );
 
              const myId = user?.role === "adopter"
                ? activeThread?.adopter_id
                : activeThread?.shelter_user_id;
 
              const isMine = String(msg.sender_id) === String(myId);
 
              return (
                <div
                  key={msg.id || idx}
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
                    <div style={{ whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </div>
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
 
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowNewChatModal(false)}
                style={styles.closeButton}
              >
                Close
              </button>
            </div>
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
    backgroundColor: "#2F3A56",
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
    backgroundColor: "#FFF7ED",
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