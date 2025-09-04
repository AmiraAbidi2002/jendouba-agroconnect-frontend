import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiArrowLeft, FiSend, FiUser } from "react-icons/fi";
export const API_URL = "https://jendouba-agroconnect-backend-1.onrender.com";

const SIDEBAR_COLOR = "#1d4c43";
const SIDEBAR_ITEM_BG = "#FEF2F2";
const SEND_BTN_ORANGE = "#ff8c00";
const MESSAGE_BG = "#f8fafc";

// Helper function to get token from localStorage
const getToken = () => localStorage.getItem("token");

export default function MessageList({ user }) {
  // ===== States =====
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

  /**
   * Fetch all user conversations
   */
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const token = getToken();
      const res = await axios.get(
        `${API_URL}/messages/conversations/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConversations(res.data || []);
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  }, [user]);

  /**
   * Fetch messages for the selected conversation
   */
  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;
    try {
      const token = getToken();
      const res = await axios.get(
        `${API_URL}/messages/${user.id}?with=${selectedContact.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let msgs = res.data || [];

      // Normalize timestamps from backend
      msgs = msgs.map((msg) => {
        if (Array.isArray(msg.timestamp)) {
          const [year, month, day, hours, minutes, seconds, nanos] = msg.timestamp;
          msg.timestamp = new Date(year, month - 1, day, hours, minutes, seconds, nanos / 1e6);
        } else {
          msg.timestamp = new Date(msg.timestamp);
        }
        return msg;
      });

      // Sort by date
      msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(msgs);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }, [user, selectedContact]);

  // ===== Effects =====
  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh messages every 3s for real-time updates
  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchMessages, selectedContact]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Close search results on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== Handlers =====
  // Send a message
  const handleSend = async () => {
    if (!selectedContact || !newMsg.trim()) return;
    try {
      const token = getToken();
      await axios.post(
        "${API_URL}/messages",
        { senderId: user.id, receiverId: selectedContact.id, content: newMsg.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewMsg("");
      fetchMessages();
      fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Handle Enter key for sending messages
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  // Submit user search
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setShowSearchResults(true);
    try {
      const token = getToken();
      const res = await axios.get(
        `${API_URL}/users/search?query=${encodeURIComponent(searchTerm.trim())}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const filteredResults = (res.data || []).filter(u => u.user_id !== user.id);
      setSearchResults(filteredResults);
    } catch (err) {
      console.error("Error searching users:", err);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Select a contact for chat
  const selectContact = (contact) => {
    setSelectedContact({ id: contact.user_id, user_name: contact.user_name });
    setShowConversation(true);
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchTerm("");
  };

  // Format timestamps for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString("en-US", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex h-full w-full rounded-lg shadow-md overflow-hidden border border-gray-200 bg-white" style={{ minHeight: "600px", maxHeight: "600px" }}>
      {/* Sidebar */}
      <div className={`${showConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-200 flex-col bg-white`}>
        <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <h2 className="text-lg font-bold" style={{ color: SIDEBAR_COLOR }}>Conversations</h2>
        </div>

        {/* Search */}
        <div className="p-3 flex-shrink-0 relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID or Name..."
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
            <button
              type="submit"
              disabled={!searchTerm.trim() || isLoading}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FiSearch size={16} />
            </button>
          </form>

          {/* Search Results */}
          {showSearchResults && (
            <div className="search-results-overlay">
              {searchResults.length > 0 ? (
                searchResults.map((u) => (
                  <div
                    key={u.user_id}
                    className="search-result-item flex justify-between items-center cursor-pointer"
                    onClick={() => selectContact(u)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm truncate text-gray-900">{u.user_name}</div>
                      <div className="text-xs text-gray-600 truncate">ID: {u.user_id}</div>
                    </div>
                    <button
                      className="search-chat-button"
                      onClick={(e) => { e.stopPropagation(); selectContact(u); }}
                    >
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <div className="search-result-item text-center text-gray-600 text-sm">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center text-gray-500 p-4 text-sm">No conversations</div>
          ) : (
            <div className="p-2">
              {conversations.map((c) => {
                const isSelected = selectedContact && selectedContact.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => { setSelectedContact(c); setShowConversation(true); }}
                    className={`cursor-pointer mb-2 p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${isSelected ? "ring-2 ring-orange-300 border-orange-200" : "border-gray-200 hover:border-gray-300"}`}
                    style={{ backgroundColor: SIDEBAR_ITEM_BG }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: SIDEBAR_COLOR }}>
                        <FiUser size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate" style={{ color: SIDEBAR_COLOR }}>{c.user_name}</h3>
                        <p className="text-xs text-gray-500 truncate">ID: {c.id}</p>
                        {c.lastMessage && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {c.lastMessage.length > 35 ? `${c.lastMessage.substring(0, 35)}...` : c.lastMessage}
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

      {/* Conversation Area */}
      {showConversation && selectedContact && (
        <div className="flex-1 flex flex-col bg-white min-w-0 h-full">
          {/* Conversation Header */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0" style={{ backgroundColor: SIDEBAR_COLOR }}>
            <button onClick={() => setShowConversation(false)} className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 md:hidden">
              <FiArrowLeft className="text-white" size={20} />
            </button>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-white bg-opacity-20 flex-shrink-0">
              <FiUser size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-white truncate">{selectedContact.user_name}</div>
              <div className="text-sm text-white text-opacity-80">ID: {selectedContact.id}</div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar"
            style={{ 
              backgroundColor: MESSAGE_BG,
              height: 'calc(100vh - 200px)',
              maxHeight: '450px',
              minHeight: '200px',
              scrollBehavior: 'smooth'
            }}
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 p-8 text-sm">
                <FiUser size={32} className="mx-auto mb-2 opacity-30" />
                No messages in this conversation
              </div>
            ) : (
              messages.map((m) => {
                const currentUserId = Number(user?.id || user?.userId);
                const isMine = Number(m.senderId) === currentUserId;
                return (
                  <div
                    key={m.msg_id || `${m.timestamp}-${Math.random()}`}
                    className={`message-wrapper ${isMine ? "sent" : "received"}`}
                  >
                    <div
                      className={`px-4 py-3 shadow-lg ${isMine ? 'message-bubble-sent' : 'message-bubble-received'}`}
                      style={{
                        backgroundColor: isMine ? SIDEBAR_COLOR : "#ffffff",
                        color: isMine ? "#ffffff" : "#2d3748",
                        boxShadow: isMine 
                          ? "0 4px 12px -2px rgba(29, 76, 67, 0.4)" 
                          : "0 4px 12px -2px rgba(0, 0, 0, 0.15)"
                      }}
                    >
                      {/* Message content */}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                      
                      {/* Timestamp */}
                      <div className={`message-timestamp ${isMine ? 'sent' : 'received'}`}>
                        {formatTimestamp(m.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 bg-white p-3 flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none min-h-[40px] max-h-[120px]"
                placeholder="Type a message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyPress}
                rows={1}
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 transparent' }}
              />
              <button
                onClick={handleSend}
                disabled={!newMsg.trim()}
                className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center transition-colors min-h-[40px] ${!newMsg.trim() ? "bg-gray-400 cursor-not-allowed" : "hover:opacity-90"}`}
                style={{ backgroundColor: newMsg.trim() ? SEND_BTN_ORANGE : "#9CA3AF" }}
              >
                <FiSend size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder when no conversation is open */}
      {!showConversation && (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <FiUser size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm">Choose a contact to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}
