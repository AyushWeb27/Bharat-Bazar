import { useState } from "react";
import { motion } from "motion/react";
import { Download } from "lucide-react";
import { G, GD } from "../data/index";

const SECTIONS = [
  { id: "collect", title: "1. Information We Collect" },
  { id: "use", title: "2. How We Use Your Data" },
  { id: "sharing", title: "3. Data Sharing" },
  { id: "cookies", title: "4. Cookies & Tracking" },
  { id: "rights", title: "5. Your Rights (DPDP 2023)" },
  { id: "security", title: "6. Data Security" },
  { id: "dpo", title: "7. Contact Our DPO" },
];

export function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("collect");

  function scrollTo(id: string) {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last updated: October 5, 2026</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              BharatBazar is committed to protecting your personal data in compliance with the{" "}
              <strong className="text-foreground">Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and other applicable Indian laws.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white font-bold text-sm shrink-0"
            style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}
            onClick={() => alert("Privacy Policy PDF download starting...")}
          >
            <Download size={15} /> Download PDF
          </motion.button>
        </div>

        {/* DPDP Badge */}
        <div className="mt-4 inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2">
          <span className="text-lg">🇮🇳</span>
          <span className="text-xs font-bold text-green-700 dark:text-green-400">DPDP Act 2023 Compliant — We respect your data rights as an Indian citizen.</span>
        </div>
      </motion.div>

      <div className="flex gap-8 items-start">
        {/* Sticky Left Nav */}
        <aside className="hidden lg:block w-60 shrink-0 sticky top-6">
          <div className="bg-card border border-border rounded-2xl p-4">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Contents</p>
            <nav className="space-y-0.5">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${activeSection === s.id ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                  style={activeSection === s.id ? { background: G } : {}}
                >
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 space-y-10 min-w-0">
          <PrivSection id="collect" title="1. Information We Collect" onView={setActiveSection}>
            <p>We collect personal data that you provide directly, data generated through your use of our services, and data from third parties. Categories include:</p>
            <ul>
              <li><strong>Identity Data:</strong> Name, date of birth, gender, government-issued ID for KYC verification.</li>
              <li><strong>Contact Data:</strong> Email address, mobile number, delivery addresses.</li>
              <li><strong>Financial Data:</strong> Payment method details (tokenised), transaction history, refund data. We do not store full card numbers.</li>
              <li><strong>Behavioural Data:</strong> Browsing history on the Platform, search queries, wishlist and cart data, product views.</li>
              <li><strong>Device Data:</strong> IP address, device type, operating system, browser type, app version.</li>
              <li><strong>Location Data:</strong> Approximate location for delivery serviceability and fraud prevention (with your permission).</li>
              <li><strong>Communications:</strong> Messages to customer support, reviews and ratings you submit.</li>
            </ul>
          </PrivSection>

          <PrivSection id="use" title="2. How We Use Your Data" onView={setActiveSection}>
            <p>Under the DPDP Act 2023, we process your personal data only for specified, lawful purposes with your consent or legitimate interest. Purposes include:</p>
            <ul>
              <li><strong>Order fulfilment:</strong> Processing, dispatching, delivering and tracking your orders.</li>
              <li><strong>Personalisation:</strong> Recommending products, offers, and content tailored to your preferences.</li>
              <li><strong>Communication:</strong> Sending order updates, promotional offers, and service notifications (opt-out available).</li>
              <li><strong>Fraud prevention:</strong> Detecting and preventing fraudulent transactions and account misuse.</li>
              <li><strong>Legal compliance:</strong> Meeting obligations under GST, consumer protection, and other Indian laws.</li>
              <li><strong>Analytics:</strong> Understanding user behaviour to improve our Platform (using aggregated, anonymised data).</li>
            </ul>
          </PrivSection>

          <PrivSection id="sharing" title="3. Data Sharing" onView={setActiveSection}>
            <p>BharatBazar does not sell your personal data. We share data only in the following circumstances:</p>
            <ul>
              <li><strong>Sellers:</strong> Your name, delivery address, and order details are shared with the relevant seller to fulfil your order.</li>
              <li><strong>Logistics partners:</strong> Delivery name, address, and phone number are shared with our logistics partners (e.g., Blue Dart, Delhivery, DTDC).</li>
              <li><strong>Payment processors:</strong> Payment data is processed by PCI DSS-compliant gateways. We share only necessary transaction data.</li>
              <li><strong>Legal authorities:</strong> We may disclose data when required by law, court order, or regulatory authority in India.</li>
              <li><strong>Business transfers:</strong> In the event of a merger or acquisition, data may be transferred subject to the same privacy protections.</li>
            </ul>
            <p>We require all third parties to respect your data and process it only as instructed under data processing agreements.</p>
          </PrivSection>

          <PrivSection id="cookies" title="4. Cookies & Tracking" onView={setActiveSection}>
            <p>BharatBazar uses cookies and similar tracking technologies to enhance your experience. Types used:</p>
            <ul>
              <li><strong>Essential cookies:</strong> Required for Platform functionality (login sessions, cart data). Cannot be disabled.</li>
              <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with the Platform (e.g., Google Analytics).</li>
              <li><strong>Marketing cookies:</strong> Enable personalised advertising on third-party platforms.</li>
              <li><strong>Personalisation cookies:</strong> Remember your preferences such as language, region, and recently viewed items.</li>
            </ul>
            <p>You can manage cookie preferences via our Cookie Consent banner or your browser settings. Note that disabling certain cookies may affect Platform functionality.</p>
          </PrivSection>

          <PrivSection id="rights" title="5. Your Rights (DPDP 2023)" onView={setActiveSection}>
            <p>Under the Digital Personal Data Protection Act, 2023, you have the following rights as a Data Principal:</p>
            <ul>
              <li><strong>Right to Access:</strong> Request a summary of personal data we hold about you and how it is being processed.</li>
              <li><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete personal data.</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
              <li><strong>Right to Grievance Redressal:</strong> Lodge a complaint with our Data Protection Officer or the Data Protection Board of India.</li>
              <li><strong>Right to Nominate:</strong> Nominate another individual to exercise your rights in the event of death or incapacity.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for non-essential data processing at any time via Account Settings.</li>
            </ul>
            <p>To exercise these rights, email <strong>dpo@bharatbazar.in</strong> or write to our Data Protection Officer. We will respond within 30 days.</p>
          </PrivSection>

          <PrivSection id="security" title="6. Data Security" onView={setActiveSection}>
            <p>6.1 BharatBazar implements industry-standard security measures including 256-bit TLS encryption for data in transit, AES-256 encryption for data at rest, and regular security audits.</p>
            <p>6.2 Access to personal data is restricted to authorised personnel on a need-to-know basis. All employees with data access undergo mandatory data protection training.</p>
            <p>6.3 We retain your personal data only for as long as necessary for the purposes outlined in this policy, or as required by applicable Indian law (typically 7 years for financial records as per the Income Tax Act).</p>
            <p>6.4 In the event of a data breach that is likely to result in high risk to your rights, we will notify the Data Protection Board and affected users as required under DPDP Act 2023.</p>
          </PrivSection>

          <PrivSection id="dpo" title="7. Contact Our DPO" onView={setActiveSection}>
            <p>BharatBazar has appointed a Data Protection Officer (DPO) as required under the DPDP Act, 2023.</p>
            <div className="bg-muted rounded-2xl p-5 my-3 not-prose">
              <p className="font-black text-foreground text-sm mb-1">Data Protection Officer</p>
              <p className="text-sm text-muted-foreground">BharatBazar Private Limited</p>
              <p className="text-sm text-muted-foreground">5th Floor, WeWork, BKC, Mumbai 400051</p>
              <p className="text-sm font-semibold mt-2" style={{ color: G }}>dpo@bharatbazar.in</p>
            </div>
            <p>You may also raise a grievance with the <strong>Data Protection Board of India</strong> at{" "}
              <span className="font-semibold" style={{ color: G }}>dpboard.gov.in</span> if you are unsatisfied with our response.</p>
          </PrivSection>

          <div className="bg-muted rounded-2xl p-5 text-xs text-muted-foreground">
            <p className="font-bold text-foreground mb-1">Policy Updates</p>
            <p>We may update this Privacy Policy periodically. The "Last Updated" date at the top reflects the most recent revision. Continued use of BharatBazar after changes constitutes acceptance of the updated policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrivSection({
  id, title, children, onView,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  onView: (id: string) => void;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onViewportEnter={() => onView(id)}
      viewport={{ amount: 0.3 }}
      className="scroll-mt-6"
    >
      <h2 className="text-lg font-black text-foreground mb-4 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed [&_p]:text-muted-foreground [&_ul]:space-y-2 [&_ul]:pl-4 [&_li]:text-muted-foreground [&_li]:list-disc">
        {children}
      </div>
    </motion.section>
  );
}
