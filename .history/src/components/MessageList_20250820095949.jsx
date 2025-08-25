import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MessageList({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    // récupérer les acheteurs pour pouvoir envoyer un message
    axios.get("http://localhost:8080/users?type=buyer")
      .then(res => setBuyers(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (user) fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/messages?recipientId=${user.user_id}`);
      setMessages(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSend = async () => {
    if (!selectedBuyer || !newMsg) return;
    try {
      await axios.post("http://localhost:8080/messages", {
        sender: { user_id: user.user_id },
        recipient: { user_id: selectedBuyer },
        content: newMsg
      });
      setNewMsg("");
      fetchMessages();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Messages</h2>
      <div>
        <select
          className="border p-1"
          onChange={e => setSelectedBuyer(e.target.value)}
          value={selectedBuyer || ""}
        >
          <option value="">Select Buyer</option>
          {buyers.map(b => <option key={b.user_id} value={b.user_id}>{b.user_name}</option>)}
        </select>
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          className="border p-1 ml-2"
        />
        <button onClick={handleSend} className="ml-2 bg-green-600 text-white px-2 py-1 rounded">Send</button>
      </div>

      <ul className="border p-2 rounded max-h-96 overflow-auto space-y-1">
        {messages.map(m => (
          <li key={m.id} className="p-1 border-b">
            <span className="font-semibold">{m.sender.user_name}: </span>
            {m.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
