import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FiSearch, FiMessageSquare, FiArrowLeft, FiSend, FiUser } from "react-icons/fi";

export default function MessageList({ user, contacts = [] }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

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
      setMessages(res.data);
    } catch (err) {
      console.error("Error getting messages:", err);
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
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.id && contact.id.toString().includes(searchTerm))
  );

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    return diffInHours < 24
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString();
  };

  const getLastMessage = (contactId) => {
    const contactMessages = messages.filter(msg => 
      msg.senderId === contactId || msg.receiverId === contactId
    );
    if (contactMessages.length > 0) {
      const lastMsg = contactMessages[contactMessages.length - 1];
      return lastMsg.content.length > 35 
        ? lastMsg.content.substring(0, 35) + "..." 
        : lastMsg.content;
    }
    return "Aucun message échangé";
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Liste des contacts - Sidebar blanche */}
      <div
        className={`w-full md:w-1/3 border-r border-gray-200 bg-white flex flex-col ${
          isMobileView && showConversation ? "hidden" : "flex"
        }`}
      >
        {/* En-tête avec fond blanc */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold" style={{ color: "#1d4c43" }}>Conversations</h2>
          
          <div className="relative mt-3">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => {
              const isSelected = selectedContact && 
                (selectedContact.id === contact.id || selectedContact.user_id === contact.user_id);
                
              return (
                <div
                  key={contact.id || contact.user_id}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedContact(contact);
                    if (isMobileView) setShowConversation(true);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white"
                         style={{ backgroundColor: "#1d4c43" }}>
                      <FiUser size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-semibold" style={{ color: "#1d4c43" }}>
                          {contact.user_name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(new Date())}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: "#ff8c00" }}>
                        {contact.role || "Collaborateur"}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {getLastMessage(contact.id || contact.user_id)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "Aucun contact trouvé" : "Aucun contact disponible"}
            </div>
          )}
        </div>
      </div>

      {/* Conversation - Main Content */}
      <div
        className={`w-full md:w-2/3 flex flex-col bg-gray-50 ${
          isMobileView && !showConversation ? "hidden" : "flex"
        }`}
      >
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center shadow-sm">
              <div className="flex items-center">
                {isMobileView && (
                  <button
                    onClick={() => setShowConversation(false)}
                    className="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FiArrowLeft className="text-gray-600" />
                  </button>
                )}
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                     style={{ backgroundColor: "#1d4c43" }}>
                  <FiUser size={18} />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{selectedContact.user_name}</h3>
                  <p className="text-xs" style={{ color: "#ff8c00" }}>
                    {selectedContact.role || "Collaborateur"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.msg_id}
                    className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-xs md:max-w-md lg:max-w-lg">
                      <div className="text-xs mb-1 px-2" style={{ color: "#1d4c43" }}>
                        {message.senderId === user.id ? "Vous" : selectedContact.user_name}
                      </div>
                      <div
                        className={`px-4 py-2 rounded-xl ${
                          message.senderId === user.id
                            ? "bg-orange-100 text-gray-800"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            message.senderId === user.id ? "text-orange-600" : "text-gray-400"
                          }`}
                        >
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-6">
                  <div className="p-4 rounded-full mb-3" style={{ backgroundColor: "#fef6e6" }}>
                    <FiMessageSquare className="text-3xl" style={{ color: "#ff8c00" }} />
                  </div>
                  <h3 className="text-lg font-medium mb-1 text-gray-500">Aucun message</h3>
                  <p className="text-sm text-gray-400">Envoyez le premier message pour commencer la conversation</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white flex items-center">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez un message..."
                className="flex-1 border border-gray-300 rounded-l-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              />
              <button
                onClick={handleSend}
                disabled={!newMsg.trim()}
                className="text-white px-5 py-2 rounded-r-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                style={{ backgroundColor: "#1d4c43" }}
              >
                <FiSend className="mr-1" /> Envoyer
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-6">
            <div className="p-5 rounded-full mb-4" style={{ backgroundColor: "#fef6e6" }}>
              <FiMessageSquare className="text-4xl" style={{ color: "#ff8c00" }} />
            </div>
            <h3 className="text-lg font-medium mb-1 text-gray-600">Messagerie Professionnelle</h3>
            <p className="text-sm text-gray-500 mb-4">Sélectionnez une conversation ou recherchez un collaborateur</p>
            <div className="w-64 relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}