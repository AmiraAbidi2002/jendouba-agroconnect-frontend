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
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const messagesContainerRef = useRef(null);
  const searchRef = useRef(null);

  // Charger toutes les conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/messages/conversations/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
        `http://localhost:8080/api/messages/${user.id}?with=${selectedContact.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
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

  // Fermer les résultats de recherche quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSend = async () => {
    if (!selectedContact || !newMsg.trim()) return;
    try {
      await axios.post(
        "http://localhost:8080/api/messages",
        {
          senderId: user.id,
          receiverId: selectedContact.id,
          content: newMsg.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const res = await axios.get(
        `http://localhost:8080/api/users/search?query=${encodeURIComponent(searchTerm.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Filtrer l'utilisateur actuel des résultats
      const filteredResults = (res.data || []).filter(u => u.user_id !== user.id);
      setSearchResults(filteredResults);
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
    <div className="message-list-container">
      {/* Sidebar */}
      {!showConversation && (
        <div className="conversation-sidebar">
          <div className="conversation-header">
            <h2 className="text-lg font-bold">Conversations</h2>
          </div>

          {/* Recherche */}
          <div className="search-container" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par ID ou Nom..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((u) => (
                  <div
                    key={u.user_id}
                    className="p-3 hover:bg-gray-100 border-b last:border-b-0 flex justify-between items-center"
                  >
                    <span className="truncate">{u.user_name} (ID: {u.user_id})</span>
                    <button
                      className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 whitespace-nowrap"
                      onClick={() => {
                        setSelectedContact({ id: u.user_id, user_name: u.user_name });
                        setShowConversation(true);
                        setSearchResults([]);
                        setSearchTerm("");
                      }}
                    >
                      Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <div className="text-center text-gray-500 p-4">
                Aucune conversation
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = selectedContact && selectedContact.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedContact(c);
                      setShowConversation(true);
                    }}
                    className={`conversation-item ${isSelected ? "ring-2 ring-orange-300" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: SIDEBAR_COLOR }}>
                        <FiUser size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate" style={{ color: SIDEBAR_COLOR }}>
                          {c.user_name} (ID: {c.id})
                        </h3>
                        {c.lastMessage && (
                          <p className="text-xs text-gray-500 truncate">
                            {c.lastMessage.length > 40 
                              ? `${c.lastMessage.substring(0, 40)}...` 
                              : c.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Conversation */}
      {showConversation && selectedContact && (
        <div className="flex-1 flex flex-col bg-white">
          <div className="conversation-header">
            <button 
              onClick={() => setShowConversation(false)} 
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20"
            >
              <FiArrowLeft className="text-white" size={20} />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white bg-opacity-20">
              <FiUser size={18} />
            </div>
            <div>
              <div className="font-semibold text-white truncate">
                {selectedContact.user_name} (ID: {selectedContact.id})
              </div>
            </div>
          </div>

          <div
            ref={messagesContainerRef}
            className="messages-container"
          >
            <div className="flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 p-4">
                  Aucun message dans cette conversation
                </div>
              ) : (
                messages.map((m) => {
                  const isMine = m.senderId === user.id;
                  return (
                    <div
                      key={m.msg_id || `${m.timestamp}-${Math.random()}`}
                      className={`message ${isMine ? "right" : "left"}`}
                    >
                      <p className="text-sm break-words">{m.content}</p>
                      <div className={`text-xs mt-1 ${isMine ? "text-gray-600 text-right" : "text-gray-500 text-left"}`}>
                        {formatTimestamp(m.timestamp)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="message-input-container">
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
              className="px-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center"
              style={{ backgroundColor: SEND_BTN_ORANGE }}
              disabled={!newMsg.trim()}
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}