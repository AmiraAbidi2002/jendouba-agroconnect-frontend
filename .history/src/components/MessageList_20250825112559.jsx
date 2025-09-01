import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function MessageList({ user, contacts = [] }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;

    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact}`
      );
      console.log("Messages from backend:", res.data);
      setMessages(res.data);
    } catch (err) {
      console.error("Error getting messages:", err);
    }
  }, [user, selectedContact]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!selectedContact || !newMsg.trim()) return;

    try {
      await axios.post("http://localhost:8080/messages", {
        senderId: user.id,
        receiverId: selectedContact,
        content: newMsg.trim(),
      });
      setNewMsg("");
      fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Contacts */}
      <div className="col-span-1 border p-2">
        <h3 className="font-bold mb-2">Contacts</h3>
        <ul>
          {contacts.map((c) => (
            <li
              key={c.id}
              className={`p-2 cursor-pointer rounded ${
                selectedContact === c.id ? "bg-green-200 font-semibold" : "hover:bg-gray-100"
              }`}
              onClick={() => setSelectedContact(c.id)}
            >
              {c.user_name}
            </li>
          ))}
        </ul>
      </div>

      {/* Messages */}
      <div className="col-span-2 border p-2 flex flex-col">
        <ul className="flex-1 overflow-auto space-y-2">
          {messages.length > 0 ? (
            messages.map((m) => (
              <li
                key={m.msg_id}
                className={`p-1 rounded ${
                  m.senderId === user.id ? "text-right text-blue-600" : "text-left text-gray-800"
                }`}
              >
                <span className="font-semibold">{m.senderName}: </span>
                {m.content}
              </li>
            ))
          ) : (
            <li className="text-gray-400 text-center">No message</li>
          )}
        </ul>

        <div className="mt-2 flex">
          <input
            type="text"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Write your message..."
            className="border p-2 flex-1 rounded"
          />
          <button
            onClick={handleSend}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
