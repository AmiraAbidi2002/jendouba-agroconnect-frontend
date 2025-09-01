import React, { useState, useEffect, useCallback } from "react"; 
import axios from "axios";
import { FiSearch, FiMessageSquare, FiArrowLeft, FiSend, FiUser, FiPlus } from "react-icons/fi";

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

  return (
    <div className="flex h-full bg-gray-50 rounded-lg shadow-md overflow-hidden border border-gray-200">
      {/* Sidebar contacts */}
      <div className={`w-full md:w-1/3 border-r border-gray-200 bg-white flex flex-col ${isMobileView && showConversation ? "hidden" : "flex"}`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-[#1d4c43]">Conversations</h2>
          <button className="p-2 rounded-full hover:bg-gray-100 text-orange-500">
            <FiPlus size={20} />
          </button>
        </div>
        <div className="relative p-4">
          <FiSearch className="absolute left-6 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => {
            const isSelected = selectedContact && (selectedContact.id === contact.id || selectedContact.user_id === contact.user_id);
            return (
              <div
                key={contact.id || contact.user_id}
                className={`p-2 m-2 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"}`}
                onClick={() => { setSelectedContact(contact); if(isMobileView) setShowConversation(true); }}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#1d4c43]">
                    <FiUser size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-semibold text-[#1d4c43]">{contact.user_name}</h3>
                      <span className="text-xs text-gray-400">{formatMessageTime(new Date())}</span>
                    </div>
                    <p className="text-xs mt-1 text-orange-500">{contact.role || "Collaborateur"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversation */}
      <div className={`w-full md:w-2/3 flex flex-col ${isMobileView && !showConversation ? "hidden" : "flex"}`}>
        {selectedContact ? (
          <>
            {/* Header conversation */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center shadow-sm">
              {isMobileView && (
                <button onClick={() => setShowConversation(false)} className="mr-3 p-1 rounded-full hover:bg-gray-100">
                  <FiArrowLeft className="text-gray-600" />
                </button>
              )}
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#1d4c43]">
                <FiUser size={18} />
              </div>
              <div className="ml-3">
                <h3 className="font-semibold text-gray-900">{selectedContact.user_name}</h3>
                <p className="text-xs text-orange-500">{selectedContact.role || "Collaborateur"}</p>
              </div>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FEEAA1]">
              {messages.map((message) => (
                <div key={message.msg_id} className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-xs md:max-w-md">
                    <div className="px-3 py-2 rounded-xl" style={{
                      backgroundColor: message.senderId === user.id ? "#FEEAA1" : "#1d4c43",
                      color: message.senderId === user.id ? "#1d4c43" : "#fff"
                    }}>
                      <p className="text-sm break-words">{message.content}</p>
                      <p className="text-[10px] mt-1 text-right">
                        {formatMessageTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <div className="p-3 border-t bg-[#1d4c43] flex items-center gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez un message..."
                className="flex-1 px-4 py-2 rounded-l-full focus:outline-none"
              />
              <button onClick={handleSend} disabled={!newMsg.trim()} className="px-4 py-2 rounded-r-full bg-orange-500 text-white hover:opacity-90 disabled:opacity-50">
                <FiSend />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6">
            <FiMessageSquare size={48} className="mb-3 text-orange-500"/>
            <h3 className="font-medium mb-1">Sélectionnez une conversation</h3>
            <p className="text-sm text-gray-500">Ou recherchez un collaborateur pour démarrer</p>
          </div>
        )}
      </div>
    </div>
  );
}
