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

  // Vérifier la taille de l'écran pour le responsive
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
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
      // Mettre à jour les messages toutes les 5 secondes
      const interval = setInterval(fetchMessages, 5000);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filtrer les contacts selon la recherche
  const filteredContacts = contacts.filter(contact => 
    contact.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formater la date des messages
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Obtenir le dernier message pour l'affichage dans la liste
  const getLastMessage = (contactId) => {
    // Dans une implémentation réelle, vous récupéreriez le dernier message de la conversation
    return "Dernier message échangé...";
  };

  return (
    <div className="flex h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Liste des conversations */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 bg-white flex flex-col ${isMobileView && showConversation ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <div
                key={contact.id || contact.user_id}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedContact && (selectedContact.id === contact.id || selectedContact.user_id === contact.user_id) 
                    ? "bg-green-50" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelectedContact(contact);
                  if (isMobileView) setShowConversation(true);
                }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                    <FiUser size={18} />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {contact.user_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(new Date())}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {getLastMessage(contact.id || contact.user_id)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 bg-white">
              {searchTerm ? "Aucun contact trouvé" : "Aucun contact disponible"}
            </div>
          )}
        </div>
      </div>

      {/* Conversation sélectionnée */}
      <div className={`w-full md:w-2/3 flex flex-col bg-white ${isMobileView && !showConversation ? 'hidden' : 'flex'}`}>
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center">
              {isMobileView && (
                <button 
                  onClick={() => setShowConversation(false)}
                  className="mr-2 p-1 rounded-full hover:bg-gray-100"
                >
                  <FiArrowLeft className="text-gray-600" />
                </button>
              )}
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                <FiUser size={16} />
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{selectedContact.user_name}</h3>
                <p className="text-xs text-gray-500">En ligne</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.msg_id}
                      className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                          message.senderId === user.id
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === user.id ? "text-green-100" : "text-gray-500"
                          }`}
                        >
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white">
                  <div className="text-center text-gray-500">
                    <FiMessageSquare className="mx-auto text-4xl mb-2 text-gray-400" />
                    <p>Aucun message échangé pour le moment</p>
                    <p className="text-sm">Envoyez le premier message !</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Écrivez votre message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMsg.trim()}
                  className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FiSend className="mr-1" /> Envoyer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center bg-white">
            <div className="text-center text-gray-500 p-4">
              <FiMessageSquare className="mx-auto text-4xl mb-2 text-gray-400" />
              <h3 className="text-lg font-medium mb-1">Vos messages</h3>
              <p className="text-sm">Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}