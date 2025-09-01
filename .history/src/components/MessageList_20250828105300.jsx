import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiArrowLeft, FiSend, FiUser } from "react-icons/fi";

export default function MessageList({ user, contacts = [] }) {
  const SIDEBAR_COLOR = "#1d4c43";
  const SIDEBAR_ITEM_BG = "#FEF2F2"; // Couleur contacts
  const SEND_BTN_ORANGE = "#ff8c00";

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const checkScreenSize = () => setIsMobileView(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const fetchMessages = useCallback(async (contactId) => {
    if (!user || !contactId) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${contactId}`
      );
      setMessages(res.data || []);
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact.id || selectedContact.user_id);
      const interval = setInterval(() => fetchMessages(selectedContact.id || selectedContact.user_id), 3000);
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
      fetchMessages(selectedContact.id || selectedContact.user_id);
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

  const filteredContacts = contacts.filter((contact) =>
    contact.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouper les messages par date
  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const dateKey = new Date(msg.timestamp).toLocaleDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(msg);
    });
    return grouped;
  };

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
  const messagesByDate = groupMessagesByDate(sortedMessages);

  // Gérer la recherche / création nouvelle conversation
  const handleSearchEnter = (e) => {
    if (e.key !== "Enter") return;
    const idEntered = searchTerm.trim();
    if (!idEntered) return;

    const existing = contacts.find(
      (c) => (c.id || c.user_id).toString() === idEntered
    );

    if (existing) {
      setSelectedContact(existing);
    } else {
      const newContact = { id: idEntered, user_name: `User ${idEntered}` };
      setSelectedContact(newContact);
    }
    setShowConversation(true);
  };

  return (
    <div className="flex h-full rounded-lg shadow-md overflow-hidden border border-gray-200" style={{ minHeight: 480 }}>
      
      {/* Sidebar : liste des conversations */}
      {!showConversation && (
        <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-white`}>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-lg font-bold" style={{ color: SIDEBAR_COLOR }}>Conversations</h2>
            </div>
          </div>

          <div className="p-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher ou saisir ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchEnter}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredContacts.map((contact) => {
              const keyId = contact.id || contact.user_id;
              return (
                <div
                  key={keyId}
                  onClick={() => { setSelectedContact(contact); setShowConversation(true); }}
                  className="cursor-pointer m-2 p-3 rounded-lg border border-gray-200 transition-shadow"
                  style={{ backgroundColor: SIDEBAR_ITEM_BG }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: SIDEBAR_COLOR }}>
                      <FiUser size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold" style={{ color: SIDEBAR_COLOR }}>{contact.user_name}</h3>
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
        <div className="w-full md:w-2/3 flex flex-col bg-white">
          {/* Header conversation */}
          <div className="p-4 border-b border-gray-200 flex items-center gap-3" style={{ backgroundColor: SIDEBAR_COLOR }}>
            <button 
              onClick={() => setShowConversation(false)} 
              className="p-1 rounded-full hover:bg-gray-100 hover:bg-opacity-20"
            >
              <FiArrowLeft className="text-white" />
            </button>
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-white bg-opacity-20">
              <FiUser size={18} />
            </div>
            <div>
              <div className="font-semibold text-white">{selectedContact.user_name}</div>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef} 
            className="flex-1 overflow-y-auto p-4"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            {Object.keys(messagesByDate).map(date => (
              <div key={date}>
                <div className="text-center text-gray-400 text-xs my-2">{date}</div>
                {messagesByDate[date].map(msg => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div key={msg.msg_id || Math.random()} className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
                      <div
                        className="px-4 py-2 rounded-2xl shadow-sm break-words max-w-xs"
                        style={{
                          backgroundColor: isMine ? "#1d4c43" : "#FEF2F2",
                          color: isMine ? "#fff" : "#000",
                          border: `2px solid ${isMine ? "#1d4c43" : "#ccc"}`
                        }}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div className="text-[10px] mt-1 text-right text-gray-500">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Zone d'envoi */}
          <div className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez un message..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={handleSend}
              disabled={!newMsg.trim()}
              className="px-4 py-2 rounded-full text-white flex items-center gap-2"
              style={{ backgroundColor: SIDEBAR_COLOR, opacity: newMsg.trim() ? 1 : 0.6 }}
            >
              <FiSend />
              <span className="hidden md:inline-block">Envoyer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
