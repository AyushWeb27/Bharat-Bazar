import { useState } from "react";
import { Mail, MessageSquare, Eye, Save, ChevronRight } from "lucide-react";
import { Modal, Field } from "./shared/ui";
import { G, inp, card } from "./shared/constants";

type TemplateType = "Email" | "SMS";

type Template = {
  id: string;
  category: string;
  type: TemplateType;
  subject: string;
  body: string;
  variables: string[];
};

const TEMPLATES: Template[] = [
  {
    id: "order-confirm",
    category: "Order Confirmation",
    type: "Email",
    subject: "Your BharatBazar order #{{order_id}} is confirmed!",
    body: `Hi {{customer_name}},

Thank you for your order! We're excited to let you know that your order has been confirmed.

Order ID: {{order_id}}
Order Date: {{order_date}}
Total Amount: {{order_total}}

Items Ordered:
{{order_items}}

Expected Delivery: {{delivery_date}}

You can track your order at: {{tracking_url}}

Thank you for shopping with BharatBazar!`,
    variables: ["{{customer_name}}", "{{order_id}}", "{{order_date}}", "{{order_total}}", "{{order_items}}", "{{delivery_date}}", "{{tracking_url}}"],
  },
  {
    id: "shipping-update",
    category: "Shipping Update",
    type: "Email",
    subject: "Your order #{{order_id}} has been shipped!",
    body: `Hi {{customer_name}},

Great news! Your order #{{order_id}} has been shipped and is on its way.

Courier: {{courier_name}}
AWB Number: {{awb_number}}
Expected Delivery: {{delivery_date}}

Track your shipment: {{tracking_url}}`,
    variables: ["{{customer_name}}", "{{order_id}}", "{{courier_name}}", "{{awb_number}}", "{{delivery_date}}", "{{tracking_url}}"],
  },
  {
    id: "delivery-confirm",
    category: "Delivery Confirmation",
    type: "Email",
    subject: "Order #{{order_id}} delivered successfully!",
    body: `Hi {{customer_name}},

Your order #{{order_id}} has been delivered successfully on {{delivery_date}}.

We hope you love your purchase! Please take a moment to rate your experience.

Rate your order: {{review_url}}`,
    variables: ["{{customer_name}}", "{{order_id}}", "{{delivery_date}}", "{{review_url}}"],
  },
  {
    id: "return-approved",
    category: "Return Approved",
    type: "Email",
    subject: "Return request #{{return_id}} approved",
    body: `Hi {{customer_name}},

Your return request for order #{{order_id}} has been approved.

Return ID: {{return_id}}
Refund Amount: {{refund_amount}}
Refund Timeline: {{refund_timeline}}

The amount will be credited to your {{payment_method}} within {{refund_timeline}}.`,
    variables: ["{{customer_name}}", "{{order_id}}", "{{return_id}}", "{{refund_amount}}", "{{refund_timeline}}", "{{payment_method}}"],
  },
  {
    id: "otp-login",
    category: "OTP Login",
    type: "SMS",
    subject: "",
    body: `{{otp_code}} is your BharatBazar login OTP. Valid for {{otp_expiry}} minutes. Do not share this OTP with anyone. -BharatBazar`,
    variables: ["{{otp_code}}", "{{otp_expiry}}"],
  },
  {
    id: "welcome",
    category: "Welcome Email",
    type: "Email",
    subject: "Welcome to BharatBazar, {{customer_name}}!",
    body: `Hi {{customer_name}},

Welcome to BharatBazar — India's largest online marketplace!

Your account has been created successfully.
Email: {{customer_email}}
Phone: {{customer_phone}}

As a new member, enjoy {{welcome_discount}}% off your first order with code: {{welcome_code}}

Happy Shopping!`,
    variables: ["{{customer_name}}", "{{customer_email}}", "{{customer_phone}}", "{{welcome_discount}}", "{{welcome_code}}"],
  },
  {
    id: "abandoned-cart",
    category: "Abandoned Cart",
    type: "Email",
    subject: "Hey {{customer_name}}, you forgot something! 🛒",
    body: `Hi {{customer_name}},

You left {{item_count}} item(s) worth {{cart_value}} in your BharatBazar cart.

Your cart is saved and waiting for you. Complete your purchase today!

Use code {{coupon_code}} for 10% off — valid for {{expiry_hours}} hours only.

Go to cart: {{cart_url}}`,
    variables: ["{{customer_name}}", "{{item_count}}", "{{cart_value}}", "{{coupon_code}}", "{{expiry_hours}}", "{{cart_url}}"],
  },
  {
    id: "flash-sale",
    category: "Flash Sale Alert",
    type: "SMS",
    subject: "",
    body: `BharatBazar FLASH SALE! {{discount_percent}}% OFF on {{sale_category}}. Sale ends {{sale_end_time}}. Shop now: {{sale_url}} Reply STOP to opt-out.`,
    variables: ["{{discount_percent}}", "{{sale_category}}", "{{sale_end_time}}", "{{sale_url}}"],
  },
];

const SAMPLE_VALUES: Record<string, string> = {
  "{{customer_name}}":    "Priya Sharma",
  "{{order_id}}":         "BB-20261005-8472",
  "{{order_date}}":       "5 Oct 2026",
  "{{order_total}}":      "₹4,299",
  "{{order_items}}":      "1× Puma Sneakers (Size 7), 2× Nike Socks",
  "{{delivery_date}}":    "8 Oct 2026",
  "{{tracking_url}}":     "https://bharatbazar.com/track/BB-8472",
  "{{courier_name}}":     "Delhivery",
  "{{awb_number}}":       "DEL2610123456",
  "{{review_url}}":       "https://bharatbazar.com/review/BB-8472",
  "{{return_id}}":        "RET-2610-441",
  "{{refund_amount}}":    "₹4,299",
  "{{refund_timeline}}":  "5-7 business days",
  "{{payment_method}}":   "UPI",
  "{{otp_code}}":         "847291",
  "{{otp_expiry}}":       "10",
  "{{customer_email}}":   "priya.s@gmail.com",
  "{{customer_phone}}":   "+91 98765 43210",
  "{{welcome_discount}}": "15",
  "{{welcome_code}}":     "WELCOME15",
  "{{item_count}}":       "3",
  "{{cart_value}}":       "₹4,299",
  "{{coupon_code}}":      "RECOVER10",
  "{{expiry_hours}}":     "24",
  "{{cart_url}}":         "https://bharatbazar.com/cart/resume/abc123",
  "{{discount_percent}}": "50",
  "{{sale_category}}":    "Electronics",
  "{{sale_end_time}}":    "11:59 PM tonight",
  "{{sale_url}}":         "https://bharatbazar.com/sale/flash",
};

function renderWithVars(text: string) {
  const parts = text.split(/({{[^}]+}})/g);
  return parts.map((part, i) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      return (
        <span key={i} className="font-mono font-bold px-1 rounded-sm text-[11px]"
          style={{ color: G, background: `${G}12` }}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function renderPreview(text: string) {
  let result = text;
  Object.entries(SAMPLE_VALUES).forEach(([k, v]) => {
    result = result.replaceAll(k, v);
  });
  return result;
}

export function EmailTemplatePage() {
  const [selected, setSelected]     = useState(TEMPLATES[0]);
  const [tabType, setTabType]       = useState<TemplateType>("Email");
  const [form, setForm]             = useState({ subject: TEMPLATES[0].subject, body: TEMPLATES[0].body });
  const [preview, setPreview]       = useState(false);

  const filtered = TEMPLATES.filter(t => t.type === tabType);

  const selectTemplate = (t: Template) => {
    setSelected(t);
    setForm({ subject: t.subject, body: t.body });
    if (t.type !== tabType) setTabType(t.type);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Operations / Email & SMS</p>
          <h1 className="text-xl font-black text-gray-900">Email & SMS Templates</h1>
          <p className="text-xs text-gray-400 mt-0.5">Manage notification templates · {TEMPLATES.length} templates</p>
        </div>
        {/* Email / SMS tabs */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          {(["Email", "SMS"] as TemplateType[]).map(t => (
            <button key={t} onClick={() => setTabType(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={tabType === t ? { background: G, color: "#fff" } : { color: "#6b7280" }}>
              {t === "Email" ? <Mail size={12} /> : <MessageSquare size={12} />}
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-5 min-h-[600px]">
        {/* Left sidebar — category list */}
        <div className={`${card} w-56 shrink-0 self-start sticky top-4`}>
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Templates</p>
          </div>
          <nav className="py-1.5">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => selectTemplate(t)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-all hover:bg-gray-50 group"
                style={selected.id === t.id ? { background: `${G}10`, borderRight: `2px solid ${G}` } : {}}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={selected.id === t.id ? { background: `${G}20`, color: G } : { background: "#f3f4f6", color: "#9ca3af" }}>
                    {t.type === "Email" ? <Mail size={10} /> : <MessageSquare size={10} />}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 truncate">{t.category}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1"
                  style={{ background: t.type === "Email" ? "#eff6ff" : "#f0fdf4", color: t.type === "Email" ? "#3b82f6" : G }}>
                  {t.type}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right panel — editor */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className={`${card} p-5`}>
            {/* Template header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-900">{selected.category}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: selected.type === "Email" ? "#eff6ff" : "#f0fdf4", color: selected.type === "Email" ? "#3b82f6" : G }}>
                  {selected.type}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPreview(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                  <Eye size={12} /> Preview
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                  style={{ background: G }}>
                  <Save size={12} /> Save
                </button>
              </div>
            </div>

            {/* Subject (email only) */}
            {selected.type === "Email" && (
              <div className="mb-4">
                <Field label="Subject Line">
                  <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Email subject…" className={inp} />
                </Field>
              </div>
            )}

            {/* Body */}
            <div className="mb-4">
              <Field label={selected.type === "Email" ? "Email Body" : "SMS Body"}>
                <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  rows={selected.type === "Email" ? 12 : 5}
                  className={`${inp} resize-none font-mono text-xs leading-relaxed`} />
              </Field>
            </div>

            {/* Body preview with highlighted vars */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Body Preview (with variables highlighted)</p>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-mono">
                {renderWithVars(form.body)}
              </div>
            </div>
          </div>

          {/* Variable reference */}
          <div className={`${card} p-5`}>
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Available Variables</p>
            <div className="flex flex-wrap gap-2">
              {selected.variables.map(v => (
                <span key={v} className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ color: G, background: `${G}10`, borderColor: `${G}25` }}
                  title={`Sample: ${SAMPLE_VALUES[v] ?? v}`}>
                  {v}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-3">Click a variable to see its sample value. Hover for details.</p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal open={preview} onClose={() => setPreview(false)} title={`Preview: ${selected.category}`} wide>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Type:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: selected.type === "Email" ? "#eff6ff" : "#f0fdf4", color: selected.type === "Email" ? "#3b82f6" : G }}>
              {selected.type}
            </span>
          </div>
          {selected.type === "Email" && form.subject && (
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Subject</p>
              <p className="text-sm font-bold text-gray-800 p-3 rounded-xl bg-gray-50 border border-gray-100">
                {renderPreview(form.subject)}
              </p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Body</p>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {renderPreview(form.body)}
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Variables replaced with sample values for preview.</p>
        </div>
      </Modal>
    </div>
  );
}

export default EmailTemplatePage;
