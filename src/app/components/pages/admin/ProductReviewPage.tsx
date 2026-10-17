import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Star, CheckCircle2, XCircle, Clock, Search, Filter, Eye, Trash2,
  ThumbsUp, ShieldCheck, Package, MessageSquare, TrendingUp, ChevronDown, X,
} from "lucide-react";
import { G, fmt, inp, card } from "./shared/constants";
import { PageHeader, Field, Toggle } from "./shared/ui";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReviewStatus = "pending" | "approved" | "rejected";

interface Review {
  id: number;
  productName: string;
  productImg: string;
  category: string;
  reviewer: { name: string; avatar: string; city: string; hasPurchased: boolean };
  rating: number;
  title: string;
  body: string;
  date: string;
  status: ReviewStatus;
  helpful: number;
  images: number;
  reply: string | null;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const REVIEWS: Review[] = [
  {
    id: 1, productName: "iPhone 15 Pro Max", productImg: "📱", category: "Electronics",
    reviewer: { name: "Arjun Mehta", avatar: "AM", city: "Mumbai", hasPurchased: true },
    rating: 5, title: "Best phone I've ever owned!",
    body: "The camera system is absolutely phenomenal — the 48MP main sensor captures stunning detail. Battery life easily lasts a full day with heavy usage. Worth every rupee.",
    date: "12 Sep 2024", status: "approved", helpful: 47, images: 3, reply: "Thank you for your kind words, Arjun! We're thrilled you're loving it.",
  },
  {
    id: 2, productName: "iPhone 15 Pro Max", productImg: "📱", category: "Electronics",
    reviewer: { name: "Priya Sharma", avatar: "PS", city: "Delhi", hasPurchased: true },
    rating: 4, title: "Great phone but pricey",
    body: "Performance is top-notch and the titanium build feels premium. My only gripe is the price, but the overall experience justifies it. Camera blows my old phone out of the water.",
    date: "14 Sep 2024", status: "pending", helpful: 12, images: 1, reply: null,
  },
  {
    id: 3, productName: "Samsung Galaxy S24 Ultra", productImg: "📲", category: "Electronics",
    reviewer: { name: "Rohan Gupta", avatar: "RG", city: "Bangalore", hasPurchased: true },
    rating: 5, title: "S Pen makes it unique",
    body: "The S Pen integration is seamlessly brilliant for note-taking. Display is gorgeous with the 120Hz refresh rate. AI features are genuinely useful, not gimmicky.",
    date: "3 Oct 2024", status: "approved", helpful: 34, images: 2, reply: null,
  },
  {
    id: 4, productName: "Samsung Galaxy S24 Ultra", productImg: "📲", category: "Electronics",
    reviewer: { name: "Neha Joshi", avatar: "NJ", city: "Pune", hasPurchased: false },
    rating: 2, title: "Disappointing battery backup",
    body: "Expected much better battery life from a flagship. The phone heats up during gaming sessions more than I'd like. Camera is good but not worth the price point.",
    date: "18 Sep 2024", status: "rejected", helpful: 5, images: 0, reply: "Hi Neha, we're sorry about your experience. Please contact support at help@bharatbazar.in.",
  },
  {
    id: 5, productName: "Apple MacBook Air M3", productImg: "💻", category: "Electronics",
    reviewer: { name: "Vikram Nair", avatar: "VN", city: "Chennai", hasPurchased: true },
    rating: 5, title: "Silent, fast, and gorgeous",
    body: "No fan noise whatsoever — just pure silent performance. M3 chip handles everything I throw at it from video editing to coding. The Liquid Retina display is stunning.",
    date: "20 Sep 2024", status: "approved", helpful: 61, images: 1, reply: "Thanks Vikram! The M3 chip is a game-changer for sure.",
  },
  {
    id: 6, productName: "Apple MacBook Air M3", productImg: "💻", category: "Electronics",
    reviewer: { name: "Ananya Pillai", avatar: "AP", city: "Hyderabad", hasPurchased: true },
    rating: 4, title: "Perfect for students and professionals",
    body: "Lightweight design makes it easy to carry around campus. Battery lasts over 15 hours on a single charge, which is incredible. Wish it had more ports though.",
    date: "25 Sep 2024", status: "pending", helpful: 28, images: 0, reply: null,
  },
  {
    id: 7, productName: "Kanjivaram Pure Silk Saree", productImg: "🥻", category: "Fashion",
    reviewer: { name: "Lakshmi Iyer", avatar: "LI", city: "Chennai", hasPurchased: true },
    rating: 5, title: "Authentic and absolutely stunning",
    body: "The zari work is exquisite and the silk quality is exactly as described — pure kanjivaram. Received many compliments at my daughter's wedding. Packaging was also beautiful.",
    date: "7 Oct 2024", status: "pending", helpful: 19, images: 3, reply: null,
  },
  {
    id: 8, productName: "Kanjivaram Pure Silk Saree", productImg: "🥻", category: "Fashion",
    reviewer: { name: "Meena Raghavan", avatar: "MR", city: "Coimbatore", hasPurchased: true },
    rating: 3, title: "Good but color slightly different",
    body: "The saree quality is nice but the color online looked more vibrant than in person. The zari work is beautiful though. Delivery was prompt.",
    date: "1 Oct 2024", status: "pending", helpful: 8, images: 2, reply: null,
  },
  {
    id: 9, productName: "Prestige Svachh Pressure Cooker 5L", productImg: "🍲", category: "Kitchen",
    reviewer: { name: "Sunita Devi", avatar: "SD", city: "Lucknow", hasPurchased: true },
    rating: 5, title: "Best cooker for Indian cooking",
    body: "Perfect for dal, rice, and biryani. The whistle mechanism works flawlessly and it heats evenly. Very easy to clean after cooking. Has become my daily kitchen essential.",
    date: "29 Sep 2024", status: "approved", helpful: 42, images: 1, reply: null,
  },
  {
    id: 10, productName: "Prestige Svachh Pressure Cooker 5L", productImg: "🍲", category: "Kitchen",
    reviewer: { name: "Kavita Verma", avatar: "KV", city: "Jaipur", hasPurchased: false },
    rating: 1, title: "Handle broke after 2 months",
    body: "Very disappointed with the build quality. The handle cracked after light usage. Expected much better from Prestige. Would not recommend.",
    date: "15 Sep 2024", status: "rejected", helpful: 3, images: 1, reply: "We're sorry for this experience, Kavita. Please share your order details and we'll arrange a replacement.",
  },
  {
    id: 11, productName: "boAt Rockerz 550 Wireless", productImg: "🎧", category: "Electronics",
    reviewer: { name: "Rahul Singh", avatar: "RS", city: "Chandigarh", hasPurchased: true },
    rating: 4, title: "Great sound for the price",
    body: "40-hour battery life is impressive. Bass is punchy and clear, perfect for hip-hop and EDM. Comfortable for long listening sessions. Mic quality is decent for calls.",
    date: "22 Sep 2024", status: "approved", helpful: 31, images: 0, reply: null,
  },
  {
    id: 12, productName: "boAt Rockerz 550 Wireless", productImg: "🎧", category: "Electronics",
    reviewer: { name: "Kiran Patel", avatar: "KP", city: "Ahmedabad", hasPurchased: true },
    rating: 5, title: "Excellent value for money",
    body: "Couldn't believe the audio quality for this price range. The build feels solid and the cushions are very comfortable. Already recommended to three friends!",
    date: "5 Oct 2024", status: "pending", helpful: 15, images: 0, reply: null,
  },
  {
    id: 13, productName: "Nike Air Max 270", productImg: "👟", category: "Footwear",
    reviewer: { name: "Aditya Kumar", avatar: "AK", city: "Delhi", hasPurchased: true },
    rating: 5, title: "Supreme comfort all day long",
    body: "The Air unit in the heel provides incredible cushioning — my feet don't hurt even after 10 hours of wear. Looks amazing and goes with everything. Runs true to size.",
    date: "8 Oct 2024", status: "pending", helpful: 22, images: 2, reply: null,
  },
  {
    id: 14, productName: "Nike Air Max 270", productImg: "👟", category: "Footwear",
    reviewer: { name: "Shruti Kapoor", avatar: "SK", city: "Mumbai", hasPurchased: false },
    rating: 3, title: "Stylish but runs small",
    body: "The design is beautiful but I had to size up by half. Once I got the right size the comfort is decent. A bit pricey but the brand value is there.",
    date: "2 Oct 2024", status: "pending", helpful: 9, images: 1, reply: null,
  },
  {
    id: 15, productName: "Himalaya Face Wash Neem 150ml", productImg: "🌿", category: "Beauty",
    reviewer: { name: "Pooja Mishra", avatar: "PM", city: "Varanasi", hasPurchased: true },
    rating: 4, title: "Cleared my acne in 3 weeks",
    body: "I was skeptical but this face wash genuinely reduced my breakouts significantly. Skin feels fresh and clean without being dry. Great for oily skin types.",
    date: "11 Sep 2024", status: "approved", helpful: 56, images: 0, reply: null,
  },
  {
    id: 16, productName: "Himalaya Face Wash Neem 150ml", productImg: "🌿", category: "Beauty",
    reviewer: { name: "Deepika Rao", avatar: "DR", city: "Bangalore", hasPurchased: true },
    rating: 5, title: "My Holy Grail Cleanser",
    body: "Been using this for 6 months and my skin has never looked better. The neem formula is gentle yet effective. Absolutely love that it's affordable and widely available.",
    date: "30 Sep 2024", status: "approved", helpful: 38, images: 0, reply: "So happy to hear this, Deepika! Your skin's health is our priority!",
  },
  {
    id: 17, productName: "Instant Pot Duo 7-in-1", productImg: "🫕", category: "Kitchen",
    reviewer: { name: "Suresh Menon", avatar: "SM", city: "Kochi", hasPurchased: true },
    rating: 4, title: "Changed how I cook completely",
    body: "Makes perfectly cooked dal in 15 minutes. The sauté function is great for tempering. Slightly tricky to learn initially but the results are consistently excellent.",
    date: "17 Sep 2024", status: "pending", helpful: 20, images: 1, reply: null,
  },
  {
    id: 18, productName: "Titan Kairos Smartwatch", productImg: "⌚", category: "Electronics",
    reviewer: { name: "Amit Sharma", avatar: "AS", city: "Noida", hasPurchased: true },
    rating: 4, title: "Beautiful Indian design",
    body: "Love the fusion of traditional design with smart features. The health tracking is accurate and the AMOLED display is crisp. Battery lasts 5 days with AOD off.",
    date: "6 Oct 2024", status: "pending", helpful: 17, images: 2, reply: null,
  },
  {
    id: 19, productName: "IKEA POÄNG Armchair", productImg: "🪑", category: "Furniture",
    reviewer: { name: "Nalini Bose", avatar: "NB", city: "Kolkata", hasPurchased: true },
    rating: 5, title: "Elegant and incredibly comfortable",
    body: "The birch frame is sturdy and the cushion is plush without being too soft. Assembled in 20 minutes. It has become my favourite reading spot.",
    date: "24 Sep 2024", status: "rejected", helpful: 11, images: 1, reply: null,
  },
  {
    id: 20, productName: "Levi's 511 Slim Fit Jeans", productImg: "👖", category: "Fashion",
    reviewer: { name: "Tarun Bhatia", avatar: "TB", city: "Gurgaon", hasPurchased: true },
    rating: 5, title: "Perfect fit, premium denim",
    body: "The slim cut is flattering without being restrictive. Denim quality is top-notch — no fading after multiple washes. Sizing is accurate, refer to the chart.",
    date: "9 Oct 2024", status: "approved", helpful: 29, images: 0, reply: null,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, lineHeight: 1, color: i <= rating ? "#f59e0b" : "#d1d5db" }}>
          {i <= rating ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

const statusMeta: Record<ReviewStatus, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  pending:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  Icon: Clock        },
  approved: { label: "Approved", color: G,         bg: `${G}18`,                 Icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   Icon: XCircle      },
};

function StatusPill({ status }: { status: ReviewStatus }) {
  const m = statusMeta[status];
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: m.bg, color: m.color }}>
      <m.Icon size={10} /> {m.label}
    </span>
  );
}

function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  const colors = ["#3b82f6", "#ec4899", "#f59e0b", "#8b5cf6", "#10b981", "#f97316", G, "#ef4444"];
  const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
  return (
    <div className="rounded-full flex items-center justify-center text-white font-black shrink-0"
      style={{ width: size, height: size, background: colors[idx], fontSize: size * 0.34 }}>
      {initials}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  onApprove,
  onReject,
  onReply,
  onView,
}: {
  review: Review;
  onApprove: () => void;
  onReject: () => void;
  onReply: () => void;
  onView: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl leading-none">{review.productImg}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-black text-gray-500 uppercase tracking-wider truncate">
              {review.category}
            </p>
            <p className="text-sm font-bold text-gray-800 truncate">{review.productName}</p>
          </div>
        </div>
        <StatusPill status={review.status} />
      </div>

      {/* Rating + title */}
      <div className="px-5 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Stars rating={review.rating} />
          <span className="text-[11px] font-bold text-gray-500">{review.rating}/5</span>
        </div>
        <p className="text-sm font-bold text-gray-900">{review.title}</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{review.body}</p>
      </div>

      {/* Reviewer meta */}
      <div className="px-5 pb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-1.5">
          <Avatar initials={review.reviewer.avatar} size={22} />
          <span className="text-xs font-bold text-gray-700">{review.reviewer.name}</span>
        </div>
        <span className="text-[10px] text-gray-400">📍 {review.reviewer.city}</span>
        <span className="text-[10px] text-gray-400">· {review.date}</span>
        {review.reviewer.hasPurchased ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: `${G}15`, color: G }}>
            <ShieldCheck size={9} /> Verified Purchase
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400">
            ⚠ Unverified
          </span>
        )}
        {review.images > 0 && (
          <span className="text-[10px] text-gray-400">📷 {review.images} photo{review.images > 1 ? "s" : ""}</span>
        )}
        {review.helpful > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-400">
            <ThumbsUp size={9} /> {review.helpful} helpful
          </span>
        )}
      </div>

      {/* Admin reply preview */}
      {review.reply && (
        <div className="mx-5 mb-3 px-3 py-2 rounded-xl border-l-4 text-[11px] text-gray-600 leading-relaxed"
          style={{ borderColor: G, background: `${G}08` }}>
          <span className="font-black text-[10px] uppercase tracking-wider" style={{ color: G }}>Admin Reply · </span>
          <span className="line-clamp-1">{review.reply}</span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 mx-5" />

      {/* Actions */}
      <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
        {review.status === "pending" && (
          <>
            <button onClick={onApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black text-white transition-all hover:opacity-90"
              style={{ background: G }}>
              <CheckCircle2 size={11} /> Approve
            </button>
            <button onClick={onReject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black text-white bg-red-500 hover:bg-red-600 transition-all">
              <XCircle size={11} /> Reject
            </button>
          </>
        )}
        {review.status === "approved" && (
          <button onClick={onReject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black bg-red-50 text-red-500 hover:bg-red-100 transition-all">
            <XCircle size={11} /> Un-approve
          </button>
        )}
        {review.status === "rejected" && (
          <button onClick={onApprove}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all hover:opacity-90"
            style={{ background: `${G}15`, color: G }}>
            <CheckCircle2 size={11} /> Approve
          </button>
        )}
        <button onClick={onReply}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all ml-auto">
          <MessageSquare size={11} /> {review.reply ? "Edit Reply" : "Reply"}
        </button>
        <button onClick={onView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
          <Eye size={11} /> View
        </button>
      </div>
    </motion.div>
  );
}

function ReplyModal({
  open,
  review,
  onClose,
  onSave,
  onRemove,
}: {
  open: boolean;
  review: Review | null;
  onClose: () => void;
  onSave: (text: string) => void;
  onRemove: () => void;
}) {
  const [text, setText] = useState(review?.reply ?? "");
  React.useEffect(() => { setText(review?.reply ?? ""); }, [review]);

  if (!review) return null;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <MessageSquare size={15} className="text-blue-500" /> Admin Reply
              </h3>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Review summary */}
              <div className="rounded-xl border border-gray-100 p-3 bg-gray-50 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{review.productImg}</span>
                  <div>
                    <p className="text-xs font-black text-gray-700">{review.productName}</p>
                    <p className="text-[10px] text-gray-400">{review.category}</p>
                  </div>
                  <div className="ml-auto">
                    <Stars rating={review.rating} size={12} />
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-800">"{review.title}"</p>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{review.body}</p>
                <div className="flex items-center gap-2 pt-0.5">
                  <Avatar initials={review.reviewer.avatar} size={18} />
                  <span className="text-[11px] font-bold text-gray-600">{review.reviewer.name}</span>
                  <span className="text-[10px] text-gray-400">· {review.reviewer.city}</span>
                </div>
              </div>

              <Field label="Your Reply">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={4}
                  placeholder="Write a helpful, professional reply to this customer review..."
                  className={`${inp} resize-none`}
                />
              </Field>

              <div className="flex gap-3 pt-1">
                {review.reply && (
                  <button onClick={() => { onRemove(); onClose(); }}
                    className="px-4 py-2.5 rounded-xl border border-red-200 text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                    Remove Reply
                  </button>
                )}
                <button
                  disabled={!text.trim()}
                  onClick={() => { if (text.trim()) { onSave(text.trim()); onClose(); } }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: G }}>
                  Send Reply
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ViewModal({
  open,
  review,
  onClose,
  onApprove,
  onReject,
}: {
  open: boolean;
  review: Review | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (!review) return null;
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <Eye size={15} className="text-gray-400" /> Review Detail
              </h3>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Product row */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-3xl">{review.productImg}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900">{review.productName}</p>
                  <p className="text-[11px] text-gray-400 font-semibold">{review.category}</p>
                </div>
                <StatusPill status={review.status} />
              </div>

              {/* Rating + title */}
              <div>
                <Stars rating={review.rating} size={18} />
                <h2 className="text-base font-black text-gray-900 mt-2">{review.title}</h2>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.body}</p>
              </div>

              {/* Reviewer profile */}
              <div className="rounded-xl border border-gray-100 p-4 space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reviewer</p>
                <div className="flex items-center gap-3">
                  <Avatar initials={review.reviewer.avatar} size={40} />
                  <div>
                    <p className="text-sm font-black text-gray-800">{review.reviewer.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">📍 {review.reviewer.city} · {review.date}</p>
                  </div>
                  <div className="ml-auto">
                    {review.reviewer.hasPurchased ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: `${G}15`, color: G }}>
                        <ShieldCheck size={11} /> Verified Purchase
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-400">
                        ⚠ Unverified Buyer
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
                  {review.images > 0 && (
                    <span className="text-xs text-gray-500">📷 {review.images} attached photo{review.images > 1 ? "s" : ""}</span>
                  )}
                  {review.helpful > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <ThumbsUp size={11} /> {review.helpful} people found this helpful
                    </span>
                  )}
                </div>
              </div>

              {/* Admin reply if exists */}
              {review.reply && (
                <div className="rounded-xl p-4 border-l-4 space-y-1"
                  style={{ borderColor: G, background: `${G}08` }}>
                  <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: G }}>Admin Reply</p>
                  <p className="text-xs text-gray-700 leading-relaxed">{review.reply}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                {review.status !== "approved" && (
                  <button onClick={() => { onApprove(); onClose(); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
                    style={{ background: G }}>
                    <CheckCircle2 size={14} /> Approve
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button onClick={() => { onReject(); onClose(); }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 transition-all">
                    <XCircle size={14} /> Reject
                  </button>
                )}
                <button onClick={onClose}
                  className="ml-auto px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ProductReviewPage() {
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [replyTarget, setReplyTarget] = useState<number | null>(null);
  const [viewTarget, setViewTarget] = useState<number | null>(null);
  const [ratingOpen, setRatingOpen] = useState(false);

  // Mutations
  const approve = (id: number) => setReviews(r => r.map(x => x.id === id ? { ...x, status: "approved" } : x));
  const reject  = (id: number) => setReviews(r => r.map(x => x.id === id ? { ...x, status: "rejected" } : x));
  const addReply = (id: number, text: string) =>
    setReviews(r => r.map(x => x.id === id ? { ...x, reply: text } : x));
  const removeReply = (id: number) =>
    setReviews(r => r.map(x => x.id === id ? { ...x, reply: null } : x));

  // Stats
  const total     = reviews.length;
  const pending   = reviews.filter(r => r.status === "pending").length;
  const approved  = reviews.filter(r => r.status === "approved").length;
  const rejected  = reviews.filter(r => r.status === "rejected").length;
  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
  const verifiedPct = Math.round((reviews.filter(r => r.reviewer.hasPurchased).length / total) * 100);

  // Filter
  const filtered = reviews.filter(r => {
    const q = search.toLowerCase();
    if (q && !r.productName.toLowerCase().includes(q) &&
             !r.reviewer.name.toLowerCase().includes(q) &&
             !r.title.toLowerCase().includes(q)) return false;
    if (statusTab !== "all" && r.status !== statusTab) return false;
    if (ratingFilter && r.rating !== ratingFilter) return false;
    if (verifiedOnly && !r.reviewer.hasPurchased) return false;
    return true;
  });

  const replyReview = reviews.find(r => r.id === replyTarget) ?? null;
  const viewReview  = reviews.find(r => r.id === viewTarget)  ?? null;

  const tabs: Array<{ key: "all" | "pending" | "approved" | "rejected"; label: string; count: number }> = [
    { key: "all",      label: "All",      count: total    },
    { key: "pending",  label: "Pending",  count: pending  },
    { key: "approved", label: "Approved", count: approved },
    { key: "rejected", label: "Rejected", count: rejected },
  ];

  const tabColor: Record<string, string> = {
    all: "#3b82f6", pending: "#f59e0b", approved: G, rejected: "#ef4444",
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <PageHeader
        breadcrumb="Products › Product Reviews"
        title="Product Reviews"
        subtitle="Manage customer reviews across all products"
        count={total}
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews",       val: total,          color: "#3b82f6", Icon: MessageSquare },
          { label: "Pending Approval",     val: pending,        color: "#f59e0b", Icon: Clock        },
          { label: "Avg. Rating",          val: `${avgRating} ★`, color: G,       Icon: Star         },
          { label: "Verified Purchases",   val: `${verifiedPct}%`, color: "#8b5cf6", Icon: ShieldCheck },
        ].map(s => (
          <div key={s.label} className={`${card} p-4 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}15`, color: s.color }}>
              <s.Icon size={17} />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{s.val}</p>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
            {s.label === "Pending Approval" && pending > 0 && (
              <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white"
                style={{ background: "#f59e0b" }}>{pending}</span>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Top row: search + rating + verified */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search product, reviewer, or review title…"
              className="w-full bg-white border border-gray-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all"
            />
          </div>

          {/* Rating dropdown */}
          <div className="relative">
            <button
              onClick={() => setRatingOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:border-gray-300 transition-all">
              {ratingFilter === 0 ? (
                <><Star size={12} className="text-amber-400" /> All Ratings</>
              ) : (
                <><Stars rating={ratingFilter} size={11} /> {ratingFilter}★ only</>
              )}
              <ChevronDown size={12} className={`transition-transform ${ratingOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {ratingOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-1.5 left-0 z-50 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden min-w-[160px]">
                  {[0, 5, 4, 3, 2, 1].map(v => (
                    <button key={v}
                      onClick={() => { setRatingFilter(v); setRatingOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-bold transition-colors hover:bg-gray-50 ${ratingFilter === v ? "text-gray-900 bg-gray-50" : "text-gray-600"}`}>
                      {v === 0 ? (
                        <><Star size={11} className="text-amber-400" /> All Ratings</>
                      ) : (
                        <><Stars rating={v} size={11} /> {v} star{v !== 1 ? "s" : ""}</>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Verified toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Toggle checked={verifiedOnly} onChange={() => setVerifiedOnly(v => !v)} />
            <span className="text-xs font-bold text-gray-600">Verified only</span>
          </label>

          {/* Clear filters */}
          {(search || statusTab !== "all" || ratingFilter || verifiedOnly) && (
            <button
              onClick={() => { setSearch(""); setStatusTab("all"); setRatingFilter(0); setVerifiedOnly(false); }}
              className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
              <X size={11} /> Clear filters
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.key}
              onClick={() => setStatusTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={statusTab === t.key
                ? { background: "white", color: tabColor[t.key], boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
                : { color: "#6b7280" }}>
              {t.label}
              <span className="inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black min-w-[18px]"
                style={statusTab === t.key
                  ? { background: `${tabColor[t.key]}15`, color: tabColor[t.key] }
                  : { background: "#e5e7eb", color: "#6b7280" }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Review cards */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-base font-black text-gray-700">No reviews match your filters</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">Try adjusting the search, status tab, or rating filter to find what you're looking for.</p>
            <button
              onClick={() => { setSearch(""); setStatusTab("all"); setRatingFilter(0); setVerifiedOnly(false); }}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: G }}>
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map(r => (
              <ReviewCard
                key={r.id}
                review={r}
                onApprove={() => approve(r.id)}
                onReject={() => reject(r.id)}
                onReply={() => setReplyTarget(r.id)}
                onView={() => setViewTarget(r.id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Results count */}
      {filtered.length > 0 && (
        <p className="text-[11px] text-gray-400 text-center">
          Showing <span className="font-bold text-gray-600">{filtered.length}</span> of {total} reviews
        </p>
      )}

      {/* Reply modal */}
      <ReplyModal
        open={replyTarget !== null}
        review={replyReview}
        onClose={() => setReplyTarget(null)}
        onSave={text => replyTarget !== null && addReply(replyTarget, text)}
        onRemove={() => replyTarget !== null && removeReply(replyTarget)}
      />

      {/* View modal */}
      <ViewModal
        open={viewTarget !== null}
        review={viewReview}
        onClose={() => setViewTarget(null)}
        onApprove={() => viewTarget !== null && approve(viewTarget)}
        onReject={() => viewTarget !== null && reject(viewTarget)}
      />
    </div>
  );
}

export default ProductReviewPage;
