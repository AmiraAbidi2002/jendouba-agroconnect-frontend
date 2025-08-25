import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MessageList({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [buyers, setBuyers] = useState([]);

  // Charger la liste des buyers
  useEffect(() => {
    if (!user) return;
    // Si Farmer connecté, récupérer tous les BUYER
axios.get("http://localhost:8080/users?type=BUYER")
  .then(res => setBuyers(res.data))
  .catch(err => console.error(err));

// Si Buyer connecté, récupérer tous les FARMER
axios.get("http://localhost:8080/users?type=FARMER")
  .then(res => setBuyers(res.data))
  .catch(err => console.error(err));
  }, [user]);

  // Charger messages quand un buyer est sélectionné
  useEffect(() => {
    if (!user || !selectedBuyer) return;
    console.log("Fetching messages for user:", user);
  console.log("User ID:", user?.user_id);
  console.log("With selected buyer ID:", selectedBuyer);

    fetchMessages();
  }, [user, selectedBuyer]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.user_id}?with=${selectedBuyer}`
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur récupération messages:", err);
    }
  };

  const handleSend = async () => {
    console.log("Current user:", user);  // vérifier que user est défini
console.log("User ID:", user?.user_id); // ne doit pas être undefined

    if (!user?.user_id) {
    console.error("User ID is undefined, cannot send message");
    return;
  }
    if (!selectedBuyer || !newMsg) return;
    try {
      await axios.post("http://localhost:8080/messages", {
        sender: { user_id: user.user_id },
        receiver: { user_id: parseInt(selectedBuyer, 10) }, // ✅ backend attend `receiver`
        content: newMsg,
      });
      setNewMsg("");
      fetchMessages();
    } catch (err) {
      console.error("Erreur envoi message:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Messages</h2>

      {/* Sélecteur d'acheteur */}
      <div>
        <select
          className="border p-1"
          onChange={(e) => setSelectedBuyer(e.target.value)}
          value={selectedBuyer || ""}
        >
          <option value="">Sélectionner un acheteur</option>
          {buyers.map((b) => (
            <option key={b.user_id} value={b.user_id}>
              {b.user_name} 
            </option>
          ))}
        </select>

        {/* Champ de texte */}
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
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

      {/* Liste des messages */}
      <ul className="border p-2 rounded max-h-96 overflow-auto space-y-1">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`p-1 border-b ${
              m.sender.user_id === user.user_id ? "text-blue-600" : "text-black"
            }`}
          >
            <span className="font-semibold">{m.sender.user_name}: </span>
            {m.content}
          </li>
        ))}
      </ul>
    </div>
  );
}
