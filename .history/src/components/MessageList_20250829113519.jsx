import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiArrowLeft, FiSend, FiUser } from "react-icons/fi";

const SIDEBAR_COLOR = "#1d4c43";
const SIDEBAR_ITEM_BG = "#FEF2F2";
const SEND_BTN_ORANGE = "#ff8c00";

// Fonction pour récupérer le token
const getToken = () => localStorage.getItem("token");

export default function MessageList({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConversation, setShowConversation] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const messagesContainerRef = useRef(null);
  const searchRef = useRef(null);

  // Charger toutes les conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const token = getToken();
      const res = await axios.get(
        `http://localhost:8080/messages/conversations/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
      const token = getToken();
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

      // Scroll vers le bas après le rendu des messages
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 100);
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
        setShowSearchResults(false);
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
      const token = getToken();
      await axios.post(
        "http://localhost:8080/messages",
        {
          senderId: user.id,
          receiverId: selectedContact.id,
          content: newMsg.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Masquer les résultats si la recherche est vide
    if (!value.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    setIsLoading(true);
    setShowSearchResults(true);
    
    try {
      const token = getToken();
      const res = await axios.get(
        `http://localhost:8080/users/search?query=${encodeURIComponent(searchTerm.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Filtrer l'utilisateur actuel des résultats
      const filteredResults = (res.data || []).filter(u => u.user_id !== user.id);
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Erreur recherche utilisateurs :", err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectContact = (contact) => {
    setSelectedContact({ id: contact.user_id, user_name: contact.user_name });
    setShowConversation(true);
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchTerm("");
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-full w-full rounded-lg shadow-md overflow-hidden border border-gray-200 bg-white" style={{ minHeight: "600px" }}>
      {/* Sidebar - Liste des conversations */}
      <div className={`${showConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-200 flex-col bg-white`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <h2 className="text-lg font-bold" style={{ color: SIDEBAR_COLOR }}>
            Conversations
          </h2>
        </div>

        {/* Recherche */}
        <div className="p-3 flex-shrink-0 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par ID ou Nom..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {isLoading && (
                <div className="absolute right-3 top-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                </div>
              )}
            </div>
          </form>

          {/* Résultats de recherche */}
          {showSearchResults && (
            <div className="absolute top-full left-3 right-3 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-50">
              {searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div
                    key={u.user_id}
                    className="p-3 hover:bg-gray-50 border-b last:border-b-0 flex justify-between items-center cursor-pointer"
                    onClick={() => selectContact(u)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{u.user_name}</div>
                      <div className="text-xs text-gray-500">ID: {u.user_id}</div>
                    </div>
                    <button
                      className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        selectContact(u);
                      }}
                    >
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500 text-sm text-center">
                  Aucun utilisateur trouvé
                </div>
              )}
            </div>
          )}
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 p-4 text-sm">
              Aucune conversation
            </div>
          ) : (
            <div className="p-2">
              {conversations.map((c) => {
                const isSelected = selectedContact && selectedContact.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedContact(c);
                      setShowConversation(true);
                    }}
                    className={`cursor-pointer mb-2 p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      isSelected 
                        ? "ring-2 ring-orange-300 border-orange-200" 
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: SIDEBAR_ITEM_BG }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" 
                        style={{ backgroundColor: SIDEBAR_COLOR }}
                      >
                        <FiUser size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate" style={{ color: SIDEBAR_COLOR }}>
                          {c.user_name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          ID: {c.id}
                        </p>
                        {c.lastMessage && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {c.lastMessage.length > 35 
                              ? `${c.lastMessage.substring(0, 35)}...` 
                              : c.lastMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Zone de conversation */}
      {showConversation && selectedContact && (
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* Header de la conversation */}
          <div 
            className="p-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0" 
            style={{ backgroundColor: SIDEBAR_COLOR }}
          >
            <button 
              onClick={() => setShowConversation(false)} 
              className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 md:hidden"
            >
              <FiArrowLeft className="text-white" size={20} />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white bg-opacity-20 flex-shrink-0">
              <FiUser size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">
                {selectedContact.user_name}
              </div>
              <div className="text-sm text-white text-opacity-80">
                ID: {selectedContact.id}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 bg-gray-50"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 p-4 text-sm">
                Aucun message dans cette conversation
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m) => {
                  const isMine = m.senderId === user.id;
                  return (
                    <div
                      key={m.msg_id || `${m.timestamp}-${Math.random()}`}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 rounded-lg ${
                          isMine 
                            ? "bg-orange-100 rounded-br-sm" 
                            : "bg-blue-100 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm break-words whitespace-pre-wrap">{m.content}</p>
                        <div className={`text-xs mt-1 ${
                          isMine ? "text-orange-600" : "text-blue-600"
                        }`}>
                          {formatTimestamp(m.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Zone de saisie FIXE */}
          <div className="border-t border-gray-200 bg-white p-3 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none min-h-[40px] max-h-[120px]"
                placeholder="Écrire un message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 transparent'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!newMsg.trim()}
                className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center transition-colors min-h-[40px] ${
                  !newMsg.trim() 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "hover:opacity-90"
                }`}
                style={{ backgroundColor: newMsg.trim() ? SEND_BTN_ORANGE : "#9CA3AF" }}
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder quand aucune conversation n'est sélectionnée */}
      {!showConversation && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <FiUser size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Sélectionnez une conversation</p>
            <p className="text-sm">Choisissez un contact pour commencer à discuter</p>
          </div>
        </div>
      )}
    </div>
  );
}