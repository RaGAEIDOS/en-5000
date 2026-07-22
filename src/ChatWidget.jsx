import { useState, useEffect, useRef, useCallback } from "react";

export default function ChatWidget({ token, userId, dark, openChat: chatProp }) {
  const [conversations, setConversations] = useState([]);
  const [openChat, setOpenChat] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [showList, setShowList] = useState(false);
  const msgEnd = useRef(null);
  const pollRef = useRef(null);

  // Open chat from parent
  useEffect(() => {
    if (chatProp && chatProp.id) {
      setOpenChat(chatProp);
      setMinimized(false);
      setShowList(false);
    }
  }, [chatProp]);

  const t = dark
    ? { bg: "#1a2332", card: "#1e2a3a", bd: "#2a3a4e", txt: "#e2e8f0", m: "#8899aa", accent: "#3B82F6" }
    : { bg: "#ffffff", card: "#f8f9fa", bd: "#e2e8f0", txt: "#1a202c", m: "#6b7280", accent: "#3B82F6" };

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchUnread = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/chat/unread", { headers });
      const d = await r.json();
      const total = Object.values(d.unread || {}).reduce((a, b) => a + b, 0);
      setUnreadTotal(total);
      return d.unread || {};
    } catch { return {}; }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [token, fetchUnread]);

  const fetchMessages = useCallback(async (otherId) => {
    if (!token || !otherId) return;
    try {
      const r = await fetch(`/api/chat/messages?with=${otherId}`, { headers });
      const d = await r.json();
      setMsgs(d.messages || []);
    } catch {}
  }, [token]);

  const openConversation = useCallback(async (otherId, otherName, otherPhoto) => {
    setOpenChat({ id: otherId, name: otherName, photo: otherPhoto });
    setMinimized(false);
    setShowList(false);
    setLoading(true);
    await fetchMessages(otherId);
    setLoading(false);
    fetchUnread();
  }, [fetchMessages, fetchUnread]);

  useEffect(() => {
    if (!openChat || minimized) return;
    fetchMessages(openChat.id);
    pollRef.current = setInterval(() => fetchMessages(openChat.id), 3000);
    return () => clearInterval(pollRef.current);
  }, [openChat, minimized, fetchMessages]);

  useEffect(() => {
    if (msgEnd.current) msgEnd.current.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    if (!input.trim() || !openChat) return;
    const text = input.trim();
    setInput("");
    setMsgs((m) => [...m, { sender_id: userId, receiver_id: openChat.id, message: text, created_at: new Date().toISOString() }]);
    try {
      await fetch("/api/chat/send", { method: "POST", headers, body: JSON.stringify({ receiverId: openChat.id, message: text }) });
    } catch {}
  };

  if (!token) return null;

  const onlineDot = (
    <span style={{
      width: 8, height: 8, borderRadius: "50%", background: "#22C55E",
      border: `2px solid ${t.card}`, position: "absolute", bottom: 0, right: 0,
      boxShadow: "0 0 4px rgba(34,197,94,.6)"
    }} />
  );

  return (
    <>
      {/* FAB Button */}
      <div
        onClick={() => { setShowList(!showList); if (!showList) fetchUnread(); }}
        style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #3B82F6, #2563EB)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", boxShadow: "0 4px 20px rgba(59,130,246,.4)",
          transition: "transform .2s"
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <span style={{ fontSize: 24 }}>💬</span>
        {unreadTotal > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#EF4444", color: "#fff", borderRadius: "50%",
            width: 22, height: 22, fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff"
          }}>{unreadTotal > 9 ? "9+" : unreadTotal}</span>
        )}
      </div>

      {/* Conversations List */}
      {showList && !openChat && (
        <div style={{
          position: "fixed", bottom: 86, right: 20, zIndex: 9999,
          width: 280, maxHeight: 400, background: t.card, borderRadius: 16,
          border: `1px solid ${t.bd}`, boxShadow: "0 8px 32px rgba(0,0,0,.18)",
          overflow: "hidden", animation: "slideUp .25s ease"
        }}>
          <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${t.bd}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: t.txt }}>Messages</div>
          </div>
          <div style={{ padding: "8px 0", overflowY: "auto", maxHeight: 340 }}>
            <div style={{ padding: "20px 16px", textAlign: "center", color: t.m, fontSize: 13 }}>
              Click a name in the leaderboard to start chatting
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {openChat && (
        <div style={{
          position: "fixed", bottom: 20, right: 20, zIndex: 9999,
          width: 340, height: minimized ? 48 : 460,
          background: t.card, borderRadius: 16,
          border: `1px solid ${t.bd}`,
          boxShadow: "0 8px 32px rgba(0,0,0,.22)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "slideUp .25s ease", transition: "height .2s"
        }}>
          {/* Header */}
          <div
            onClick={() => setMinimized(!minimized)}
            style={{
              padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
              background: "linear-gradient(135deg, #3B82F6, #2563EB)", cursor: "pointer",
              flexShrink: 0
            }}
          >
            <div style={{ position: "relative" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", overflow: "hidden",
                background: openChat.photo ? "#000" : "#fff", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700,
                color: "#3B82F6", flexShrink: 0
              }}>
                {openChat.photo
                  ? <img src={openChat.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : (openChat.name || "?").charAt(0).toUpperCase()}
              </div>
              {onlineDot}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{openChat.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>{minimized ? "Click to expand" : "Online"}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span onClick={(e) => { e.stopPropagation(); setMinimized(!minimized); }} style={{ color: "#fff", fontSize: 16, cursor: "pointer", opacity: .8 }}>{minimized ? "□" : "—"}</span>
              <span onClick={(e) => { e.stopPropagation(); setOpenChat(null); setShowList(false); }} style={{ color: "#fff", fontSize: 16, cursor: "pointer", opacity: .8 }}>✕</span>
            </div>
          </div>

          {/* Messages */}
          {!minimized && (
            <>
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                {loading && <div style={{ textAlign: "center", color: t.m, fontSize: 12, padding: 20 }}>Loading...</div>}
                {!loading && msgs.length === 0 && (
                  <div style={{ textAlign: "center", color: t.m, fontSize: 12, padding: 20 }}>
                    Send a message to start chatting!
                  </div>
                )}
                {msgs.map((m) => {
                  const isMe = m.sender_id === userId;
                  return (
                    <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "78%", padding: "8px 12px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: isMe ? "#3B82F6" : (dark ? "#2a3a4e" : "#e8ecf1"),
                        color: isMe ? "#fff" : t.txt, fontSize: 13, lineHeight: 1.45,
                        wordBreak: "break-word"
                      }}>
                        {m.message}
                        <div style={{ fontSize: 9, color: isMe ? "rgba(255,255,255,.5)" : t.m, marginTop: 3, textAlign: "right" }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={msgEnd} />
              </div>

              {/* Input */}
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${t.bd}`, display: "flex", gap: 8, flexShrink: 0 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                  placeholder="Type a message..."
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 20, border: `1px solid ${t.bd}`,
                    background: dark ? "#1a2332" : "#f1f3f5", color: t.txt, fontSize: 13,
                    outline: "none", fontFamily: "inherit"
                  }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", border: "none",
                    background: input.trim() ? "#3B82F6" : (dark ? "#2a3a4e" : "#e2e8f0"),
                    color: "#fff", fontSize: 16, cursor: input.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background .2s"
                  }}
                >➤</button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}

export function openChatWith(setOpenChatFn, otherId, otherName, otherPhoto) {
  setOpenChatFn({ id: otherId, name: otherName, photo: otherPhoto });
}
