import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiArrowLeft, FiSend, FiUser } from "react-icons/fi";

const SIDEBAR_COLOR = "#1d4c43";
const SIDEBAR_ITEM_BG = "#FEF2F2";
const SEND_BTN_ORANGE = "#ff8c00";

export default function MessageList({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConversation, setShowConversation] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const messagesContainerRef = useRef(null);

  // Charger toutes les conversations qui ont des messages
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/conversations/${user.id}`
      );
      setConversations(res.data || []);
    } catch (err) {
      console.error("Erreur chargement conversations :", err);
    }
  }, [user]);

  // Charger messages d'une conversation
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact.id}`
      );
      let msgs = res.data || [];

      msgs = msgs.map((msg) => {
        if (Array.isArray(msg.timestamp)) {
          const [year, month, day, hours, minutes, seconds, nanos] = msg.timestamp;
          msg.timestamp = new Date(year, month - 1, day, hours, minutes, seconds, nanos / 1e6);
        } else {
          msg.timestamp = new Date(msg.timestamp);
        }
        return msg;
      });

      msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(msgs);

      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error("Erreur fetch messages :", err);
    }
  }, [user, selectedContact]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

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
      fetchConversations();
    } catch (err) {
      console.error("Erreur envoi message :", err);
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
    try {
      const res = await axios.get(
        `http://localhost:8080/users/search?query=${encodeURIComponent(searchTerm.trim())}`
      );
      setSearchResults(res.data || []);
    } catch (err) {
      console.error("Erreur recherche utilisateurs :", err);
      setSearchResults([]);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("fr-FR", {
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
        <div className="w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white relative">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h2 className="text-lg font-bold" style={{ color: SIDEBAR_COLOR }}>Conversations</h2>
          </div>

          {/* Recherche */}
          <div className="p-3 relative">
            <form onSubmit={handleSearchSubmit}>
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Entrer ID ou Nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </form>

            {searchResults.length > 0 && (
              <div className="absolute top-12 left-0 right-0 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg z-50">
                {searchResults.map((u) => (
                  <div
                    key={u.user_id}
                    className="cursor-pointer p-2 hover:bg-gray-100 border-b last:border-b-0 flex justify-between items-center"
                  >
                    <span>{u.user_name} ({u.user_id})</span>
                    <button
                      className="bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                      onClick={() => {
                        setSelectedContact({ id: u.user_id, user_name: u.user_name });
                        setShowConversation(true);
                        setSearchResults([]);
                        setSearchTerm("");
                      }}
                    >
                      Chat
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((c) => {
              const isSelected = selectedContact && selectedContact.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedContact(c);
                    setShowConversation(true);
                  }}
                  className={`cursor-pointer m-2 p-3 rounded-lg border ${isSelected ? "ring-2 ring-orange-300" : "border-gray-200"} transition-shadow`}
                  style={{ backgroundColor: SIDEBAR_ITEM_BG }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: SIDEBAR_COLOR }}>
                      <FiUser size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold" style={{ color: SIDEBAR_COLOR }}>
                        {c.user_name} ({c.id})
                      </h3>
                      {c.lastMessage && <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>}
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
            <button onClick={() => setShowConversation(false)} className="p-1 rounded-full hover:bg-gray-100 hover:bg-opacity-20">
              <FiArrowLeft className="text-white" />
            </button>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-white bg-opacity-20">
              <FiUser size={18} />
            </div>
            <div>
              <div className="font-semibold text-white">
                {selectedContact.user_name} ({selectedContact.id})
              </div>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-white"
            style={{ maxHeight: "calc(100vh - 200px)", minHeight: "300px" }}
          >
            <div className="flex flex-col gap-4">
              {messages.map((m) => {
                const isMine = m.senderId === user.id;
                return (
                  <div
                    key={m.msg_id || `${m.timestamp}-${Math.random()}`}
                    className={`message ${isMine ? "right" : "left"}`}
                  >
                    <p className="text-sm break-words">{m.content}</p>
                    <div className={`text-xs mt-1 ${isMine ? "text-gray-200 text-right" : "text-gray-500 text-left"}`}>
                      {formatTimestamp(m.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-gray-200 flex gap-2 items-center bg-white">
              <textarea
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Écrire un message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 rounded-lg text-white font-semibold"
                style={{ backgroundColor: SEND_BTN_ORANGE }}
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
