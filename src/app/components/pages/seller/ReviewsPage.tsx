import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ThumbsUp, ChevronDown, ChevronUp, Send, CheckCircle } from "lucide-react";
import { S, card, inp } from "./shared/constants";

/* ─── Data ───────────────────────────────────────────────────────────────── */
interface Review {
  id: number;
  customer: string;
  product: string;
  rating: number;
  review: string;
  date: string;
  replied: boolean;
  helpful: number;
}

const REVIEWS: Review[] = [
  { id: 1,  customer: "Priya S.",     product: "Samsung A55",    rating: 5, review: "Excellent product! Fast delivery and perfect packaging. Highly recommend this seller.",             date: "Sep 3, 2026",  replied: false, helpful: 24 },
  { id: 2,  customer: "Rahul G.",     product: "Boat Airdopes",  rating: 5, review: "Great sound quality for the price. Seller was very responsive to my queries.",                     date: "Sep 2, 2026",  replied: true,  helpful: 18 },
  { id: 3,  customer: "Anita K.",     product: "OnePlus Nord",   rating: 4, review: "Good phone, delivery was a bit delayed but seller kept me updated throughout.",                   date: "Sep 1, 2026",  replied: false, helpful: 12 },
  { id: 4,  customer: "Vikram P.",    product: "JBL Speaker",    rating: 5, review: "Best JBL deal I found online. Original product with all accessories included.",                   date: "Aug 31, 2026", replied: true,  helpful: 31 },
  { id: 5,  customer: "Neha J.",      product: "Apple Watch",    rating: 3, review: "Product is good but took longer than expected. Packaging was slightly damaged.",                  date: "Aug 30, 2026", replied: false, helpful: 8  },
  { id: 6,  customer: "Arjun M.",     product: "Mi Band 8",      rating: 5, review: "Exactly as described. Quick delivery. Will definitely order again from this seller.",            date: "Aug 29, 2026", replied: true,  helpful: 15 },
  { id: 7,  customer: "Deepa N.",     product: "Sony WH1000",    rating: 4, review: "Premium headphones at a competitive price. Authentic product with warranty card.",                date: "Aug 28, 2026", replied: false, helpful: 22 },
  { id: 8,  customer: "Suresh R.",    product: "HP Laptop",      rating: 5, review: "Superb laptop and the seller provided all the necessary bills and warranty documents.",           date: "Aug 27, 2026", replied: true,  helpful: 28 },
  { id: 9,  customer: "Kavitha I.",   product: "Redmi Note 13",  rating: 4, review: "Good phone, minor scratch on back panel but seller offered compensation quickly.",               date: "Aug 26, 2026", replied: true,  helpful: 19 },
  { id: 10, customer: "Mohan D.",     product: "Noise ColorFit", rating: 2, review: "Stopped working after 10 days. Seller arranged replacement but process was slow.",               date: "Aug 25, 2026", replied: true,  helpful: 6  },
  { id: 11, customer: "Sunita V.",    product: "Lenovo Laptop",  rating: 5, review: "Outstanding service! Got the laptop same day. Seller even helped with initial setup.",           date: "Aug 24, 2026", replied: false, helpful: 33 },
  { id: 12, customer: "Ravi K.",      product: "iQOO Z9 Lite",   rating: 3, review: "Phone is okay but expected better performance. Seller responded to all my questions.",           date: "Aug 23, 2026", replied: false, helpful: 9  },
];

const RATING_DIST = [
  { star: 5, pct: 68 },
  { star: 4, pct: 19 },
  { star: 3, pct: 8  },
  { star: 2, pct: 3  },
  { star: 1, pct: 2  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function avatarColor(rating: number) {
  if (rating === 5)          return { bg: "#dcfce7", color: "#16a34a" };
  if (rating === 4)          return { bg: S + "18",  color: S };
  if (rating === 3)          return { bg: "#fef9c3", color: "#ca8a04" };
  return                            { bg: "#fee2e2", color: "#dc2626" };
}

function StarRow({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < rating ? "#f59e0b" : "none"}
          color={i < rating ? "#f59e0b" : "#d1d5db"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

/* ─── Review card ────────────────────────────────────────────────────────── */
function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replied, setReplied] = useState(review.replied);
  const [submitting, setSubmitting] = useState(false);

  const longText = review.review.length > 120;
  const displayText = longText && !expanded ? review.review.slice(0, 120) + "…" : review.review;
  const av = avatarColor(review.rating);

  function handleReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setReplied(true);
      setReplyOpen(false);
      setSubmitting(false);
    }, 600);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${card} p-5`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: av.bg, color: av.color }}
        >
          {review.customer.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{review.customer}</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity"
              style={{ borderColor: S + "60", color: S, background: S + "0e" }}
            >
              {review.product}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <StarRow rating={review.rating} />
            <span className="text-xs text-gray-400">{review.date}</span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed">
            {displayText}
            {longText && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 text-indigo-500 text-xs font-medium hover:underline"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </p>

          {/* Footer row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <ThumbsUp size={12} />
              {review.helpful} people found this helpful
            </span>

            {replied ? (
              <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle size={13} />
                Replied
                <button
                  onClick={() => setReplyOpen(!replyOpen)}
                  className="ml-1 text-indigo-500 hover:underline"
                >
                  {replyOpen ? "Hide" : "View reply"}
                </button>
              </span>
            ) : (
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: S, background: S + "12" }}
              >
                <Send size={11} />
                Reply
              </button>
            )}
          </div>

          {/* Reply area */}
          <AnimatePresence>
            {replyOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 p-3 rounded-xl bg-gray-50 space-y-2">
                  {replied ? (
                    <p className="text-sm text-gray-600 italic">
                      "Thank you for your feedback! We're glad you had a great experience. Looking forward to serving you again."
                    </p>
                  ) : (
                    <>
                      <textarea
                        className={`${inp} resize-none`}
                        rows={3}
                        placeholder="Write your reply to this review…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleReply}
                          disabled={submitting || !replyText.trim()}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity disabled:opacity-50"
                          style={{ background: S }}
                        >
                          <Send size={11} />
                          {submitting ? "Sending…" : "Send Reply"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export function SellerReviewsPage() {
  const [filter, setFilter] = useState<"all" | "5" | "4" | "3" | "2" | "1" | "pending">("all");

  const filtered = REVIEWS.filter((r) => {
    if (filter === "all")     return true;
    if (filter === "pending") return !r.replied;
    return r.rating === Number(filter);
  });

  const filterTabs: { key: typeof filter; label: string }[] = [
    { key: "all",     label: "All Reviews"   },
    { key: "5",       label: "5★"            },
    { key: "4",       label: "4★"            },
    { key: "3",       label: "3★"            },
    { key: "2",       label: "2★"            },
    { key: "1",       label: "1★"            },
    { key: "pending", label: "Pending Reply" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-0.5">Customer ratings and feedback for your store</p>
        </div>

        {/* Rating summary */}
        <div className={`${card} p-6`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Big rating */}
            <div className="text-center sm:pr-6 sm:border-r sm:border-gray-100">
              <p className="text-5xl font-black text-gray-900">4.7</p>
              <StarRow rating={5} size={18} />
              <p className="text-xs text-gray-400 mt-1">284 reviews</p>
            </div>

            {/* Bars */}
            <div className="flex-1 space-y-2 w-full sm:w-auto">
              {RATING_DIST.map((d) => (
                <div key={d.star} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-5 text-right flex-shrink-0">{d.star}★</span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${d.pct}%` }}
                      transition={{ delay: 0.1 + d.star * 0.05, duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: d.star >= 4 ? "#f59e0b" : d.star === 3 ? "#d1d5db" : "#ef4444" }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 flex-shrink-0">{d.pct}%</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:pl-4">
              {[
                { label: "Total Reviews", value: "284" },
                { label: "Avg Rating",    value: "4.7" },
                { label: "Positive",      value: "94%" },
                { label: "Pending Reply", value: "12"  },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                filter === t.key
                  ? { background: S, color: "#fff" }
                  : { background: "#fff", color: "#6b7280", border: "1px solid #e5e7eb" }
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className={`${card} p-10 text-center`}>
              <p className="text-gray-400 text-sm">No reviews in this category</p>
            </div>
          ) : (
            filtered.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      </div>
    </div>
  );
}
