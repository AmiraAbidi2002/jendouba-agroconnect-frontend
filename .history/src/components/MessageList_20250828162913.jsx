import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiArrowLeft, FiSend, FiUser } from "react-icons/fi";

const SIDEBAR_COLOR = "#1d4c43";
const SIDEBAR_ITEM_BG = "#FEF2F2";
const MESSAGE_BG = SIDEBAR_COLOR;
const SEND_BTN_ORANGE = "#ff8c00";

export default function MessageList({ user, contacts = [] }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  const messagesContainerRef = useRef(null);

  // Uniformiser id et user_id pour tous les contacts
  const mappedContacts = contacts.map(c => ({
    ...c,
    id: c.id || c.user_id,
    user_id: c.user_id || c.id
  }));

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
        `http://localhost:8080/messages/${user.id}?with=${selectedContact.id}`
      );
      let msgs = res.data || [];

      // Convertir timestamps si nécessaire
      msgs = msgs.map(msg => {
        if (Array.isArray(msg.timestamp)) {
          const [year, month, day, hours, minutes, seconds, nanoseconds] = msg.timestamp;
          msg.timestamp = new Date(year, month - 1, day, hours, minutes, seconds, nanoseconds / 1000000);
        } else if (typeof msg.timestamp === "string") {
          msg.timestamp = new Date(msg.timestamp);
        }
        return msg;
      });

      msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(msgs);

      // Scroll en bas
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
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
        receiverId: selectedContact.id,
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

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    let existing = mappedContacts.find(c => c.id.toString() === searchTerm.trim());

    if (!existing) {
      // Essayer de récupérer via l'API
      try {
        const res = await axios.get(`http://localhost:8080/users/${searchTerm.trim()}`);
        if (res.data) {
          existing = { ...res.data, id: res.data.id || res.data.user_id };
        } else {
          existing = { user_name: `User ${searchTerm}`, id: searchTerm };
        }
      } catch {
        existing = { user_name: `User ${searchTerm}`, id: searchTerm };
      }
    }

    setSelectedContact(existing);
    setShowConversation(true);
    setSearchTerm("");
  };

  const filteredContacts = mappedContacts.filter((contact) =>
    contact.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    let dateObj;

    if (timestamp instanceof Date) {
      dateObj = timestamp;
    } else if (Array.isArray(timestamp)) {
      const [year, month, day, hours, minutes, seconds, nanoseconds] = timestamp;
      dateObj = new Date(year, month - 1, day, hours, minutes, seconds, nanoseconds / 1000000);
    } else if (typeof timestamp === "string") {
      dateObj = new Date(timestamp);
    } else if (typeof timestamp === "number") {
      dateObj = new Date(timestamp);
    } else {
      return "Date invalide";
    }

    if (isNaN(dateObj.getTime())) {
      return "Date invalide";
    }

    return dateObj.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full rounded-lg shadow-md overflow-hidden border border-gray-200" style={{ minHeight: 480 }}>
      {/* Sidebar */}
      {!showConversation && (
        <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold" style={{ color: SIDEBAR_COLOR }}>Conversations</h2>
          </div>

          <div className="p-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Entrer ID du contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredContacts.map((contact) => {
              const keyId = contact.id;
              const isSelected = selectedContact && selectedContact.id === contact.id;
              return (
                <div
                  key={keyId}
                  onClick={() => { setSelectedContact(contact); setShowConversation(true); }}
                  className={`cursor-pointer m-2 p-3 rounded-lg border ${isSelected ? "ring-2 ring-orange-300" : "border-gray-200"} transition-shadow`}
                  style={{ backgroundColor: SIDEBAR_ITEM_BG }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: SIDEBAR_COLOR }}>
                      <FiUser size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-semibold" style={{ color: SIDEBAR_COLOR }}>{contact.user_name}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conversation */}
      {showConversation && selectedContact && (
        <div className="w-full flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center gap-3" style={{ backgroundColor: SIDEBAR_COLOR }}>
            <button 
              onClick={() => setShowConversation(false)} 
              className="p-1 rounded-full hover:bg-gray-100 hover:bg-opacity-20"
            >
              <FiArrowLeft className="text-white" />
            </button>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-white bg-opacity-20">
              <FiUser size={18} />
            </div>
            <div>
              <div className="font-semibold text-white">{selectedContact.user_name}</div>
            </div>
          </div>

          <div 
            ref={messagesContainerRef} 
            className="flex-1 overflow-y-auto p-4 bg-white"
            style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '300px' }}
          >
            <div className="flex flex-col" style={{ gap: '16px' }}>
              {messages.map((m) => {
                const isMine = m.senderId === user.id;
                return (
                  <div 
                    key={m.msg_id || `${m.timestamp}-${Math.random()}`} 
                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    style={{ marginBottom: '16px' }}
                  >
                    <div
                      className="px-4 py-2 rounded-2xl shadow-sm break-words max-w-xs"
                      style={{
                        backgroundColor: isMine ? SIDEBAR_COLOR : "#F0F0F0",
                        border: `2px solid ${SIDEBAR_COLOR}`,
                        color: isMine ? "#ffffff" : "#000000",
                      }}
                    >
                      <p className="text-sm">{m.content}</p>
                      <div className={`text-[10px] mt-1 ${isMine ? "text-right text-gray-200" : "text-left text-gray-500"}`}>
                        {formatTimestamp(m.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
