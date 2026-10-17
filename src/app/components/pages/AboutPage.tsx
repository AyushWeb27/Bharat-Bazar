import { motion } from "motion/react";
import { Users, Store, Package, MapPin, Target, Eye, CheckCircle } from "lucide-react";
import { G, GD } from "../data/index";

const STATS = [
  { value: "5 Crore+", label: "Customers", icon: Users, color: "#009966" },
  { value: "2 Lakh+", label: "Sellers", icon: Store, color: "#f59e0b" },
  { value: "1 Crore+", label: "Products", icon: Package, color: "#0ea5e9" },
  { value: "28", label: "States Covered", icon: MapPin, color: "#ec4899" },
];

const TIMELINE = [
  { year: "2018", title: "Founded", desc: "BharatBazar launched with a vision to digitise India's local markets." },
  { year: "2019", title: "1 Lakh Sellers", desc: "Reached our first milestone of 1 lakh registered sellers across 10 states." },
  { year: "2021", title: "Series B Funding", desc: "Raised ₹450 Crore in Series B. Expanded to 22 states and 8 languages." },
  { year: "2023", title: "5 Crore Customers", desc: "Crossed 5 Crore active customers. Launched BharatBazar Pay — our UPI wallet." },
  { year: "2026", title: "AI-Powered Commerce", desc: "Introduced vernacular AI assistant supporting 12 Indian languages for seamless shopping." },
];

const TEAM = [
  { initials: "AV", name: "Arun Verma", role: "Chief Executive Officer", bio: "IIT Delhi & Wharton alum. Previously VP at Flipkart. Passionate about India's digital economy.", color: G },
  { initials: "SP", name: "Sunita Pillai", role: "Chief Technology Officer", bio: "Ex-Google India engineering lead. Architect of BharatBazar's multilingual AI platform.", color: "#0ea5e9" },
  { initials: "RM", name: "Rajesh Mehta", role: "Chief Operating Officer", bio: "20 years in supply chain & logistics. Former MD at Blue Dart. Scaled ops to 28 states.", color: "#f59e0b" },
];

const VALUES = [
  { icon: "🤝", title: "Trust", desc: "Every transaction backed by BharatBazar's buyer protection guarantee." },
  { icon: "⭐", title: "Quality", desc: "Rigorous seller onboarding and product authenticity checks." },
  { icon: "🗣️", title: "Vernacular", desc: "Shop, pay and get support in your mother tongue — 12 languages." },
  { icon: "💡", title: "Innovation", desc: "AI-driven discovery, personalisation and voice search for all Indians." },
  { icon: "🌱", title: "Community", desc: "Empowering local artisans, weavers and MSMEs to reach national customers." },
  { icon: "♻️", title: "Sustainability", desc: "Carbon-neutral deliveries by 2028. Eco packaging for all shipments." },
];

const MEDIA = ["Economic Times", "YourStory", "Inc42", "The Hindu"];

export function AboutPage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden text-white py-16 px-6 text-center relative"
        style={{ background: `linear-gradient(135deg, ${GD} 0%, ${G} 60%, #00cc88 100%)` }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-black mb-4 leading-tight"
          >
            Made in India.<br />Made for India. 🇮🇳
          </motion.div>
          <p className="text-white/80 text-lg md:text-xl font-semibold max-w-2xl mx-auto">
            India's largest vernacular marketplace — bringing every corner of Bharat online.
          </p>
        </div>
      </motion.section>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { icon: Target, title: "Our Mission", color: G, text: "To democratise commerce for 1.4 billion Indians by making online shopping accessible in every language, every PIN code, and every budget — from metro cities to the smallest village." },
          { icon: Eye, title: "Our Vision", color: "#0ea5e9", text: "A Bharat where every kirana owner, every weaver, every farmer and every artisan can sell to the world — and every customer shops with full trust, in their own language." },
        ].map(({ icon: Icon, title, color, text }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-8"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${color}20` }}>
              <Icon size={22} style={{ color }} />
            </div>
            <h3 className="text-xl font-black text-foreground mb-3">{title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{text}</p>
          </motion.div>
        ))}
      </section>

      {/* Stats */}
      <section>
        <h2 className="text-2xl font-black text-foreground mb-8 text-center">BharatBazar by Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-3xl p-6 text-center"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${color}18` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-2xl font-black text-foreground mb-1">{value}</div>
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Journey / Timeline */}
      <section>
        <h2 className="text-2xl font-black text-foreground mb-10 text-center">Our Journey</h2>
        <div className="relative max-w-2xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-border" />
          <div className="space-y-8">
            {TIMELINE.map(({ year, title, desc }, i) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 relative"
              >
                <div className="w-11 h-11 rounded-full border-4 flex items-center justify-center text-xs font-black text-white shrink-0 z-10"
                  style={{ background: G, borderColor: "white" }}>
                  {year.slice(2)}
                </div>
                <div className="bg-card border border-border rounded-2xl p-4 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-muted-foreground">{year}</span>
                    <span className="text-sm font-black text-foreground">{title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section>
        <h2 className="text-2xl font-black text-foreground mb-8 text-center">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEAM.map(({ initials, name, role, bio, color }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-3xl p-6 text-center"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-black mx-auto mb-4"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                {initials}
              </div>
              <h3 className="font-black text-foreground text-base mb-0.5">{name}</h3>
              <p className="text-xs font-bold mb-3" style={{ color }}>{role}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section>
        <h2 className="text-2xl font-black text-foreground mb-8 text-center">Our Values</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {VALUES.map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="font-black text-foreground text-sm mb-1.5">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Media Coverage */}
      <section>
        <h2 className="text-2xl font-black text-foreground mb-8 text-center">As Seen In</h2>
        <div className="flex flex-wrap justify-center gap-4">
          {MEDIA.map((outlet) => (
            <div
              key={outlet}
              className="bg-card border border-border rounded-2xl px-6 py-4 font-black text-foreground text-sm hover:border-[#009966] transition-colors cursor-default"
            >
              {outlet}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center bg-card border border-border rounded-3xl p-10"
      >
        <div className="text-4xl mb-4">🏪</div>
        <h2 className="text-2xl font-black text-foreground mb-3">Grow your business with BharatBazar</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-lg mx-auto">
          Join 2 lakh+ sellers across India. Free registration, zero listing fees for the first 3 months, and dedicated seller support.
        </p>
        <motion.button
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="px-8 py-3.5 rounded-2xl text-white font-black text-sm inline-flex items-center gap-2"
          style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
        >
          <CheckCircle size={16} /> Join Us as a Seller
        </motion.button>
      </motion.section>
    </div>
  );
}
