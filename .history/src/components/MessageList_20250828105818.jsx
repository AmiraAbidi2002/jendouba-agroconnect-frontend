// src/components/MessageList.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiArrowLeft, FiSend, FiUser } from "react-icons/fi";

const SIDEBAR_COLOR = "#1d4c43";
const SIDEBAR_ITEM_BG = "#FEF2F2";
const SEND_BTN_ORANGE = "#ff8c00";

export default function MessageList({ user, contacts = [] }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => setIsMobileView(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact.id || selectedContact.user_id}`
      );
      // Trier par date croissante
      const sorted = res.data
        .map((m) => ({
          ...m,
          timestamp: new Date(m.timestamp.replace(" ", "T")),
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMessages(sorted);
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error(err);
    }
  }, [user, selectedContact]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchMessages, selectedContact]);

  const handleSend = async () => {
    if (!selectedContact || !newMsg.trim()) return;
    try {
      await axios.post("http://localhost:8080/messages", {
        senderId: user.id,
        receiverId: selectedContact.id || selectedContact.user_id,
        content: newMsg.trim(),
      });
      setNewMsg("");
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    const val = e.target.value.trim();
    if (!val) return;
    // Vérifier si l’ID saisi correspond à un contact existant
    const existing = contacts.find(
      (c) => (c.id || c.user_id).toString() === val
    );
    if (existing) {
      setSelectedContact(existing);
    } else {
      // Créer nouveau contact temporaire
      setSelectedContact({ id: val, user_name: `User ${val}` });
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    return diffInHours < 24
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  return (
    <div className="flex h-full rounded-lg shadow-md overflow-hidden border border-gray-200" style={{ minHeight: 480 }}>
      {/* Sidebar / Liste des conversations */}
      {!selectedContact && (
        <div className="w-full md:w-1/3 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold" style={{ color: SIDEBAR_COLOR }}>Conversations</h2>
          </div>
          <div className="p-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher ou ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredContacts.map((contact) => {
              const keyId = contact.id || contact.user_id;
              return (
                <div
                  key={keyId}
                  onClick={() => setSelectedContact(contact)}
                  className="cursor-pointer m-2 p-3 rounded-lg border border-gray-200 transition-shadow"
                  style={{ backgroundColor: SIDEBAR_ITEM_BG }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: SIDEBAR_COLOR }}>
                      <FiUser size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold" style={{ color: SIDEBAR_COLOR }}>{contact.user_name}</h3>
                      <p className="text-xs text-gray-500 mt-1">ID: {keyId}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation */}
      {selectedContact && (
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3" style={{ backgroundColor: SIDEBAR_COLOR }}>
            <button
              onClick={() => setSelectedContact(null)}
              className="p-1 rounded-full hover:bg-gray-100 hover:bg-opacity-20"
            >
              <FiArrowLeft className="text-white" />
            </button>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-white bg-opacity-20">
              <FiUser size={18} />
            </div>
            <div>
              <div className="font-semibold text-white">{selectedContact.user_name}</div>
              <div className="text-xs text-gray-200">ID: {selectedContact.id || selectedContact.user_id}</div>
            </div>
          </div>

          {/* Zone messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((msg) => {
              const isMine = msg.senderId === user.id;
              return (
                <div key={msg.msg_id || Math.random()} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`px-4 py-2 rounded-2xl shadow-sm break-words max-w-xs`} style={{
                    backgroundColor: isMine ? SEND_BTN_ORANGE : SIDEBAR_COLOR,
                    color: "#fff",
                  }}>
                    <p className="text-sm">{msg.content}</p>
                    <div className="text-[10px] mt-1 text-right">{formatMessageTime(msg.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez un message..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={handleSend}
              disabled={!newMsg.trim()}
              className="px-4 py-2 rounded-full text-white flex items-center gap-2"
              style={{ backgroundColor: SEND_BTN_ORANGE, opacity: newMsg.trim() ? 1 : 0.6 }}
            >
              <FiSend />
              <span className="hidden md:inline-block">Envoyer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
