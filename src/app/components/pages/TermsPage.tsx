import { useState } from "react";
import { motion } from "motion/react";
import { G } from "../data/index";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "accounts", title: "2. User Accounts" },
  { id: "products", title: "3. Products and Pricing" },
  { id: "orders", title: "4. Orders and Payments" },
  { id: "shipping", title: "5. Shipping and Delivery" },
  { id: "returns", title: "6. Returns and Refunds" },
  { id: "seller", title: "7. Seller Policies" },
  { id: "ip", title: "8. Intellectual Property" },
  { id: "privacy", title: "9. Privacy" },
  { id: "governing", title: "10. Governing Law" },
];

export function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

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
        <h1 className="text-3xl font-black text-foreground mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground">Last updated: October 5, 2026</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Please read these Terms and Conditions carefully before using the BharatBazar platform. By accessing or using our services, you agree to be bound by these terms.
        </p>
      </motion.div>

      <div className="flex gap-8 items-start">
        {/* Sticky Left Nav (desktop) */}
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
          <Section id="acceptance" title="1. Acceptance of Terms" onView={setActiveSection}>
            <p>By accessing or using BharatBazar.in (the "Platform"), you ("User") agree to these Terms and Conditions ("Terms") and our Privacy Policy. If you do not agree, please discontinue use immediately.</p>
            <p>1.1 These Terms constitute a legally binding agreement between you and BharatBazar Private Limited, a company incorporated under the Companies Act, 2013, having its registered office at 5th Floor, WeWork, Bandra Kurla Complex, Mumbai 400051, Maharashtra, India.</p>
            <p>1.2 BharatBazar reserves the right to amend these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the revised Terms. Material changes will be communicated via email or platform notification.</p>
            <p>1.3 These Terms apply to all visitors, users and others who access or use the Platform, including registered buyers, sellers, and guest users.</p>
          </Section>

          <Section id="accounts" title="2. User Accounts" onView={setActiveSection}>
            <p>2.1 To access certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process.</p>
            <p>2.2 You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
            <p>2.3 You must be at least 18 years of age to create an account and make purchases on BharatBazar. By registering, you represent and warrant that you meet this requirement.</p>
            <p>2.4 BharatBazar reserves the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or harm other users or the Platform.</p>
            <p>2.5 You may not create multiple accounts or use another person's account without their express permission.</p>
          </Section>

          <Section id="products" title="3. Products and Pricing" onView={setActiveSection}>
            <p>3.1 BharatBazar is a marketplace platform. Products listed on the Platform are sold by independent third-party sellers. BharatBazar does not own or warehouse most products unless specifically stated.</p>
            <p>3.2 All prices displayed are in Indian Rupees (INR) and are inclusive of applicable Goods and Services Tax (GST) unless otherwise stated.</p>
            <p>3.3 Prices may change at any time without prior notice. BharatBazar is not responsible for typographical errors in pricing. In case of a pricing error, BharatBazar reserves the right to cancel the order and issue a full refund.</p>
            <p>3.4 Product images are for illustrative purposes. Actual colour, size, and appearance may vary slightly due to photographic and display settings.</p>
            <p>3.5 Availability of products is subject to stock levels. BharatBazar cannot guarantee product availability at all times.</p>
          </Section>

          <Section id="orders" title="4. Orders and Payments" onView={setActiveSection}>
            <p>4.1 Placing an order on BharatBazar constitutes an offer to purchase the product. The contract of sale is formed only when the seller accepts the order and dispatches the product.</p>
            <p>4.2 BharatBazar accepts payments via UPI (including PhonePe, Google Pay, Paytm, BHIM), credit/debit cards (Visa, Mastercard, RuPay), Net Banking, Cash on Delivery (COD), and BharatBazar Pay wallet.</p>
            <p>4.3 For COD orders, payment must be made in full to the delivery agent at the time of delivery. COD availability is subject to your delivery pincode and order value.</p>
            <p>4.4 No Cost EMI is available on select products with eligible bank cards. EMI terms and conditions are governed by your card issuing bank.</p>
            <p>4.5 BharatBazar uses PCI DSS-compliant payment gateways. We do not store full card details on our servers.</p>
          </Section>

          <Section id="shipping" title="5. Shipping and Delivery" onView={setActiveSection}>
            <p>5.1 BharatBazar delivers to all serviceable pincodes across 28 states and 8 Union Territories of India. Check serviceability at checkout.</p>
            <p>5.2 Delivery timelines are estimates and may vary due to logistical factors, public holidays, natural events, or circumstances beyond our control.</p>
            <p>5.3 Free shipping is available on orders above ₹499 or on products specifically marked as "Free Delivery". For orders below the threshold, shipping charges will be displayed at checkout.</p>
            <p>5.4 BharatBazar is not liable for delays caused by customs, third-party logistics partners, or force majeure events.</p>
            <p>5.5 Risk of loss and title for items pass to you upon delivery to the shipping address you provided.</p>
          </Section>

          <Section id="returns" title="6. Returns and Refunds" onView={setActiveSection}>
            <p>6.1 Most products on BharatBazar are eligible for a 10-day return window from the date of delivery, subject to the seller's individual return policy displayed on the product page.</p>
            <p>6.2 Products must be returned in their original condition, unused, with all tags and packaging intact. Damaged, used, or altered products may not be accepted for returns.</p>
            <p>6.3 Refunds will be processed within 5-7 business days after the return is received and quality-checked. Refunds will be credited to your original payment method or BharatBazar wallet.</p>
            <p>6.4 Certain categories including perishable goods, intimate apparel, digital products, and customised items are not eligible for returns unless they arrive damaged or defective.</p>
            <p>6.5 For damaged or incorrect items, contact support within 48 hours of delivery with photographs as evidence.</p>
          </Section>

          <Section id="seller" title="7. Seller Policies" onView={setActiveSection}>
            <p>7.1 Sellers on BharatBazar are independent entities and are solely responsible for the products they list, their accuracy, quality, legality, and fulfilment of orders.</p>
            <p>7.2 BharatBazar acts as an intermediary marketplace under the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.</p>
            <p>7.3 Sellers must comply with all applicable Indian laws including the Consumer Protection Act 2019, GST regulations, Legal Metrology Act, and product-specific regulations.</p>
            <p>7.4 BharatBazar reserves the right to remove any listing, suspend or terminate any seller account for policy violations, counterfeit goods, or fraudulent activities.</p>
            <p>7.5 Seller commission rates, payment cycles, and logistics terms are governed by the separate Seller Agreement executed at the time of onboarding.</p>
          </Section>

          <Section id="ip" title="8. Intellectual Property" onView={setActiveSection}>
            <p>8.1 The BharatBazar name, logo, platform design, and all associated trademarks are the exclusive property of BharatBazar Private Limited and are protected under the Trade Marks Act, 1999.</p>
            <p>8.2 All content on the Platform including text, graphics, images, software, and code is protected by applicable copyright and intellectual property laws.</p>
            <p>8.3 You may not reproduce, distribute, modify, or create derivative works from any Platform content without prior written permission from BharatBazar.</p>
            <p>8.4 By submitting reviews, images, or other user-generated content, you grant BharatBazar a non-exclusive, royalty-free, worldwide licence to use, display, and distribute such content.</p>
          </Section>

          <Section id="privacy" title="9. Privacy" onView={setActiveSection}>
            <p>9.1 Your privacy is important to us. Please review our Privacy Policy, which describes how we collect, use, and share information about you when you use our services.</p>
            <p>9.2 By using BharatBazar, you consent to the collection and processing of your personal data as described in our Privacy Policy, in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act).</p>
            <p>9.3 BharatBazar implements appropriate technical and organisational security measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.</p>
          </Section>

          <Section id="governing" title="10. Governing Law" onView={setActiveSection}>
            <p>10.1 These Terms and any dispute arising out of or related to them shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
            <p>10.2 Any disputes shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra, India.</p>
            <p>10.3 In case of any dispute, the parties shall first attempt to resolve the matter through good-faith negotiation within 30 days. Thereafter, disputes may be referred to arbitration under the Arbitration and Conciliation Act, 1996.</p>
            <p>10.4 If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
            <p>10.5 These Terms constitute the entire agreement between you and BharatBazar with respect to your use of the Platform and supersede all prior agreements.</p>
          </Section>

          <div className="bg-muted rounded-2xl p-5 text-xs text-muted-foreground">
            <p className="font-bold text-foreground mb-1">Contact Us</p>
            <p>For questions about these Terms, email <strong>legal@bharatbazar.in</strong> or write to us at BharatBazar Private Limited, 5th Floor, WeWork, BKC, Mumbai 400051.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
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
      <div className="space-y-3 text-sm text-foreground leading-relaxed [&_p]:text-muted-foreground">
        {children}
      </div>
    </motion.section>
  );
}
