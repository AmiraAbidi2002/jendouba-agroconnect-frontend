import React from "react";
import Chat from "./Chat/Chat";

export default function MessageList({ contacts }) {
  return (
    <div>
      {contacts.map(contact => (
        <div key={contact.id}>
          <h4>{contact.name}</h4>
          <Chat receiverId={contact.id} />
        </div>
      ))}
    </div>
  );
}
