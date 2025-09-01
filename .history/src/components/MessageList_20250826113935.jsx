import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FiSearch, FiMessageSquare, FiArrowLeft, FiSend, FiUser, FiMoreVertical } from "react-icons/fi";

export default function MessageList({ user, contacts = [] }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

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

  const filteredContacts = contacts.filter(contact => 
    contact.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getLastMessage = (contactId) => {
    const contactMessages = messages.filter(msg => 
      msg.senderId === contactId || msg.receiverId === contactId
    );
    
    if (contactMessages.length > 0) {
      const lastMsg = contactMessages[contactMessages.length - 1];
      return lastMsg.content.length > 30 
        ? `${lastMsg.content.substring(0, 30)}...` 
        : lastMsg.content;
    }
    
    return "No messages yet";
  };

  return (
    <div className="flex h-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Conversation list */}
      <div className={`w-full md:w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col ${isMobileView && showConversation ? 'hidden' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
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
                    ? "bg-green-100" 
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSelectedContact(contact);
                  if (isMobileView) setShowConversation(true);
                }}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-sm">
                    <FiUser size={16} />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {contact.user_name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(new Date())}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {getLastMessage(contact.id || contact.user_id)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500 bg-white">
              {searchTerm ? "No contacts found" : "No contacts available"}
            </div>
          )}
        </div>
      </div>

      {/* Conversation panel */}
      <div className={`w-full md:w-2/3 flex flex-col bg-white ${isMobileView && !showConversation ? 'hidden' : 'flex'}`}>
        {selectedContact ? (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
              <div className="flex items-center">
                {isMobileView && (
                  <button 
                    onClick={() => setShowConversation(false)}
                    className="mr-3 p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiArrowLeft className="text-gray-600" />
                  </button>
                )}
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white shadow-sm">
                  <FiUser size={16} />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">{selectedContact.user_name}</h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                <FiMoreVertical size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.msg_id}
                      className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-3 rounded-xl shadow-sm ${
                          message.senderId === user.id
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-2 text-right ${
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
                <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FiMessageSquare className="text-2xl text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Your messages</h3>
                  <p className="text-sm text-gray-500 text-center">No messages exchanged yet</p>
                  <p className="text-xs text-gray-400 mt-1">Send the first message!</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white shadow-sm">
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMsg.trim()}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-3 rounded-r-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all duration-200 shadow-sm"
                >
                  <FiSend className="mr-1" /> Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <FiMessageSquare className="text-3xl text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Your messages</h3>
            <p className="text-gray-500 text-center max-w-md">
              Select a conversation from the list to start chatting with your contacts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}