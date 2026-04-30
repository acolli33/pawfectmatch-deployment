const BASE_URL = "http://localhost:3001";

export const getThreads = async (userId) => {
  const res = await fetch(`${BASE_URL}/threads/${userId}`);
  return res.json();
};

export const getMessages = async (threadId) => {
  const res = await fetch(`${BASE_URL}/messages/${threadId}`);
  return res.json();
};

export const sendMessage = async (threadId, content, senderId) => {
  await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: threadId,
      sender_id: senderId,
      content,
    }),
  });
};

export const markAsRead = async (threadId, userId) => {
  await fetch(`${BASE_URL}/messages/${threadId}/read`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
};


// adopter（自分）
//"bbbbbbbb-bbbb-bbbb-bbbb-000000000001"

// shelter（相手）
//"aaaaaaaa-aaaa-aaaa-aaaa-000000000001"