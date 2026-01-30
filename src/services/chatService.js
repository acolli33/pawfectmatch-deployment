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
