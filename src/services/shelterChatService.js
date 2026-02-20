export const CURRENT_USER_ID = "shelter";

let chats = [
  {
    id: 1,
    name: "Frank Miller",
    lastActivityAt: Date.now(),
    lastMessage: "That's wonderful! Do you have any specific preferences?",
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
    name: "Diane Mcdonald",
    lastActivityAt: Date.now(),
    lastMessage: "Congrats! Your application has been approved.",
    time: "1h ago",
    unread: 0,
    messages: [
        { text: "Hi there. I was hoping to check on the status of my application. Thanks!", sender: "adopter", time: "8:30 AM" },
      { text: "Congrats! Your application has been approved.", sender: "shelter", time: "9:00 AM" },
    ],
  },
  {
    id: 3,
    name: "Leah Freeman",
    lastActivityAt: Date.now(),
    lastMessage: "Thank you for reaching out, and that is great news! Would you like to schedule a visit?",
    time: "3h ago",
    unread: 0,
    messages: [
      { text: "Hello, I am very interested in adopting Bella.", sender: "adopter", time: "7:30 AM" },  
      { text: "Thank you for reaching out, and that is great news! Would you like to schedule a visit?", sender: "shelter", time: "8:00 AM" },
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
