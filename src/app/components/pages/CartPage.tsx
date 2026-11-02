import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, LoaderCircle, LockKeyhole, Minus, PackageCheck, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { fmt } from "../utils/format";
import type { CartItem, Page, Prod } from "../types/index";
import type { CustomerUser } from "../../context/AppContext";

export function CartPage({ cart, loading, error, user, refreshCart, updateQuantity, removeItem, onView, setPage }: {
  cart: CartItem[];
  loading: boolean;
  error: string;
  user: CustomerUser | null;
  refreshCart: () => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  onView: (p: Prod) => void;
  setPage?: (p: Page) => void;
}) {
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [busyItem, setBusyItem] = useState<number | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const savings = Math.max(0, mrpTotal - subtotal);
  const appliedDiscount = Math.min(discount, subtotal);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = () => {
    setCouponMsg("");
    const code = coupon.trim().toUpperCase();
    if (code === "SAVE500") {
      setDiscount(500);
      setCouponApplied(code);
      setCouponMsg("₹500 OFF applied!");
    } else if (code === "WELCOME200") {
      setDiscount(200);
      setCouponApplied(code);
      setCouponMsg("₹200 OFF applied!");
    } else {
      setDiscount(0);
      setCouponApplied("");
      setCouponMsg("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setCouponApplied("");
    setCoupon("");
    setCouponMsg("");
  };

  const changeQuantity = async (itemId: number, quantity: number) => {
    setBusyItem(itemId);
    await updateQuantity(itemId, quantity);
    setBusyItem(null);
  };

  const deleteItem = async (itemId: number) => {
    setBusyItem(itemId);
    await removeItem(itemId);
    setBusyItem(null);
  };

  if (!user && !loading) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-14 text-center shadow-sm sm:px-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <LockKeyhole size={28}/>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">Your cart, saved securely</p>
        <h1 className="mt-2 text-2xl font-black text-foreground">Sign in to see your cart</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Sign in to add products, keep your cart synced, and continue to checkout.</p>
        <button
          type="button"
          onClick={() => setPage?.("signin")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087a51] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#066641]"
        >
          Sign in <ArrowRight size={16}/>
        </button>
      </section>
    );
  }

  if (loading) {
    return (
      <section aria-label="Loading your cart" className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-muted"/>
          {[1, 2].map(item => <div key={item} className="h-36 animate-pulse rounded-2xl border border-border bg-card"/> )}
        </div>
        <div className="h-72 animate-pulse rounded-2xl border border-border bg-card"/>
      </section>
    );
  }

  if (error && cart.length === 0) {
    return (
      <section role="alert" className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-14 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Cart unavailable</p>
        <h1 className="mt-2 text-xl font-black text-foreground">{error}</h1>
        <button type="button" onClick={() => void refreshCart()} className="mt-5 rounded-xl bg-[#087a51] px-5 py-3 text-sm font-black text-white">
          Try again
        </button>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center rounded-[2rem] border border-border bg-card px-6 py-14 text-center shadow-sm sm:px-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          <ShoppingBag size={28}/>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">A little room for something lovely</p>
        <h1 className="mt-2 text-2xl font-black text-foreground">Your cart is waiting</h1>
        <p className="mt-2 text-sm text-muted-foreground">Explore the shop and add something you love.</p>
        <button type="button" onClick={() => setPage?.("products")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#087a51] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#066641]">
          Explore products <ArrowRight size={16}/>
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400">Almost yours</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">Your shopping cart</h1>
        </div>
        <p className="text-xs font-semibold text-muted-foreground">{totalQuantity} {totalQuantity === 1 ? "item" : "items"} · Saved to your account</p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <section aria-label="Cart items" className="space-y-3">
          {cart.map(item => {
            const product = item.product;
            const saving = Math.max(0, product.mrp - product.price) * item.quantity;
            return (
              <motion.article key={item.id} layout className="relative flex min-w-0 gap-3 overflow-hidden rounded-2xl border border-border bg-card p-3 sm:gap-5 sm:p-5">
                <button
                  type="button"
                  aria-label={`View ${product.name}`}
                  onClick={() => onView(product)}
                  className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted p-2 sm:h-32 sm:w-32 sm:rounded-2xl"
                >
                  {product.img ? <img src={product.img} alt={product.name} className="h-full w-full object-contain"/> : <ShoppingBag className="text-muted-foreground"/>}
                </button>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-[9px] font-black uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-400">{product.brand}</p>
                  <button type="button" onClick={() => onView(product)} className="mt-1 line-clamp-2 text-left text-sm font-black leading-snug text-foreground hover:text-emerald-800 sm:text-base">
                    {product.name}
                  </button>
                  {product.selectedSize && <p className="mt-1 text-[10px] font-semibold text-muted-foreground">Option: {product.selectedSize}</p>}
                  {!product.inStock && <p className="mt-1 text-[10px] font-bold text-rose-600">Currently unavailable</p>}
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-sm font-black text-foreground sm:text-base">{fmt(product.price)}</span>
                    {product.mrp > product.price && <span className="text-[10px] text-muted-foreground line-through">{fmt(product.mrp)}</span>}
                    {saving > 0 && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Save {fmt(saving)}</span>}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="flex items-center rounded-lg border border-border">
                      <button type="button" aria-label={`Decrease ${product.name} quantity`} disabled={busyItem === item.id || item.quantity <= 1} onClick={() => void changeQuantity(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-muted disabled:opacity-40"><Minus size={13}/></button>
                      <span className="w-8 text-center text-xs font-black text-foreground">{busyItem === item.id ? <LoaderCircle size={13} className="mx-auto animate-spin"/> : item.quantity}</span>
                      <button type="button" aria-label={`Increase ${product.name} quantity`} disabled={busyItem === item.id || !product.inStock || item.quantity >= product.stock} onClick={() => void changeQuantity(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center text-foreground hover:bg-muted disabled:opacity-40"><Plus size={13}/></button>
                    </div>
                    <button type="button" disabled={busyItem === item.id} onClick={() => void deleteItem(item.id)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-950/30">
                      <Trash2 size={13}/> Remove
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-foreground">Order summary</h2>
              <PackageCheck size={18} className="text-emerald-700 dark:text-emerald-400"/>
            </div>
            <dl className="space-y-3 text-xs">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Subtotal · {totalQuantity} items</dt><dd className="font-bold text-foreground">{fmt(subtotal)}</dd></div>
              {savings > 0 && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Product savings</dt><dd className="font-bold text-emerald-700 dark:text-emerald-400">−{fmt(savings)}</dd></div>}
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Delivery</dt><dd className="font-bold text-emerald-700 dark:text-emerald-400">Calculated at checkout</dd></div>
              {couponApplied && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex min-w-0 items-center gap-1.5 text-muted-foreground"><Tag size={12}/><span className="truncate">{couponApplied}</span><button type="button" aria-label="Remove coupon" onClick={handleRemoveCoupon} className="text-rose-600"><Trash2 size={12}/></button></dt>
                  <dd className="font-bold text-emerald-700 dark:text-emerald-400">−{fmt(appliedDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3 border-t border-border pt-3 text-sm"><dt className="font-black text-foreground">Estimated total</dt><dd className="font-black text-foreground">{fmt(Math.max(0, subtotal - appliedDiscount))}</dd></div>
            </dl>

            <div className="rounded-xl border border-dashed border-border p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-black text-foreground"><Tag size={13} className="text-emerald-700"/> Add a coupon</p>
              {!couponApplied ? (
                <div className="flex gap-2">
                  <input value={coupon} onChange={event => setCoupon(event.target.value.toUpperCase())} onKeyDown={event => { if (event.key === "Enter") handleApplyCoupon(); }} placeholder="Enter code" aria-label="Coupon code" className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-emerald-700"/>
                  <button type="button" onClick={handleApplyCoupon} className="rounded-lg bg-[#087a51] px-3 py-2 text-xs font-black text-white">Apply</button>
                </div>
              ) : (
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{couponApplied} applied</p>
              )}
              {couponMsg && <p role="status" className={`mt-2 text-[10px] font-semibold ${couponMsg.includes("applied") ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>{couponMsg}</p>}
              {!couponApplied && <p className="mt-2 text-[9px] text-muted-foreground">Try SAVE500 or WELCOME200</p>}
            </div>

            <button type="button" onClick={() => setPage?.("checkout")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087a51] py-3.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(8,122,81,0.18)] transition-colors hover:bg-[#066641]">
              Continue to checkout <ArrowRight size={16}/>
            </button>
            <p className="text-center text-[9px] leading-relaxed text-muted-foreground">You’ll review delivery and payment before placing your order.</p>
          </section>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-black text-foreground">Your cart is linked to your account</p>
            <p className="mt-1 break-all text-[10px] text-muted-foreground">{user?.email}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
