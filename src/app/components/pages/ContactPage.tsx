import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Phone, Mail, MapPin, MessageCircle, Clock, ChevronRight,
  Facebook, Twitter, Instagram, Youtube, Send, CheckCircle, Paperclip,
} from "lucide-react";
import { G, GD } from "../data/index";

const SUBJECTS = ["Order Issue", "Product Query", "Seller Enquiry", "Partnership", "Other"];

const FAQ_LINKS = [
  "How do I track my order?",
  "What is the return & refund policy?",
  "How do I cancel an order?",
  "How do I become a seller on BharatBazar?",
  "Is Cash on Delivery available?",
];

const SOCIALS = [
  { icon: Facebook, label: "Facebook", color: "#1877f2" },
  { icon: Twitter, label: "Twitter / X", color: "#000" },
  { icon: Instagram, label: "Instagram", color: "#e1306c" },
  { icon: Youtube, label: "YouTube", color: "#ff0000" },
];

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-black text-foreground mb-3"
        >
          Get in Touch 👋
        </motion.h1>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          We're here to help! Reach out for orders, seller enquiries, partnerships or just to say hello.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border rounded-3xl p-6 md:p-8"
        >
          <h2 className="text-lg font-black text-foreground mb-6">Send us a message</h2>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${G}20` }}
                >
                  <CheckCircle size={32} style={{ color: G }} />
                </motion.div>
                <h3 className="text-xl font-black text-foreground mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Thank you for reaching out. Our team will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                  className="text-sm font-bold hover:underline"
                  style={{ color: G }}
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider block mb-1.5">Full Name *</label>
                    <input
                      name="name" value={form.name} onChange={handleChange} required
                      placeholder="Priya Sharma"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#009966] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider block mb-1.5">Email *</label>
                    <input
                      name="email" type="email" value={form.email} onChange={handleChange} required
                      placeholder="priya@example.com"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#009966] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider block mb-1.5">Phone</label>
                    <input
                      name="phone" type="tel" value={form.phone} onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#009966] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider block mb-1.5">Subject *</label>
                    <select
                      name="subject" value={form.subject} onChange={handleChange} required
                      className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-[#009966] transition-colors"
                    >
                      <option value="">Select a subject...</option>
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-foreground uppercase tracking-wider block mb-1.5">Message *</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange} required rows={5}
                    placeholder="Tell us how we can help you..."
                    className="w-full bg-muted border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#009966] transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                    <input type="file" className="sr-only" />
                    <Paperclip size={14} />
                    Attach a file (optional)
                  </label>
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.96 }}
                  disabled={loading}
                  className="w-full py-3 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                    />
                  ) : (
                    <><Send size={15} /> Send Message</>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-5"
        >
          {/* Contact Cards */}
          {[
            { icon: Phone, label: "Toll Free", value: "1800-123-4567", sub: "Available 24/7 for urgent issues", color: G },
            { icon: Mail, label: "Email Support", value: "support@bharatbazar.in", sub: "Reply within 24 hours", color: "#0ea5e9" },
            { icon: MapPin, label: "Head Office", value: "BharatBazar Pvt Ltd", sub: "5th Floor, WeWork, BKC, Mumbai 400051", color: "#f59e0b" },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-sm font-black text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}

          {/* Live Chat */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="w-full py-3 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
          >
            <MessageCircle size={16} /> Start Live Chat
          </motion.button>

          {/* Office Hours */}
          <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#6366f118" }}>
              <Clock size={18} style={{ color: "#6366f1" }} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Office Hours</p>
              <p className="text-sm font-bold text-foreground">Mon – Sat: 9:00 AM – 7:00 PM IST</p>
              <p className="text-xs text-muted-foreground">Sundays: 10:00 AM – 4:00 PM IST</p>
              <p className="text-xs text-muted-foreground mt-1">Customer support available 24/7 via chat & phone.</p>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="bg-muted border border-border rounded-2xl h-44 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <div className="text-4xl">📍</div>
            <p className="text-sm font-semibold">WeWork, BKC, Mumbai</p>
            <p className="text-xs">Map view not available in preview</p>
          </div>
        </motion.div>
      </div>

      {/* FAQ Quick Links */}
      <section>
        <h2 className="text-xl font-black text-foreground mb-5">Quick Answers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FAQ_LINKS.map((q) => (
            <button
              key={q}
              className="flex items-center justify-between bg-card border border-border rounded-2xl px-5 py-3.5 text-left text-sm font-semibold text-foreground hover:border-[#009966] hover:text-[#009966] transition-colors group"
            >
              <span>{q}</span>
              <ChevronRight size={16} className="text-muted-foreground group-hover:text-[#009966] shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Social Media */}
      <section>
        <h2 className="text-xl font-black text-foreground mb-5">Follow Us</h2>
        <div className="flex flex-wrap gap-3">
          {SOCIALS.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className="flex items-center gap-2.5 bg-card border border-border rounded-2xl px-4 py-2.5 text-sm font-bold text-foreground hover:border-current transition-colors"
              style={{ "--tw-border-opacity": 1 } as React.CSSProperties}
            >
              <Icon size={16} style={{ color }} />
              {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
