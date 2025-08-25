import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function MessageList({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);

  // Fonction pour récupérer les messages entre user et selectedContact
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

  // Récupérer les contacts selon le rôle
  useEffect(() => {
    if (!user) return;
    const typeToFetch = user.role === "FARMER" ? "BUYER" : "FARMER";
    axios
      .get(`http://localhost:8080/users?type=${typeToFetch}`)
      .then(res => setContacts(res.data))
      .catch(err => console.error("Erreur récupération contacts:", err));
  }, [user]);

  // Charger les messages quand un contact est sélectionné
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Envoyer un message
  const handleSend = async () => {
    if (!selectedContact || !newMsg) return;
    try {
      const res = await axios.post("http://localhost:8080/messages", {
        senderId: user.id,
        receiverId: selectedContact,
        content: newMsg,
      });
      console.log(res.data);
      setNewMsg("");
      fetchMessages();
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Messages</h2>

      <div>
        <select
          className="border p-1"
          onChange={(e) => setSelectedContact(Number(e.target.value))}
          value={selectedContact || ""}
        >
          <option value="">
            {user.role === "FARMER" ? "Sélectionner un acheteur" : "Sélectionner un farmer"}
          </option>
          {contacts.map(c => (
            <option key={c.user_id} value={c.user_id}>
              {c.user_name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Écris ton message..."
          className="border p-1 ml-2"
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-green-600 text-white px-2 py-1 rounded"
        >
          Envoyer
        </button>
      </div>

      <ul className="border p-2 rounded max-h-96 overflow-auto space-y-1">
        {messages.map(m => (
          <li
            key={m.msg_id}
            className={`p-1 border-b ${m.sender.user_id === user.id ? "text-blue-600" : "text-black"}`}
          >
            <span className="font-semibold">{m.sender.user_name}: </span>
            {m.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
