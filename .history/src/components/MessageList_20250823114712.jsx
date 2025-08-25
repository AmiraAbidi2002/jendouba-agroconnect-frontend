// src/components/MessageList.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function MessageList({ user, contacts = [] }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  // Récupérer les messages entre user et selectedContact
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur récupération messages:", err);
    }
  }, [user, selectedContact]);

  // Charger les messages quand un contact est sélectionné
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Envoyer un message
  const handleSend = async () => {
    if (!selectedContact || !newMsg) return;
    try {
      await axios.post("http://localhost:8080/messages", {
        senderId: user.id,
        receiverId: selectedContact,
        content: newMsg,
      });
      setNewMsg("");
      fetchMessages();
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Liste des contacts */}
      <div className="col-span-1 border p-2">
        <h3 className="font-bold mb-2">Contacts</h3>
        <ul>
          {contacts.map(c => (
            <li
              key={c.id}
              className={`p-1 cursor-pointer ${selectedContact === c.id ? "bg-green-200" : ""}`}
              onClick={() => setSelectedContact(c.id)}
            >
              {c.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Zone de messages */}
      <div className="col-span-2 border p-2 flex flex-col">
        <ul className="flex-1 overflow-auto space-y-2">
          {messages.map(m => (
            <li
              key={m.msg_id}
              className={`${m.sender.id === user.id ? "text-blue-600 text-right" : "text-black text-left"}`}
            >
              <span className="font-semibold">{m.sender.name}: </span>{m.content}
            </li>
          ))}
        </ul>

        <div className="mt-2 flex">
          <input
            type="text"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Écris ton message..."
            className="border p-1 flex-1"
          />
          <button
            onClick={handleSend}
            className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
