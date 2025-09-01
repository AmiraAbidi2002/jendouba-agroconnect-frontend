import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FiSearch, FiMessageSquare, FiArrowLeft, FiSend, FiUser, FiPlus, FiX } from "react-icons/fi";

export default function MessageList({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobileView(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Charger les conversations existantes
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/conversations/${user.id}`);
        setConversations(response.data);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };
    
    fetchConversations();
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact.id}`
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

  // Rechercher un utilisateur par ID ou nom
  const searchUser = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(`http://localhost:8080/users/search?term=${searchTerm}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Démarrer une nouvelle conversation
  const startConversation = async (contact) => {
    try {
      // Vérifier si une conversation existe déjà
      const existingConversation = conversations.find(c => 
        c.participants.some(p => p.id === contact.id)
      );
      
      if (existingConversation) {
        setSelectedContact(contact);
        if (isMobileView) setShowConversation(true);
        return;
      }
      
      // Créer une nouvelle conversation
      await axios.post("http://localhost:8080/conversations", {
        participantIds: [user.id, contact.id]
      });
      
      // Ajouter à la liste des conversations
      setConversations(prev => [...prev, {
        id: Date.now(), // ID temporaire en attendant la réponse du serveur
        participants: [user, contact],
        lastMessage: null,
        updatedAt: new Date().toISOString()
      }]);
      
      setSelectedContact(contact);
      if (isMobileView) setShowConversation(true);
      setSearchTerm("");
      setSearchResults([]);
      
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

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
      
      // Mettre à jour la dernière conversation
      setConversations(prev => 
        prev.map(conv => 
          conv.participants.some(p => p.id === selectedContact.id)
            ? {...conv, lastMessage: {content: newMsg.trim(), timestamp: new Date().toISOString()}, updatedAt: new Date().toISOString()}
            : conv
        )
      );
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (searchResults.length > 0 && searchTerm) {
        // Si on est en mode recherche, sélectionner le premier résultat
        startConversation(searchResults[0]);
      } else {
        handleSend();
      }
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return "";
      
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      return diffInHours < 24
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const getLastMessage = (conversation) => {
    return conversation.lastMessage 
      ? conversation.lastMessage.content.length > 35 
        ? conversation.lastMessage.content.substring(0, 35) + "..." 
        : conversation.lastMessage.content
      : "Aucun message échangé";
  };

  return (
    <div className="flex h-full bg-white rounded-lg overflow-hidden">
      {/* Liste des conversations - Sidebar */}
      <div
        className={`w-full md:w-1/3 bg-white flex flex-col ${
          isMobileView && showConversation ? "hidden" : "flex"
        }`}
      >
        {/* En-tête avec boutons */}
        <div className="p-4 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: "#1d4c43" }}>Conversations</h2>
            <div className="flex space-x-2">
              <button 
                className="p-2 rounded-full text-white flex items-center justify-center"
                style={{ backgroundColor: "#1d4c43" }}
                onClick={() => setShowSearch(!showSearch)}
              >
                <FiSearch size={16} />
              </button>
              <button 
                className="p-2 rounded-full text-white flex items-center justify-center"
                style={{ backgroundColor: "#1d4c43" }}
                onClick={() => {
                  setShowSearch(true);
                  setSearchResults([]);
                }}
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
          
          {/* Barre de recherche */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchUser()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setSearchResults([]);
                }}
                className="absolute right-3 top-3 text-gray-400"
              >
                <FiX size={16} />
              </button>
            )}
          </div>
          
          {/* Bouton de recherche */}
          {searchTerm && (
            <button
              onClick={searchUser}
              disabled={isSearching}
              className="w-full mt-2 text-white py-2 rounded-lg transition"
              style={{ backgroundColor: "#1d4c43" }}
            >
              {isSearching ? "Recherche..." : "Rechercher"}
            </button>
          )}
        </div>

        {/* Résultats de recherche ou conversations */}
        <div className="flex-1 overflow-y-auto bg-white">
          {searchResults.length > 0 ? (
            // Afficher les résultats de recherche
            <div className="p-2">
              <h3 className="text-sm font-semibold p-2" style={{ color: "#1d4c43" }}>Résultats de recherche</h3>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="p-3 cursor-pointer transition-colors hover:bg-gray-50 rounded-lg"
                  onClick={() => startConversation(user)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                         style={{ backgroundColor: "#1d4c43" }}>
                      <FiUser size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold" style={{ color: "#1d4c43" }}>
                        {user.user_name || user.name}
                      </h3>
                      <p className="text-xs mt-1" style={{ color: "#ff8c00" }}>
                        {user.role || "Utilisateur"} • ID: {user.id}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cliquer pour démarrer une conversation
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length > 0 ? (
            // Afficher les conversations existantes
            conversations.map((conversation) => {
              const otherParticipant = conversation.participants.find(p => p.id !== user.id);
              const isSelected = selectedContact && selectedContact.id === otherParticipant.id;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setSelectedContact(otherParticipant);
                    if (isMobileView) setShowConversation(true);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                         style={{ backgroundColor: "#1d4c43" }}>
                      <FiUser size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-semibold" style={{ color: "#1d4c43" }}>
                            {otherParticipant.user_name || otherParticipant.name}
                          </h3>
                          <p className="text-xs mt-1" style={{ color: "#ff8c00" }}>
                            {otherParticipant.role || "Utilisateur"}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatMessageTime(conversation.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {getLastMessage(conversation)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "Aucun utilisateur trouvé" : "Aucune conversation"}
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
            <div className="p-4 flex items-center shadow-sm text-white"
                 style={{ backgroundColor: "#1d4c43" }}>
              <div className="flex items-center">
                {isMobileView && (
                  <button
                    onClick={() => setShowConversation(false)}
                    className="mr-3 p-1 rounded-full hover:bg-green-800 transition-colors"
                  >
                    <FiArrowLeft className="text-white" />
                  </button>
                )}
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                     style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                  <FiUser size={18} />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-white">{selectedContact.user_name || selectedContact.name}</h3>
                  <p className="text-xs text-gray-300">
                    {selectedContact.role || "Utilisateur"} • ID: {selectedContact.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.msg_id || message.id}
                    className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-xs md:max-w-md lg:max-w-lg">
                      <div
                        className={`px-4 py-2 rounded-xl shadow-sm ${
                          message.senderId === user.id
                            ? "bg-orange-100 text-gray-800"
                            : "bg-white text-gray-800"
                        }`}
                        style={{ 
                          border: message.senderId === user.id 
                            ? "1px solid #FED7AA" 
                            : "1px solid #E5E7EB" 
                        }}
                      >
                        <p className="break-words text-sm">{message.content}</p>
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

            <div className="p-4 bg-white flex items-center">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
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
            <p className="text-sm text-gray-500 mb-4">
              {showSearch 
                ? "Recherchez un utilisateur par ID ou nom pour démarrer une conversation" 
                : "Sélectionnez une conversation ou recherchez un utilisateur"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}