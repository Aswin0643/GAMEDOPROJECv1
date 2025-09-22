// src/components/ChatAI.js
import React, { useEffect, useState } from "react";
import { saveMessage, getMessages, getAllBooks } from "../db/indexedDB";

/**
 * Simple offline "AI" responder:
 * - tries to find keywords inside downloaded book chapters and returns a snippet
 * - if not found, replies with canned fallback responses
 *
 * This is intentionally lightweight so it runs offline.
 */

const FALLBACKS = [
  "That's an interesting question — try asking about a specific chapter or topic.",
  "I don't have that exact answer offline; try searching the books after downloading them.",
  "Can you rephrase? I can answer simple questions about the textbook content.",
];

function findInBooks(query, books) {
  if (!books || books.length === 0) return null;
  const q = query.toLowerCase();
  for (const b of books) {
    for (const ch of b.chapters || []) {
      const txt = (ch.text || "").toLowerCase();
      if (!txt) continue;
      // simple keyword search
      if (
        txt.includes(q) ||
        q.split(" ").some((w) => txt.includes(w) && w.length > 3)
      ) {
        // return small snippet
        const idx = txt.indexOf(q);
        const snippet =
          idx >= 0
            ? ch.text.substr(Math.max(0, idx - 50), 300)
            : ch.text.substr(0, 300);
        return `${b.title} — ${ch.title}\n\n${snippet}...`;
      }
    }
  }
  return null;
}

export default function ChatAI({ user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [booksCache, setBooksCache] = useState([]);

  useEffect(() => {
    fetchMessages();
    // load books to search
    getAllBooks().then(setBooksCache);
  }, []);

  const fetchMessages = async () => {
    const msgs = await getMessages();
    setMessages(msgs || []);
  };

  const appendAndReply = async (msg) => {
    // save user message
    await saveMessage({
      role: "user",
      user: user?.username || "student",
      text: msg,
      timestamp: Date.now(),
    });
    setMessages((m) => [
      ...m,
      { role: "user", text: msg, timestamp: Date.now() },
    ]);

    // produce auto-reply (simulate small thinking time)
    setTimeout(async () => {
      const found = findInBooks(msg, booksCache);
      const replyText =
        found || FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];
      const reply = {
        role: "assistant",
        text: replyText,
        timestamp: Date.now(),
      };
      await saveMessage(reply);
      setMessages((m) => [...m, reply]);
    }, 700);
  };

  const handleSend = () => {
    if (!text.trim()) return;
    appendAndReply(text.trim());
    setText("");
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <h3>Ask (offline AI)</h3>
      <div
        style={{
          border: "1px solid #ddd",
          padding: 12,
          height: 340,
          overflowY: "auto",
          background: "#fff",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#777" }}>
            No chat yet — ask a question about your downloaded books.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#555" }}>
              {m.role === "user" ? m.user || "You" : "GAMEDO"} •{" "}
              {new Date(m.timestamp).toLocaleTimeString()}
            </div>
            <div
              style={{
                padding: "6px 8px",
                borderRadius: 8,
                background: m.role === "user" ? "#e6f4ff" : "#f3f3f3",
                display: "inline-block",
                maxWidth: "100%",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, display: "flex" }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask anything about your books..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSend}
          style={{
            marginLeft: 8,
            padding: "10px 16px",
            borderRadius: 8,
            background: "#4CAF50",
            color: "#fff",
            border: "none",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
