"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const { itemId } = useParams();

  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const [contacts, setContacts] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;
      setUserId(session.user.id);

      // Load chat (RLS protected)
      const { data: chatRow } = await supabase
        .from("chats")
        .select("*")
        .eq("item_id", itemId)
        .single();

      if (!chatRow) return;
      setChat(chatRow);

      // Load messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("chat_id", chatRow.id)
        .order("created_at");

      setMessages(msgs ?? []);

      // Load contact exchange (if exists)
      const { data: contactRow } = await supabase
        .from("contact_exchanges")
        .select("*")
        .eq("item_id", itemId)
        .single();

      if (contactRow) setContacts(contactRow);
    };

    load();
  }, [itemId]);

  const sendMessage = async () => {
    if (!text.trim() || !chat || !userId) return;

    await supabase.from("messages").insert({
      chat_id: chat.id,
      sender_id: userId,
      content: text,
    });

    setText("");

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chat.id)
      .order("created_at");

    setMessages(data ?? []);
  };

  const saveContacts = async () => {
    if (!chat || !userId) return;

    await supabase.from("contact_exchanges").upsert({
      item_id: itemId,
      owner_id: chat.owner_id,
      requester_id: chat.requester_id,
      phone,
      email,
    });

    const { data } = await supabase
      .from("contact_exchanges")
      .select("*")
      .eq("item_id", itemId)
      .single();

    setContacts(data);
  };

  if (!chat) {
    return <p style={{ padding: 40 }}>Chat not available.</p>;
  }

  return (
    <div className="card" style={{ maxWidth: 650 }}>
      <h2>Pickup Chat</h2>

      {/* SAFETY MESSAGE */}
      <p
        style={{
          fontSize: 14,
          color: "#64748b",
          marginBottom: 12,
        }}
      >
        This is a private chat visible only to you and the other party.
        Use it to coordinate pickup and share contact details if needed.
      </p>

      {/* MESSAGES */}
      <div
        style={{
          height: 320,
          overflowY: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 12,
          marginBottom: 12,
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#64748b" }}>
            Start the conversation…
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: 8,
              textAlign:
                m.sender_id === userId ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 10px",
                borderRadius: 8,
                background:
                  m.sender_id === userId
                    ? "#2563eb"
                    : "#e5e7eb",
                color:
                  m.sender_id === userId
                    ? "#fff"
                    : "#000",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      {/* MESSAGE INPUT */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #cbd5f5",
          }}
        />
        <button className="btn btn-primary" onClick={sendMessage}>
          Send
        </button>
      </div>

      {/* CONTACT EXCHANGE */}
      <hr style={{ margin: "24px 0" }} />

      <h3>Contact Details</h3>

      {!contacts ? (
        <>
          <p style={{ fontSize: 14, color: "#64748b" }}>
            Share contact details only if you’re comfortable.
          </p>

          <input
            placeholder="Phone number (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 8,
            }}
          />

          <input
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 8,
              padding: 8,
            }}
          />

          <button className="btn btn-primary" onClick={saveContacts}>
            Share Contact Info
          </button>
        </>
      ) : (
        <div className="card">
          {contacts.phone && (
            <p>📞 <strong>Phone:</strong> {contacts.phone}</p>
          )}
          {contacts.email && (
            <p>📧 <strong>Email:</strong> {contacts.email}</p>
          )}
        </div>
      )}
    </div>
  );
}
