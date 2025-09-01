import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { FiSearch, FiMessageSquare, FiArrowLeft, FiSend, FiUser, FiPlus } from "react-icons/fi";

export default function MessageList({ user, contacts = [] }) {
  const SIDEBAR_COLOR = "#1d4c43";
  const SIDEBAR_ITEM_BG = "#FEEAA1";
  const MESSAGE_BG = "#ECF8F6";
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

  const fetchMessages = useCallback(async () => {
    if (!user || !selectedContact) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/messages/${user.id}?with=${selectedContact.id || selectedContact.user_id}`
      );
      setMessages(res.data || []);
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

  const filteredContacts = contacts.filter((contact) =>
    contact.user_name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button className="p-2 rounded-full hover:bg-gray-100" title="Ajouter" style={{ color: SEND_BTN_ORANGE }}>
            <FiPlus size={18} />
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filteredContacts.map((contact) => {
            const keyId = contact.id || contact.user_id;
            const isSelected = selectedContact && (selectedContact.id === contact.id || selectedContact.user_id === contact.user_id);
            return (
              <div
                key={keyId}
                onClick={() => { setSelectedContact(contact); if (isMobileView) setShowConversation(true); }}
                className={`cursor-pointer m-2 p-3 rounded-lg border ${isSelected ? "ring-2 ring-orange-300" : "border-gray-200"} transition-shadow`}
                style={{ backgroundColor: SIDEBAR_ITEM_BG }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: SIDEBAR_COLOR }}>
                    <FiUser size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-semibold" style={{ color: SIDEBAR_COLOR }}>{contact.user_name}</h3>
                      <span className="text-xs text-gray-500">{formatMessageTime(new Date())}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: SEND_BTN_ORANGE }}>{contact.role || "Collaborateur"}</p>
                    <p className="text-sm text-gray-700 mt-1 truncate">Dernier message...</p>
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
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
              {isMobileView && <button onClick={() => setShowConversation(false)} className="p-1 rounded-full hover:bg-gray-100"><FiArrowLeft className="text-gray-600" /></button>}
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: SIDEBAR_COLOR }}>
                <FiUser size={18} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedContact.user_name}</div>
                <div className="text-xs" style={{ color: SEND_BTN_ORANGE }}>{selectedContact.role || "Collaborateur"}</div>
              </div>
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
              {messages.map((message) => {
                const isMine = message.senderId === user.id;
                return (
                  <div key={message.msg_id || Math.random()} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                    <div
                      className="px-4 py-2 rounded-2xl shadow-sm break-words"
                      style={{
                        backgroundColor: MESSAGE_BG,
                        border: `2px solid ${SIDEBAR_COLOR}`,
                        color: isMine ? "#ffffff" : SIDEBAR_COLOR,
                      }}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="text-[10px] mt-1 text-right">{formatMessageTime(message.timestamp)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
            <FiMessageSquare size={48} className="mb-4" style={{ color: SEND_BTN_ORANGE }} />
            <h3 className="text-lg font-semibold">Sélectionnez une conversation</h3>
            <p className="text-sm text-gray-500 mt-2">Ou recherchez un collaborateur pour démarrer</p>
          </div>
        )}
      </div>
    </div>
  );
}
