import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiArrowLeft, FiSend, FiUser } from "react-icons/fi";

export default function MessageList({ user, contacts = [] }) {
  const SIDEBAR_COLOR = "#1d4c43";
  const MESSAGE_BG = SIDEBAR_COLOR;
  const SEND_BTN_ORANGE = "#ff8c00";

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConversation, setShowConversation] = useState(false);

  const messagesContainerRef = useRef(null);

  // ----- Récupération messages -----
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact.id || selectedContact.user_id}`
      );
      setMessages(res.data || []);
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

  // ----- Envoi message -----
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

  // ----- Recherche contact / nouvelle conversation -----
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Vérifie si le contact existe déjà
    let contact = contacts.find(c => c.id === searchTerm || c.user_id === searchTerm);

    if (!contact) {
      // Crée un contact fictif si ID inexistant
      contact = { id: searchTerm, user_name: `User ${searchTerm}`, user_id: searchTerm };
    }

    setSelectedContact(contact);
    setShowConversation(true);
    setSearchTerm("");
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
      
      {/* ----- Liste des conversations ----- */}
      {!showConversation && (
        <div className="w-full md:w-1/3 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold" style={{ color: SIDEBAR_COLOR }}>Conversations</h2>
          </div>

          <div className="p-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {contacts.map(contact => {
              const keyId = contact.id || contact.user_id;
              return (
                <div
                  key={keyId}
                  onClick={() => { setSelectedContact(contact); setShowConversation(true); }}
                  className="cursor-pointer m-2 p-3 rounded-lg border border-gray-200 hover:ring-2 hover:ring-orange-300 transition-shadow"
                  style={{ backgroundColor: "#FEF2F2" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: SIDEBAR_COLOR }}>
                      <FiUser size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold" style={{ color: SIDEBAR_COLOR }}>{contact.user_name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Dernier message...</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----- Conversation ----- */}
      {showConversation && selectedContact && (
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          
          {/* Header conversation */}
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

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-white"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {messages.map(msg => {
              const isMine = msg.senderId === user.id;
              return (
                <div key={msg.msg_id || Math.random()} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className="px-4 py-2 rounded-2xl shadow-sm break-words max-w-xs"
                    style={{
                      backgroundColor: MESSAGE_BG,
                      border: `2px solid ${SIDEBAR_COLOR}`,
                      color: "#fff",
                    }}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className="text-[10px] mt-1 text-right text-gray-200">{formatMessageTime(msg.timestamp)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input message */}
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
              style={{ backgroundColor: SIDEBAR_COLOR, opacity: newMsg.trim() ? 1 : 0.6 }}
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
