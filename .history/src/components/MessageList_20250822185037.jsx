import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MessageList({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [contacts, setContacts] = useState([]);

  // Récupérer contacts selon le rôle
  useEffect(() => {
    if (!user) return;

    const typeToFetch = user.role === "FARMER" ? "BUYER" : "FARMER";
    axios
      .get(`http://localhost:8080/users?type=${typeToFetch}`)
      .then(res => setContacts(res.data))
      .catch(err => console.error("Erreur récupération contacts:", err));
  }, [user]);

  // Charger messages quand un contact est sélectionné
  useEffect(() => {
    if (!user || !selectedContact) return;
    fetchMessages();
  }, [user, selectedContact]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur récupération messages:", err);
    }
  };

  const handleSend = async () => {
    if (!selectedContact || !newMsg) return;
    try {
      await axios.post("http://localhost:8080/messages", {
        senderId: user.id,
        receiverId: parseInt(selectedContact, 10),
        content: newMsg,
      }.then(res => console.log(res.data)));
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
          onChange={(e) => setSelectedContact(e.target.value)}
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
