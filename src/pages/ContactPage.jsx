import React, { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

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
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar: Chat List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            Messages
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chatList.map(chat => (
            <div
              key={chat.id}
              className={`p-4 cursor-pointer border-b border-gray-100 hover:bg-purple-50 transition-colors ${
                selectedChat.id === chat.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
              }`}
              onClick={() => {
                setSelectedChat(chat);
                setMessages([
                  { text: "Hello! How can I help you today?", sender: "shelter", time: "10:30 AM" },
                  { text: "Hi! I'm interested in adopting a cat.", sender: "adopter", time: "10:32 AM" },
                  { text: "That's wonderful! Do you have any specific preferences?", sender: "shelter", time: "10:33 AM" },
                ]);
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-gray-900">{chat.name}</span>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900">{selectedChat.name}</h3>
          <p className="text-sm text-gray-500">Active now</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-purple-50/30 to-blue-50/30">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "adopter" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.sender === "adopter"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "bg-white text-gray-900 shadow-sm border border-gray-100"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === "adopter" ? "text-purple-100" : "text-gray-500"
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3 items-end">
            <textarea
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={1}
            />
            <button
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl px-6 py-3 hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              onClick={handleSend}
              disabled={input.trim() === ""}
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
