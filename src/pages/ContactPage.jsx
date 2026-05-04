// This code was partially developed with the help of ChatGPT(GenAI).
// The code was reviewed, modified, and tested before use.

import { useAuth } from '../auth/AuthContext.jsx';
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  getMessages,
  sendMessage,
  getThreads,
  markAsRead,
} from "../services/chatService";

export default function ContactPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [threads, setThreads] = useState([]); //左側：スレッド一覧
  const [activeChatId, setActiveChatId] = useState(null); //右側：今開いてるチャットのID
  const [messages, setMessages] = useState([]); //右のメッセージ一覧
  const [message, setMessage] = useState(""); //入力欄
  const [currentUserId, setCurrentUserId] = useState(null); //ログインユーザー

  const activeChatIdRef = useRef(activeChatId);
  const currentUserIdRef = useRef(null);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    currentUserIdRef.current = currentUserId;
  }, [currentUserId]);

  //ユーザーID取得
  useEffect(() => {
    const initUser = async () => {
      try{
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          setCurrentUserId("bbbbbbbb-bbbb-bbbb-bbbb-000000000001");
          return;
        }
        setCurrentUserId(data.user.id);
      } catch (e) {
        console.log("fallback user used");
        setCurrentUserId("bbbbbbbb-bbbb-bbbb-bbbb-000000000001");
      }
    };
    initUser();
  }, []);

  //thread取得
  useEffect(() => {
    if (!currentUserId) return;

    const loadThreads = async () => {
      try {
        const data = await getThreads(currentUserId);
        setThreads(data);
        if (data.length > 0) setActiveChatId(data[0].thread_id);
      } catch (err) {
        console.error("Failed to fetch threads:", err);
      }
    };
    loadThreads();
  }, [currentUserId]);

  //選択中のスレッドが変わったらメッセージをロード
  useEffect(() => {
    if (!activeChatId) return;
    const loadMessages = async () => {
      try {
        const data = await getMessages(activeChatId);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    
    loadMessages();

      //ローカルだけ未読数更新
      setThreads(prev =>
        prev.map(t =>
          t.thread_id === activeChatId
          ? { ...t, unread_count: 0 }
          : t
        )
      );
  }, [activeChatId]);

  const handleSend = async () => {
    if (!message.trim() || !activeChatId || !currentUserId) return;

    const newMsg = {
      id: Date.now(), //仮ID
      thread_id: activeChatId,
      sender_id: currentUserId,
      content: message,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, newMsg]);
    setMessage("")

    await sendMessage(activeChatId, message, currentUserId);

  };

  //Realtime追加
  useEffect(() => {
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
        const currentUserId = currentUserIdRef.current;

        //開いてるチャットなら追加
        if (newMessage.thread_id === activeChatId && newMessage.sender_id !== currentUserId) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });  
        }

        //スレッド更新（未読＋順番）
        setThreads(prev =>
          prev
            .map(thread => {
              if (thread.thread_id === newMessage.thread_id) {
                const isMine = newMessage.sender_id === currentUserId;
                const isActive = thread.thread_id === activeChatId;

                return {
                  ...thread,
                  last_message_time: newMessage.created_at,

                  unread_count: isMine
                    ? thread.unread_count
                    : isActive
                    ? 0
                    : thread.unread_count + 1,
                };
              }
              return thread;
            })
           .sort(
            (a, b) =>
              new Date(b.last_message_time || 0) - new Date(a.last_message_time || 0)
           ) 
        );
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
        const updated = payload.new;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === updated.id ? { ...m, read: updated.read } : m
          )
        );
      }
    )

    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!activeChatId || !currentUserId) return;

    markAsRead(activeChatId, currentUserId);

  }, [activeChatId, currentUserId]);

  return (
    <div style={styles.container}>
      {/* Left side: Chat list */}
      <div style={styles.leftPane}>

        {/* Back Button */}
        <button
          onClick={() => navigate(user?.role === "adopter" ? "/adopter-menu" : "/shelter-menu")}
          style={styles.backButton}
        >
          ← Back to Main Menu
        </button>

        {/* Thread list */}
        {threads.map(thread => (
          <div
            key={thread.thread_id}
            onClick={() => setActiveChatId(thread.thread_id)}
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              backgroundColor:
                thread.thread_id === activeChatId ? "#e5e7eb" : "#fff",
              borderBottom: "1px solid #d1d5db",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
          }}
          >
            {/* 左側のanimal情報 */}
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
            <div>
              {thread.other_user_name || "unknown Animal"}
            </div>
          </div>

            {/* unread count */}
            {thread.unread_count > 0 && (
                <div
                  style={{
                    backgroundColor: "#2563eb",
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
      
      {/* Right side: Selected chat */}
      <div style={styles.rightPane}>
            <div style={styles.chatHeader}>
              <strong>Chat</strong>
            </div>

            <div style={styles.chatBox}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.sender_id === currentUserId ? "flex-end" : "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      ...styles.message,
                      backgroundColor:
                        msg.sender_id === currentUserId ? "#2563eb" : "#e5e7eb",
                      color:
                        msg.sender_id === currentUserId ? "#fff" : "#000",
                    }}
                  >
                    <div>{msg.content}</div>
                    <div style={{ fontSize: "11px", marginTop: "4px", opacity: 1, 
                      color: msg.sender_id === currentUserId ? "#ffffff" : "#1f2937"}}>
                      {new Date(msg.created_at).toLocaleTimeString()}
                      {msg.sender_id === currentUserId && (
                        <span style={{ marginLeft: "6px", fontSize: "8px", opacity: "0.7px"}}>
                          {msg.read ? "Read" : "Sent"}
                        </span>
                      )}
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
