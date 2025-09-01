import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiMessageSquare, FiArrowLeft, FiSend, FiUser, FiPlus, FiX } from "react-icons/fi";

export default function MessageList({ user, contacts = [] }) {
  const SIDEBAR_COLOR = "#1d4c43";
  const SIDEBAR_ITEM_BG = "#ECF8F6";
  const MESSAGE_BG = SIDEBAR_COLOR;
  const SEND_BTN_ORANGE = "#ff8c00";

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => setIsMobileView(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Récupérer la liste des contacts disponibles pour nouveau message
  const fetchAvailableContacts = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`http://localhost:8080/users?exclude=${user.id}`);
      setAvailableContacts(res.data || []);
    } catch (err) {
      console.error("Erreur lors de la récupération des contacts:", err);
    }
  }, [user]);

  useEffect(() => {
    if (showNewMessageModal) {
      fetchAvailableContacts();
    }
  }, [showNewMessageModal, fetchAvailableContacts]);

  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact.id || selectedContact.user_id}`
      );
      // Trier les messages par timestamp
      const sortedMessages = (res.data || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(sortedMessages);
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

  const handleNewMessage = (contact) => {
    setSelectedContact(contact);
    setShowNewMessageModal(false);
    if (isMobileView) setShowConversation(true);
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      return "À l'instant";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInDays === 1) {
      return "Hier";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
    }
  };

  const getLastMessage = (contact) => {
    // Simuler le dernier message - dans un vrai projet, cela viendrait de l'API
    return "Dernier message...";
  };

  return (
    <div className="flex h-full rounded-lg shadow-md overflow-hidden border border-gray-200" style={{ minHeight: 480 }}>
      {/* Sidebar */}
      <div
        className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white ${
          isMobileView && showConversation ? "hidden" : "flex"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-lg font-bold" style={{ color: SIDEBAR_COLOR }}>Conversations</h2>
            <p className="text-xs text-gray-500">Vos échanges récents</p>
          </div>
          <button 
            className="p-2 rounded-full hover:bg-orange-50 transition-colors" 
            title="Nouveau message"
            style={{ color: SEND_BTN_ORANGE }}
            onClick={() => setShowNewMessageModal(true)}
          >
            <FiPlus size={18} />
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => {
            const keyId = contact.id || contact.user_id;
            const isSelected = selectedContact && (selectedContact.id === contact.id || selectedContact.user_id === contact.user_id);
            return (
              <div
                key={keyId}
                onClick={() => { setSelectedContact(contact); if (isMobileView) setShowConversation(true); }}
                className={`cursor-pointer mx-2 my-1 p-3 rounded-lg border hover:shadow-sm transition-all ${
                  isSelected ? "ring-2 ring-orange-300 shadow-sm" : "border-gray-200 hover:border-orange-200"
                }`}
                style={{ backgroundColor: isSelected ? "#FFF7ED" : SIDEBAR_ITEM_BG }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" 
                       style={{ backgroundColor: SIDEBAR_COLOR }}>
                    <FiUser size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-semibold truncate" style={{ color: SIDEBAR_COLOR }}>
                        {contact.user_name}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatMessageTime(new Date())}
                      </span>
                    </div>
                    <p className="text-xs mb-1" style={{ color: SEND_BTN_ORANGE }}>
                      {contact.role || "Collaborateur"}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {getLastMessage(contact)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversation */}
      <div className={`w-full md:w-2/3 flex flex-col bg-white ${isMobileView && !showConversation ? "hidden" : "flex"}`}>
        {selectedContact ? (
          <>
            {/* Header de conversation */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3" style={{ backgroundColor: SIDEBAR_COLOR }}>
              {isMobileView && (
                <button 
                  onClick={() => setShowConversation(false)} 
                  className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <FiArrowLeft className="text-white" size={20} />
                </button>
              )}
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white bg-opacity-20">
                <FiUser size={18} />
              </div>
              <div>
                <div className="font-semibold text-white">{selectedContact.user_name}</div>
                <div className="text-xs text-gray-200">{selectedContact.role || "Collaborateur"}</div>
              </div>
            </div>

            {/* Zone des messages */}
            <div 
              ref={messagesContainerRef} 
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              {messages.map((message, index) => {
                const isMine = message.senderId === user.id;
                const showTime = index === 0 || 
                  (new Date(message.timestamp) - new Date(messages[index - 1].timestamp)) > 5 * 60 * 1000; // 5 minutes
                
                return (
                  <div key={message.msg_id || Math.random()}>
                    {showTime && (
                      <div className="text-center text-xs text-gray-500 mb-3">
                        {new Date(message.timestamp).toLocaleString([], {
                          weekday: 'short',
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className="flex items-end gap-2 max-w-xs">
                        {!isMine && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0" 
                               style={{ backgroundColor: SIDEBAR_COLOR }}>
                            <FiUser size={12} />
                          </div>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl shadow-sm break-words ${
                            isMine 
                              ? 'bg-blue-500 text-white rounded-br-md' 
                              : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`text-[10px] mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(message.timestamp).toLocaleTimeString([], { 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </div>
                        </div>
                        {isMine && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0" 
                               style={{ backgroundColor: SEND_BTN_ORANGE }}>
                            <FiUser size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Zone d'envoi de message améliorée */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Écrivez votre message..."
                    className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                    rows="1"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMsg.trim()}
                  className={`w-11 h-11 rounded-full text-white flex items-center justify-center transition-all transform ${
                    newMsg.trim() ? 'hover:scale-105 shadow-md' : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: SEND_BTN_ORANGE }}
                >
                  <FiSend size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="text-center">
              <FiMessageSquare size={64} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Sélectionnez une conversation</h3>
              <p className="text-sm text-gray-500 mb-6">Choisissez un contact pour commencer à discuter</p>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="px-6 py-3 rounded-full text-white font-medium transition-colors hover:bg-opacity-90"
                style={{ backgroundColor: SEND_BTN_ORANGE }}
              >
                Nouveau message
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nouveau Message */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold" style={{ color: SIDEBAR_COLOR }}>
                Nouveau message
              </h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">Sélectionnez un contact pour démarrer une conversation</p>
              <div className="max-h-60 overflow-y-auto">
                {availableContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleNewMessage(contact)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" 
                         style={{ backgroundColor: SIDEBAR_COLOR }}>
                      <FiUser size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{contact.user_name}</div>
                      <div className="text-sm text-gray-500">{contact.role || "Collaborateur"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}