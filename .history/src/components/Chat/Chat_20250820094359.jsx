import React, { useState, useEffect } from "react";
import { getMessages, sendMessage } from "../../api/messageService";
import { useAuth } from "../../context/AuthContext";
import "./Chat.css";

export default function Chat({ receiverId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  // Charger la conversation
  useEffect(() => {
    if (user) {
      getMessages(user.id, receiverId)
        .then(res => setMessages(res.data))
        .catch(err => console.error(err));
    }
  }, [receiverId, user]);

  const handleSend = () => {
    if (!content) return;
    sendMessage(user.id, receiverId, content)
      .then(res => {
        setMessages([...messages, res.data]);
        setContent("");
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(msg => (
          <div
            key={msg.msg_id}
            className={msg.senderId === user.id ? "my-msg" : "other-msg"}
          >
            {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Écrire un message..."
      />
      <button onClick={handleSend}>Envoyer</button>
    </div>
  );
}
