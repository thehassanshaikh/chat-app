import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Fetch existing messages
    fetch("http://localhost:5000/api/messages", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error("Error fetching messages:", err));

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketRef.current.emit("message", {
        text: newMessage,
        user: user.username,
      });
      setNewMessage("");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.user === user.username ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs rounded-lg p-3 ${
                message.user === user.username
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              <p className="text-sm font-semibold">{message.user}</p>
              <p>{message.text}</p>
              <p className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
