"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  AlertCircle, Banknote, Building2, Check, ChevronRight, Clock3, CreditCard,
  Loader2, MapPin, Package, Plus, Save, ShieldCheck, Smartphone, Tag, Wallet,
} from "lucide-react";
import { G, GD } from "../data/index";
import type { CartItem, Page } from "../types/index";
import { fmt } from "../utils/format";
import type { CustomerUser } from "../../context/AppContext";
import { APPLIED_COUPON_STORAGE_KEY } from "@/lib/coupons";

type AppliedCoupon = { code: string; discount: number };

type AddressForm = {
  recipient: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
};

type SavedAddress = AddressForm & {
  id: number;
  label: string;
  country: string;
  isDefault: boolean;
};

type NewAddressForm = AddressForm & {
  label: string;
  country: string;
  isDefault: boolean;
};

type DirectPurchase = {
  productId: number;
  quantity: number;
  variantTitle: string;
};

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "emi" | "cod";

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  available: boolean;
  icon: typeof CreditCard;
  accent: string;
}> = [
  {
    id: "upi",
    title: "UPI",
    subtitle: "GPay · PhonePe · Paytm",
    badge: "Coming soon",
    description: "Pay using any UPI app. Payment gateway integration is required before this method can be used.",
    available: false,
    icon: Smartphone,
    accent: "#6d4aff",
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    subtitle: "Visa · Mastercard · RuPay",
    badge: "Coming soon",
    description: "Credit and debit card payments will be enabled after a secure payment gateway is connected.",
    available: false,
    icon: CreditCard,
    accent: "#2563eb",
  },
  {
    id: "netbanking",
    title: "Net Banking",
    subtitle: "All major Indian banks",
    badge: "Coming soon",
    description: "Choose your bank and authorize the payment securely once gateway integration is complete.",
    available: false,
    icon: Building2,
    accent: "#0f766e",
  },
  {
    id: "wallet",
    title: "Wallets",
    subtitle: "Paytm · Amazon Pay · more",
    badge: "Coming soon",
    description: "Digital wallet payments are listed here for the upcoming payment integration.",
    available: false,
    icon: Wallet,
    accent: "#ea580c",
  },
  {
    id: "emi",
    title: "EMI / Pay Later",
    subtitle: "Flexible monthly payments",
    badge: "Coming soon",
    description: "EMI and pay-later plans will be available when supported by the payment provider.",
    available: false,
    icon: Clock3,
    accent: "#7c3aed",
  },
  {
    id: "cod",
    title: "Cash on Delivery",
    subtitle: "Pay when your order arrives",
    badge: "Available",
    description: "Pay the delivery partner in cash when your order is delivered.",
    available: true,
    icon: Banknote,
    accent: "#087a51",
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isCartItem(value: unknown): value is CartItem {
  if (!isRecord(value) || typeof value.id !== "number" || typeof value.quantity !== "number" ||
      !isRecord(value.product)) return false;
  const product = value.product;
  return typeof product.id === "number" && typeof product.name === "string" &&
    typeof product.price === "number" && typeof product.stock === "number" &&
    typeof product.inStock === "boolean" && typeof product.img === "string";
}

function isSavedAddress(value: unknown): value is SavedAddress {
  if (!isRecord(value)) return false;
  return typeof value.id === "number" && typeof value.label === "string" &&
    typeof value.recipient === "string" && typeof value.phone === "string" &&
    typeof value.line1 === "string" && typeof value.line2 === "string" &&
    typeof value.city === "string" && typeof value.state === "string" &&
    typeof value.postalCode === "string" && typeof value.country === "string" &&
    typeof value.isDefault === "boolean";
}

const inputClass = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-[#009966] focus:ring-2 focus:ring-[#009966]/20 transition-all";

export function CheckoutPage({
  setPage,
  cart,
  cartLoading,
  refreshCart,
  user,
  userLoading,
}: {
  setPage: (page: Page) => void;
  cart: CartItem[];
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
  user: CustomerUser | null;
  userLoading: boolean;
}) {
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [address, setAddress] = useState<AddressForm>({
    recipient: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [directMode, setDirectMode] = useState(false);
  const [queryReady, setQueryReady] = useState(false);
  const [directLoading, setDirectLoading] = useState(false);
  const [directItem, setDirectItem] = useState<CartItem | null>(null);
  const [directPurchase, setDirectPurchase] = useState<DirectPurchase | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponMessageIsError, setCouponMessageIsError] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const restoredCoupon = useRef(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [addressesError, setAddressesError] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<NewAddressForm>({
    label: "Home",
    recipient: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    setAddress(current => ({
      ...current,
      recipient: current.recipient || user?.name || "",
      phone: current.phone || user?.phone || "",
    }));
    setNewAddress(current => ({
      ...current,
      recipient: current.recipient || user?.name || "",
      phone: current.phone || user?.phone || "",
    }));
  }, [user?.name, user?.phone]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setAddressesLoading(false);
      setSavedAddresses([]);
      return;
    }

    let active = true;
    setAddressesLoading(true);
    setAddressesError("");
    fetch("/api/auth/addresses", {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async response => {
        const result: unknown = await response.json();
        if (!response.ok || !isRecord(result) || result.success !== true ||
            !Array.isArray(result.addresses) || !result.addresses.every(isSavedAddress)) {
          const message = isRecord(result) && typeof result.message === "string"
            ? result.message
            : "Could not load your saved addresses.";
          throw new Error(message);
        }
        if (!active) return;
        const addresses = result.addresses;
        setSavedAddresses(addresses);
        const preferred = addresses.find(item => item.isDefault) || addresses[0];
        if (preferred) {
          setSelectedAddressId(preferred.id);
          setAddress({
            recipient: preferred.recipient,
            phone: preferred.phone.replace(/\D/g, "").slice(-10),
            line1: preferred.line1,
            line2: preferred.line2,
            city: preferred.city,
            state: preferred.state,
            postalCode: preferred.postalCode,
          });
        }
      })
      .catch(loadError => {
        if (!active) return;
        setAddressesError(loadError instanceof Error ? loadError.message : "Could not load your saved addresses.");
      })
      .finally(() => {
        if (active) setAddressesLoading(false);
      });

    return () => { active = false; };
  }, [user, userLoading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("buyNow") !== "1") {
      setQueryReady(true);
      return;
    }

    const productId = Number(params.get("productId"));
    const quantity = Number(params.get("quantity"));
    const variantTitle = params.get("variantTitle") || "";
    if (!Number.isSafeInteger(productId) || productId < 1 ||
        !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      setError("The selected product or quantity is invalid.");
      setDirectMode(true);
      setQueryReady(true);
      return;
    }

    const purchase = { productId, quantity, variantTitle };
    setDirectMode(true);
    setDirectPurchase(purchase);
    setDirectLoading(true);
    const search = new URLSearchParams({
      productId: String(productId),
      quantity: String(quantity),
      variantTitle,
    });
    fetch(`/api/orders?${search.toString()}`, { credentials: "same-origin", cache: "no-store" })
      .then(async response => {
        const result: unknown = await response.json();
        if (!response.ok || !isRecord(result) || result.success !== true || !isCartItem(result.item)) {
          const message = isRecord(result) && typeof result.message === "string"
            ? result.message
            : "Could not load this product for checkout.";
          throw new Error(message);
        }
        setDirectItem(result.item);
      })
      .catch(loadError => {
        setError(loadError instanceof Error ? loadError.message : "Could not load checkout details.");
      })
      .finally(() => {
        setDirectLoading(false);
        setQueryReady(true);
      });
  }, []);

  const items = directMode ? (directItem ? [directItem] : []) : cart;
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 499 ? 0 : 49;
  const couponDiscount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal) : 0;
  const total = subtotal + tax + shipping - couponDiscount;
  const addressValid = address.recipient.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(address.phone.trim()) &&
    address.line1.trim().length >= 3 &&
    address.city.trim().length >= 2 &&
    address.state.trim().length >= 2 &&
    /^\d{6}$/.test(address.postalCode.trim());
  const available = items.length > 0 &&
    items.every(item => item.product.inStock && item.quantity <= item.product.stock);
  const codApplicable = items.length > 0 && items.every(item => item.product.cod);
  const codAvailable = available && items.every(item => item.product.cod);
  const loading = !queryReady || (directMode ? directLoading : cartLoading) || userLoading || addressesLoading;

  async function applyCoupon(codeValue = couponCode) {
    const code = codeValue.trim().toUpperCase();
    if (applyingCoupon || !code) {
      if (!code) {
        setCouponMessageIsError(true);
        setCouponMessage("Enter a coupon code.");
      }
      return;
    }

    setApplyingCoupon(true);
    setCouponMessage("");
    setCouponMessageIsError(false);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !isRecord(result) || result.success !== true ||
          !isRecord(result.coupon) || typeof result.coupon.code !== "string" ||
          typeof result.coupon.discount !== "number" || !Number.isFinite(result.coupon.discount)) {
        const message = isRecord(result) && typeof result.message === "string"
          ? result.message
          : "Could not apply this coupon.";
        throw new Error(message);
      }
      setAppliedCoupon({ code: result.coupon.code, discount: result.coupon.discount });
      setCouponCode(result.coupon.code);
      setCouponMessage("Coupon applied successfully.");
      window.sessionStorage.setItem(APPLIED_COUPON_STORAGE_KEY, result.coupon.code);
    } catch (couponError) {
      setCouponMessageIsError(true);
      setCouponMessage(couponError instanceof Error ? couponError.message : "Could not apply this coupon.");
      if (window.sessionStorage.getItem(APPLIED_COUPON_STORAGE_KEY) === code) {
        window.sessionStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
      }
    } finally {
      setApplyingCoupon(false);
    }
  }

  useEffect(() => {
    if (loading || !user || restoredCoupon.current) return;
    restoredCoupon.current = true;
    const savedCode = window.sessionStorage.getItem(APPLIED_COUPON_STORAGE_KEY);
    if (savedCode) {
      setCouponCode(savedCode);
      void applyCoupon(savedCode);
    }
  }, [loading, user]);

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
    setCouponMessageIsError(false);
    window.sessionStorage.removeItem(APPLIED_COUPON_STORAGE_KEY);
  }

  function selectAddress(saved: SavedAddress) {
    setSelectedAddressId(saved.id);
    setAddress({
      recipient: saved.recipient,
      phone: saved.phone.replace(/\D/g, "").slice(-10),
      line1: saved.line1,
      line2: saved.line2,
      city: saved.city,
      state: saved.state,
      postalCode: saved.postalCode,
    });
    setError("");
  }

  async function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (savingAddress) return;
    setSavingAddress(true);
    setAddressesError("");
    try {
      const response = await fetch("/api/auth/addresses", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAddress,
          isDefault: newAddress.isDefault || savedAddresses.length === 0,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok || !isRecord(result) || result.success !== true || !isSavedAddress(result.address)) {
        const message = isRecord(result) && typeof result.message === "string"
          ? result.message
          : "Could not save your address.";
        throw new Error(message);
      }
      const added = result.address;
      setSavedAddresses(current => [added, ...current.map(item =>
        added.isDefault ? { ...item, isDefault: false } : item
      )]);
      selectAddress(added);
      setNewAddress({
        label: "Home",
        recipient: user?.name || "",
        phone: user?.phone || "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false,
      });
      setShowAddressModal(false);
    } catch (saveError) {
      setAddressesError(saveError instanceof Error ? saveError.message : "Could not save your address.");
    } finally {
      setSavingAddress(false);
    }
  }

  async function placeOrder() {
    if (placingOrder || !codAvailable || !addressValid || paymentMethod !== "cod") return;
    setPlacingOrder(true);
    setError("");
    try {
      const payload = {
        source: directMode ? "direct" : "cart",
        paymentMethod,
        address,
        ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
        ...(directMode && directPurchase ? directPurchase : {}),
      };
      const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result: unknown = await response.json();
      if (!response.ok || !isRecord(result) || result.success !== true ||
          typeof result.orderNumber !== "string") {
        const message = isRecord(result) && typeof result.message === "string"
          ? result.message
          : "Could not place your order. Please try again.";
        throw new Error(message);
      }
      if (!directMode) await refreshCart();
      window.location.assign(`/order-confirmation?order=${encodeURIComponent(result.orderNumber)}`);
    } catch (orderError) {
      setError(orderError instanceof Error ? orderError.message : "Could not place your order.");
      setPlacingOrder(false);
    }
  }

  if (loading) {
    return <div aria-label="Loading checkout" className="mx-auto h-72 max-w-5xl animate-pulse rounded-3xl border border-border bg-card" />;
  }

  if (!user) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-14 text-center">
        <Package size={32} className="text-muted-foreground" />
        <h1 className="mt-4 text-xl font-black text-foreground">Sign in to checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your order and delivery details are securely linked to your account.</p>
        <button type="button" onClick={() => {
          const returnTo = `${window.location.pathname}${window.location.search}`;
          window.location.assign(`/signin?redirect=${encodeURIComponent(returnTo)}`);
        }}
          className="mt-5 rounded-xl bg-[#087a51] px-5 py-3 text-sm font-black text-white">
          Sign in to continue
        </button>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-14 text-center">
        <Package size={32} className="text-muted-foreground" />
        <h1 className="mt-4 text-xl font-black text-foreground">{directMode ? "Product unavailable" : "Your cart is empty"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error || "Add an item before continuing to checkout."}</p>
        <button type="button" onClick={() => setPage(directMode ? "products" : "cart")}
          className="mt-5 rounded-xl bg-[#087a51] px-5 py-3 text-sm font-black text-white">
          {directMode ? "Browse products" : "Back to cart"}
        </button>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="relative mb-7 overflow-hidden rounded-[2rem] border border-emerald-900/10 bg-[#073d2d] px-5 py-7 text-white shadow-[0_20px_60px_-35px_rgba(4,70,48,0.65)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[36px] border-white/[0.04]" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-28 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-100">
              <ShieldCheck size={13} /> Secure checkout
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">A few steps to your doorstep.</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-emerald-100/75">
              Review your delivery details and choose how you’d like to pay.
            </p>
          </div>
          <div className="flex items-center md:min-w-[310px] md:justify-end">
            {["Delivery", "Payment", "Complete"].map((label, index) => (
              <div key={label} className="flex min-w-0 flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-black transition ${
                    index < step
                      ? "border-emerald-300 bg-emerald-300 text-[#073d2d]"
                      : index === step
                        ? "border-white bg-white text-[#073d2d] shadow-[0_0_0_5px_rgba(255,255,255,0.12)]"
                        : "border-white/25 bg-white/5 text-white/55"
                  }`}>
                    {index < step ? <Check size={15} strokeWidth={3} /> : `0${index + 1}`}
                  </span>
                  <span className={`whitespace-nowrap text-[9px] font-black uppercase tracking-[0.11em] sm:text-[10px] ${
                    index <= step ? "text-white" : "text-white/45"
                  }`}>{label}</span>
                </div>
                {index < 2 && <span className={`mx-2 mb-5 h-px min-w-5 flex-1 sm:mx-3 ${index < step ? "bg-emerald-300" : "bg-white/20"}`} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-2 rounded-xl border border-rose-300/70 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 2 ? (
        <section className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-14 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <Check size={32} />
          </div>
          <h2 className="mt-4 text-xl font-black text-foreground">Order placed</h2>
          <p className="mt-2 text-sm text-muted-foreground">Opening your order confirmation…</p>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
          <div className="space-y-5">
            {step === 0 ? (
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-lg font-black text-foreground">
                    <MapPin size={19} style={{ color: G }} /> Delivery address
                  </h2>
                  <button type="button" onClick={() => { setAddressesError(""); setShowAddressModal(true); }}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#087a51]/30 px-3.5 py-2.5 text-xs font-black text-[#087a51] transition hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/30">
                    <Plus size={15} /> Add new address
                  </button>
                </div>
                {addressesError && (
                  <div role="alert" className="mb-4 rounded-xl border border-rose-300/70 bg-rose-50 px-3.5 py-3 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">
                    {addressesError}
                  </div>
                )}
                {savedAddresses.length ? (
                  <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-2">
                    {savedAddresses.map(saved => {
                      const selected = selectedAddressId === saved.id;
                      return (
                        <motion.button key={saved.id} type="button" whileHover={{ y: -2 }}
                          onClick={() => selectAddress(saved)}
                          aria-pressed={selected}
                          className={`w-full min-w-0 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#009966] focus-visible:ring-offset-2 sm:p-4 ${
                            selected
                              ? "border-[#009966] bg-emerald-50/70 ring-1 ring-[#009966]/20 dark:bg-emerald-950/25"
                              : "border-border bg-muted/50 hover:border-[#009966]"
                          }`}>
                          <span className="flex min-w-0 items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm"
                              style={{ background: `${G}18` }}>
                              {saved.label.toLowerCase() === "home" ? "🏠" : saved.label.toLowerCase() === "office" ? "🏢" : "📍"}
                            </span>
                            <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                              <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-xs font-black text-foreground">{saved.label}</span>
                                {saved.isDefault && (
                                  <span className="rounded-full px-2 py-0.5 text-[9px] font-black text-white"
                                    style={{ background: G }}>Default</span>
                                )}
                              </span>
                              <span className="mt-1 block break-words text-sm font-semibold text-foreground">{saved.recipient}</span>
                              <span className="mt-1 block break-words text-xs leading-relaxed text-muted-foreground">
                                {[saved.line1, saved.line2].filter(Boolean).join(", ")}
                              </span>
                              <span className="block break-words text-xs leading-relaxed text-muted-foreground">
                                {saved.city}, {saved.state} — {saved.postalCode}, {saved.country}
                              </span>
                              <span className="mt-1 block break-words text-xs text-muted-foreground">📞 {saved.phone}</span>
                            </span>
                            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected ? "border-[#009966] bg-[#009966] text-white" : "border-border"
                            }`} aria-hidden="true">
                              {selected && <Check size={12} strokeWidth={3} />}
                            </span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                    <MapPin size={22} className="mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm font-bold text-foreground">No saved addresses yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add a delivery address to continue with your order.</p>
                  </div>
                )}
                <p className="mt-4 text-xs text-muted-foreground">Choose a saved address or add a new one. Your address is attached to this order.</p>
              </section>
            ) : (
              <section className="overflow-hidden rounded-3xl border border-border bg-card">
                <div className="border-b border-border bg-muted/35 p-5 sm:p-7">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">Step 02 · Payment</p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-foreground sm:text-2xl">Choose how to pay</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Select a payment method. Online options are shown now and will activate after gateway integration.
                  </p>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                    {PAYMENT_OPTIONS.map(option => {
                      const Icon = option.icon;
                      const selected = paymentMethod === option.id;
                      const unavailable = option.id === "cod" && !codApplicable;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-pressed={selected}
                          disabled={unavailable}
                          onClick={() => {
                            setPaymentMethod(option.id);
                            setError("");
                          }}
                          className={`group flex min-h-[104px] min-w-0 items-start gap-3 rounded-2xl border p-3 text-left transition-all sm:p-4 ${
                            selected
                              ? "border-[#087a51] bg-emerald-50/70 shadow-[0_8px_24px_-16px_rgba(8,122,81,0.65)] ring-1 ring-[#087a51]/25 dark:bg-emerald-950/25"
                              : "border-border bg-background hover:-translate-y-0.5 hover:border-[#087a51]/50 hover:shadow-md"
                          } ${unavailable ? "cursor-not-allowed opacity-45" : ""}`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ color: option.accent, background: `${option.accent}14` }}>
                            <Icon size={19} strokeWidth={2.2} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                              <span className="break-words text-xs font-black text-foreground sm:text-sm">{option.title}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wide ${
                                option.available
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {unavailable ? "Not available" : option.badge}
                              </span>
                            </span>
                            <span className="mt-1 block break-words text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
                              {option.subtitle}
                            </span>
                          </span>
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                            selected ? "border-[#087a51] bg-[#087a51] text-white" : "border-border"
                          }`}>
                            {selected && <Check size={12} strokeWidth={3} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const selectedOption = PAYMENT_OPTIONS.find(option => option.id === paymentMethod);
                    if (!selectedOption) return null;
                    const Icon = selectedOption.icon;
                    return (
                      <div className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 ${
                        selectedOption.available
                          ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/25"
                          : "border-border bg-muted/45"
                      }`}>
                        <span className="mt-0.5 shrink-0" style={{ color: selectedOption.accent }}>
                          <Icon size={17} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-foreground">
                            {selectedOption.available ? "Ready for this order" : "Payment integration pending"}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {selectedOption.id === "cod" && !codApplicable
                              ? "Cash on Delivery is not supported for one or more items in your order."
                              : selectedOption.description}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">Delivering to</p>
                      <p className="mt-1 break-words text-xs font-bold text-foreground">{address.recipient} · {address.phone}</p>
                      <p className="text-xs text-muted-foreground">{address.city}, {address.state} — {address.postalCode}</p>
                    </div>
                    <button type="button" onClick={() => setStep(0)}
                      className="shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-bold text-foreground transition hover:border-[#087a51] hover:text-[#087a51]">
                      Change address
                    </button>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-border bg-card p-5 sm:p-7">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-black text-foreground">
                <Tag size={16} style={{ color: G }} /> Items in this order
              </h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.product.selectedSize || ""}`} className="flex gap-3">
                    <img src={item.product.img} alt="" className="h-16 w-16 shrink-0 rounded-xl bg-muted object-contain p-1" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold text-foreground">{item.product.name}</p>
                      {item.product.selectedSize && <p className="mt-0.5 text-xs text-muted-foreground">Option: {item.product.selectedSize}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-foreground">{fmt(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <label htmlFor="checkout-coupon" className="mb-2 block text-xs font-black text-foreground">
                  Have a coupon?
                </label>
                <div className="flex gap-2">
                  <input
                    id="checkout-coupon"
                    value={couponCode}
                    onChange={event => setCouponCode(event.target.value.toUpperCase())}
                    onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); void applyCoupon(); } }}
                    placeholder="Enter code"
                    aria-label="Coupon code"
                    className={`${inputClass} min-w-0 flex-1 py-2.5 font-mono uppercase`}
                  />
                  <button type="button" onClick={() => void applyCoupon()} disabled={applyingCoupon}
                    className="shrink-0 rounded-xl bg-[#087a51] px-4 text-xs font-black text-white transition disabled:opacity-60">
                    {applyingCoupon ? "Checking…" : "Apply"}
                  </button>
                  {appliedCoupon && (
                    <button type="button" onClick={removeCoupon}
                      className="shrink-0 rounded-xl border border-border px-3 text-xs font-black text-muted-foreground transition hover:border-rose-300 hover:text-rose-700">
                      Remove
                    </button>
                  )}
                </div>
                {couponMessage && (
                  <p role={couponMessageIsError ? "alert" : "status"}
                    className={`mt-2 text-xs font-semibold ${couponMessageIsError ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                    {couponMessage}
                  </p>
                )}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-border bg-card p-5 lg:sticky lg:top-24 sm:p-6">
            <h2 className="text-base font-black text-foreground">Order summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              {items.map(item => (
                <div key={`${item.product.id}-${item.product.selectedSize || ""}-summary`} className="flex justify-between gap-3 text-muted-foreground">
                  <span className="min-w-0 truncate">{item.product.name} × {item.quantity}</span>
                  <span className="shrink-0 font-semibold text-foreground">{fmt(item.product.price * item.quantity)}</span>
                </div>
              ))}
              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span className="font-semibold text-foreground">{fmt(subtotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>GST (18%)</span><span className="font-semibold text-foreground">{fmt(tax)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Delivery</span><span className="font-bold text-emerald-700 dark:text-emerald-400">{shipping === 0 ? "FREE" : fmt(shipping)}</span></div>
                {appliedCoupon && (
                  <div className="flex justify-between gap-3 text-emerald-700 dark:text-emerald-300">
                    <span className="min-w-0 truncate">Coupon · {appliedCoupon.code}</span>
                    <span className="shrink-0 font-bold">−{fmt(couponDiscount)}</span>
                  </div>
                )}
                {step === 1 && (
                  <div className="flex justify-between gap-3 text-muted-foreground">
                    <span>Payment method</span>
                    <span className="text-right font-bold text-foreground">
                      {PAYMENT_OPTIONS.find(option => option.id === paymentMethod)?.title}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <span className="font-black text-foreground">Total</span><span className="font-black text-foreground">{fmt(total)}</span>
                </div>
              </div>
            </div>

            {step === 0 ? (
              <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={() => { setError(""); setStep(1); }}
                disabled={!addressValid || !selectedAddressId || !available}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: `linear-gradient(to right,${GD},${G})` }}>
                Continue to payment <ChevronRight size={16} />
              </motion.button>
            ) : (
              <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={placeOrder}
                disabled={placingOrder || !available || paymentMethod !== "cod" || !codApplicable}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: `linear-gradient(to right,${GD},${G})` }}>
                {placingOrder
                  ? "Placing your order…"
                  : paymentMethod === "cod"
                    ? <>Place COD order <ChevronRight size={16} /></>
                    : "Available after integration"}
              </motion.button>
            )}
            {!available && <p className="mt-3 text-xs font-semibold text-rose-700">
              One or more items are out of stock. Remove or update them before ordering.
            </p>}
            {step === 1 && paymentMethod === "cod" && !codApplicable && (
              <p className="mt-3 text-xs font-semibold text-rose-700">Cash on Delivery is not supported for one or more items in this order.</p>
            )}
            {step === 1 && paymentMethod !== "cod" && (
              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">
                This payment option is displayed for now and can be activated after you integrate its payment provider.
              </p>
            )}
            {step === 1 && <button type="button" onClick={() => setStep(0)} className="mt-3 w-full text-xs font-bold text-muted-foreground hover:text-foreground">Back to delivery address</button>}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted-foreground">
              <ShieldCheck size={13} className="shrink-0 text-emerald-700 dark:text-emerald-300" />
              Stock is reserved when your order is placed.
            </p>
          </aside>
        </div>
      )}
      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onMouseDown={event => {
            if (event.target === event.currentTarget && !savingAddress) setShowAddressModal(false);
          }}>
          <form onSubmit={saveAddress} role="dialog" aria-modal="true" aria-labelledby="address-form-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="address-form-title" className="text-lg font-black text-foreground">Add New Address</h2>
                <p className="mt-1 text-xs text-muted-foreground">Your saved address is private to your account.</p>
              </div>
              <button type="button" aria-label="Close address form" disabled={savingAddress}
                onClick={() => setShowAddressModal(false)}
                className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted disabled:opacity-60">
                ✕
              </button>
            </div>
            {addressesError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{addressesError}</p>}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="text-xs font-bold text-muted-foreground">
                Address label
                <select required value={newAddress.label}
                  onChange={event => setNewAddress(current => ({ ...current, label: event.target.value }))}
                  className={`${inputClass} mt-1.5`}>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="text-xs font-bold text-muted-foreground">
                Recipient name
                <input required maxLength={100} value={newAddress.recipient}
                  onChange={event => setNewAddress(current => ({ ...current, recipient: event.target.value }))}
                  className={`${inputClass} mt-1.5`} autoComplete="name" />
              </label>
              <label className="text-xs font-bold text-muted-foreground">
                Phone number
                <input required type="tel" maxLength={20} value={newAddress.phone}
                  onChange={event => setNewAddress(current => ({ ...current, phone: event.target.value }))}
                  className={`${inputClass} mt-1.5`} autoComplete="tel" />
              </label>
              <label className="text-xs font-bold text-muted-foreground">
                Postal / PIN code
                <input required maxLength={12} value={newAddress.postalCode}
                  onChange={event => setNewAddress(current => ({ ...current, postalCode: event.target.value.replace(/[^0-9A-Za-z -]/g, "") }))}
                  className={`${inputClass} mt-1.5`} autoComplete="postal-code" />
              </label>
              <label className="text-xs font-bold text-muted-foreground sm:col-span-2">
                Address line 1
                <input required maxLength={200} value={newAddress.line1}
                  onChange={event => setNewAddress(current => ({ ...current, line1: event.target.value }))}
                  className={`${inputClass} mt-1.5`} autoComplete="address-line1" placeholder="House, flat, street, area" />
              </label>
              <label className="text-xs font-bold text-muted-foreground sm:col-span-2">
                Address line 2 <span className="font-normal">(optional)</span>
                <input maxLength={200} value={newAddress.line2}
                  onChange={event => setNewAddress(current => ({ ...current, line2: event.target.value }))}
                  className={`${inputClass} mt-1.5`} autoComplete="address-line2" placeholder="Landmark, building, etc." />
              </label>
              <label className="text-xs font-bold text-muted-foreground">
                City
                <input required maxLength={100} value={newAddress.city}
                  onChange={event => setNewAddress(current => ({ ...current, city: event.target.value }))}
                  className={`${inputClass} mt-1.5`} autoComplete="address-level2" />
              </label>
              <label className="text-xs font-bold text-muted-foreground">
                State / Province
                <input required maxLength={100} value={newAddress.state}
                  onChange={event => setNewAddress(current => ({ ...current, state: event.target.value }))}
                  className={`${inputClass} mt-1.5`} autoComplete="address-level1" />
              </label>
              <label className="text-xs font-bold text-muted-foreground sm:col-span-2">
                Country
                <input required maxLength={100} value={newAddress.country}
                  onChange={event => setNewAddress(current => ({ ...current, country: event.target.value }))}
                  className={`${inputClass} mt-1.5`} autoComplete="country-name" />
              </label>
            </div>
            <label className="mt-4 flex items-center gap-2 text-xs font-bold text-foreground">
              <input type="checkbox" checked={newAddress.isDefault}
                onChange={event => setNewAddress(current => ({ ...current, isDefault: event.target.checked }))}
                className="h-4 w-4 rounded" style={{ accentColor: G }} />
              Set as my default address
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={savingAddress} onClick={() => setShowAddressModal(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted disabled:opacity-60">
                  Cancel
              </button>
              <button type="submit" disabled={savingAddress}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"
                style={{ background: `linear-gradient(to right, ${GD}, ${G})` }}>
                {savingAddress ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {savingAddress ? "Saving…" : "Add Address"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
