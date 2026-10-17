import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare, Send, ExternalLink, ArrowLeft, Search,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────
const G    = "#009966";
const GD   = "#007a52";
const card  = "rounded-2xl border border-gray-200 bg-white shadow-sm";

// ── Types ────────────────────────────────────────────────────────────────────
interface Message {
  from: "customer" | "seller";
  text: string;
  time: string;
}

interface Conversation {
  id: string;
  customer: string;
  initials: string;
  avatarColor: string;
  product: string;
  productEmoji: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    customer: "Priya Sharma",
    initials: "PS",
    avatarColor: "#8b5cf6",
    product: "Samsung 65\" QLED TV",
    productEmoji: "📺",
    lastMessage: "Does this come with a wall mount?",
    time: "2m ago",
    unread: 2,
    messages: [
      { from: "customer", text: "Hi, I'm interested in the Samsung 65\" QLED TV.", time: "10:15 AM" },
      { from: "seller",   text: "Hello! Thank you for your interest. This TV is in stock and ready to ship.", time: "10:18 AM" },
      { from: "customer", text: "Does this come with a wall mount?", time: "10:22 AM" },
    ],
  },
  {
    id: "c2",
    customer: "Arjun Mehta",
    initials: "AM",
    avatarColor: "#3b82f6",
    product: "iPhone 15 Pro Max 256GB",
    productEmoji: "📱",
    lastMessage: "Is the phone unlocked?",
    time: "15m ago",
    unread: 1,
    messages: [
      { from: "customer", text: "Is the iPhone 15 Pro Max unlocked for all networks?", time: "9:45 AM" },
      { from: "seller",   text: "Yes, this is a factory unlocked device and works with all Indian carriers.", time: "9:50 AM" },
      { from: "customer", text: "Great! And is the warranty valid in India?", time: "9:55 AM" },
    ],
  },
  {
    id: "c3",
    customer: "Sunita Patel",
    initials: "SP",
    avatarColor: "#ec4899",
    product: "Dyson V15 Detect Vacuum",
    productEmoji: "🧹",
    lastMessage: "How long does the battery last?",
    time: "1h ago",
    unread: 0,
    messages: [
      { from: "customer", text: "What is the battery backup on the Dyson V15?", time: "Yesterday" },
      { from: "seller",   text: "The Dyson V15 provides up to 60 minutes of run time on Eco mode.", time: "Yesterday" },
      { from: "customer", text: "How long does the battery last before replacement?", time: "Yesterday" },
    ],
  },
  {
    id: "c4",
    customer: "Rohit Verma",
    initials: "RV",
    avatarColor: "#f59e0b",
    product: 'LG 32" Monitor 4K',
    productEmoji: "🖥️",
    lastMessage: "Can I use this for gaming?",
    time: "2h ago",
    unread: 3,
    messages: [
      { from: "customer", text: "Is the LG 32\" 4K monitor good for gaming?", time: "8:30 AM" },
      { from: "seller",   text: "It has a 60Hz refresh rate which is suitable for casual gaming.", time: "8:35 AM" },
      { from: "customer", text: "Can I use this for gaming?", time: "8:40 AM" },
    ],
  },
  {
    id: "c5",
    customer: "Meera Nair",
    initials: "MN",
    avatarColor: "#10b981",
    product: "Bose QC45 Headphones",
    productEmoji: "🎧",
    lastMessage: "What is the return policy?",
    time: "3h ago",
    unread: 0,
    messages: [
      { from: "customer", text: "Hello, I received the headphones but one earcup has a creak.", time: "7:00 AM" },
      { from: "seller",   text: "We are sorry to hear that! Please share a video of the issue.", time: "7:10 AM" },
      { from: "customer", text: "What is the return policy for this product?", time: "7:20 AM" },
    ],
  },
  {
    id: "c6",
    customer: "Vikram Singh",
    initials: "VS",
    avatarColor: "#6366f1",
    product: "Sony Alpha A7 III",
    productEmoji: "📷",
    lastMessage: "Does this include the kit lens?",
    time: "Yesterday",
    unread: 0,
    messages: [
      { from: "customer", text: "Hi, does the Sony A7 III listing include the 28-70mm kit lens?", time: "Oct 4" },
      { from: "seller",   text: "This listing is for the body only. The lens is sold separately.", time: "Oct 4" },
      { from: "customer", text: "Does this include the kit lens?", time: "Oct 4" },
    ],
  },
  {
    id: "c7",
    customer: "Kavita Rao",
    initials: "KR",
    avatarColor: "#ef4444",
    product: "Instant Pot Duo 7-in-1",
    productEmoji: "🍲",
    lastMessage: "Is this compatible with 220V?",
    time: "Oct 3",
    unread: 0,
    messages: [
      { from: "customer", text: "Is the Instant Pot compatible with Indian 220V power supply?", time: "Oct 3" },
      { from: "seller",   text: "Yes! This model supports 220–240V and works perfectly in India.", time: "Oct 3" },
      { from: "customer", text: "Is this compatible with 220V?", time: "Oct 3" },
    ],
  },
  {
    id: "c8",
    customer: "Deepak Joshi",
    initials: "DJ",
    avatarColor: "#0ea5e9",
    product: "Apple MacBook Air M2",
    productEmoji: "💻",
    lastMessage: "Delivery was fast, thank you!",
    time: "Oct 2",
    unread: 0,
    messages: [
      { from: "customer", text: "My MacBook Air M2 arrived today!", time: "Oct 2" },
      { from: "seller",   text: "Wonderful! We hope you enjoy it.", time: "Oct 2" },
      { from: "customer", text: "Delivery was fast, thank you!", time: "Oct 2" },
    ],
  },
];

const QUICK_REPLIES = [
  "Thank you for your question!",
  "We'll check and get back to you",
  "This product is available",
  "Please contact our support team",
];

// ── Conversation list item ────────────────────────────────────────────────────
function ConvItem({
  conv, active, onClick,
}: {
  conv: Conversation; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-3 rounded-xl transition-all flex items-start gap-3 relative"
      style={{
        background: active ? `${G}0e` : "transparent",
        borderLeft: active ? `2.5px solid ${G}` : "2.5px solid transparent",
      }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
        style={{ background: conv.avatarColor }}
      >
        {conv.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-bold text-gray-900 truncate">{conv.customer}</span>
          <span className="text-[10px] text-gray-400 shrink-0">{conv.time}</span>
        </div>
        <p className="text-[10px] text-gray-400 truncate">{conv.product}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>
      </div>
      {conv.unread > 0 && (
        <span
          className="absolute top-3 right-3 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center"
          style={{ background: G }}
        >
          {conv.unread}
        </span>
      )}
    </button>
  );
}

// ── Thread view ───────────────────────────────────────────────────────────────
function ThreadView({
  conv, onBack,
}: {
  conv: Conversation; onBack: () => void;
}) {
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState<Message[]>(conv.messages);

  const handleSend = () => {
    if (!reply.trim()) return;
    setMessages((prev) => [
      ...prev,
      { from: "seller", text: reply.trim(), time: "Just now" },
    ]);
    setReply("");
  };

  const handleQuickReply = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { from: "seller", text, time: "Just now" },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white rounded-t-2xl">
        <button
          onClick={onBack}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
          style={{ background: conv.avatarColor }}
        >
          {conv.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{conv.customer}</p>
          <p className="text-xs text-gray-400 truncate">
            {conv.productEmoji} {conv.product}
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <ExternalLink size={12} /> View Product
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50/50">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex ${msg.from === "seller" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[70%]">
              <div
                className="px-3.5 py-2.5 rounded-2xl text-sm"
                style={
                  msg.from === "seller"
                    ? { background: G, color: "#fff", borderBottomRightRadius: 6 }
                    : { background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderBottomLeftRadius: 6 }
                }
              >
                {msg.text}
              </div>
              <p className={`text-[10px] text-gray-400 mt-1 ${msg.from === "seller" ? "text-right" : "text-left"}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick replies */}
      <div className="px-4 py-2 border-t border-gray-100 bg-white flex flex-wrap gap-1.5">
        {QUICK_REPLIES.map((q) => (
          <button
            key={q}
            onClick={() => handleQuickReply(q)}
            className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Reply box */}
      <div className="px-4 pb-4 pt-2 bg-white rounded-b-2xl border-t border-gray-100 flex gap-2 items-end">
        <textarea
          rows={2}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a reply…"
          className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all"
          style={{ focusBorderColor: G } as React.CSSProperties}
        />
        <button
          onClick={handleSend}
          disabled={!reply.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-opacity disabled:opacity-40"
          style={{ background: G }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function CustomerMessagesPage() {
  const [activeId, setActiveId] = useState<string | null>("c1");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [search, setSearch] = useState("");

  const activeConv = CONVERSATIONS.find((c) => c.id === activeId) ?? null;

  const filtered = CONVERSATIONS.filter(
    (c) =>
      c.customer.toLowerCase().includes(search.toLowerCase()) ||
      c.product.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (id: string) => {
    setActiveId(id);
    setMobileView("thread");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={22} style={{ color: G }} /> Customer Messages
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Respond to customer queries about your products
          </p>
        </div>

        {/* Panel layout */}
        <div
          className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex"
          style={{ height: "calc(100vh - 200px)", minHeight: 500 }}
        >
          {/* Left: conversation list */}
          <div
            className={`flex flex-col border-r border-gray-100 ${mobileView === "thread" ? "hidden lg:flex" : "flex"}`}
            style={{ width: 300, minWidth: 280 }}
          >
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations…"
                  className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none bg-gray-50"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {filtered.map((conv) => (
                <ConvItem
                  key={conv.id}
                  conv={conv}
                  active={activeId === conv.id}
                  onClick={() => handleSelect(conv.id)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8">No conversations found</p>
              )}
            </div>
          </div>

          {/* Right: thread */}
          <div className={`flex-1 flex flex-col ${mobileView === "list" ? "hidden lg:flex" : "flex"}`}>
            <AnimatePresence mode="wait">
              {activeConv ? (
                <motion.div
                  key={activeConv.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col h-full"
                >
                  <ThreadView
                    conv={activeConv}
                    onBack={() => setMobileView("list")}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400"
                >
                  <MessageSquare size={40} className="text-gray-200" />
                  <p className="text-sm font-medium">Select a conversation to reply</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
