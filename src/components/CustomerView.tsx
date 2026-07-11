import { useState } from "react";
import { useAppState } from "../state";
import type { Product } from "../types";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Sparkles,
  Star,
  Tag,
  MapPin,
  Bike,
  Package,
  CheckCircle2,
  Send,
} from "lucide-react";

const STATUS_STEPS: { key: string; label: string }[] = [
  { key: "EscrowPaid", label: "Payment secured" },
  { key: "RiderAssigned", label: "Rider assigned" },
  { key: "PickedUp", label: "Picked up" },
  { key: "InTransit", label: "On the way" },
  { key: "Delivered", label: "Delivered" },
  { key: "Completed", label: "Completed" },
];

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, updateCartQty, removeFromCart, appliedCoupon, applyCoupon, removeCoupon, initiateStkPush } =
    useAppState();
  const [couponInput, setCouponInput] = useState("");
  const [phone, setPhone] = useState("+254 7");

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const tax = Math.round((subtotal - discount) * 0.16);
  const deliveryFee = cart.length ? 350 : 0;
  const total = subtotal - discount + tax + deliveryFee;

  return (
    <div
      className={`fixed inset-0 z-[90] transition-opacity ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-white flex flex-col transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-950/10">
          <h2 className="font-display text-lg font-semibold text-navy-950">Checkout list</h2>
          <button onClick={onClose} aria-label="Close cart" className="text-navy-900/50 hover:text-navy-950 focus-ring rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <Package className="mx-auto text-navy-950/15 mb-3" size={36} />
              <p className="text-sm text-navy-900/50">Nothing in your list yet.</p>
              <p className="text-xs text-navy-900/35 mt-1">Add bulk stock from the catalog to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 items-start border-b border-navy-950/5 pb-3">
                  <div className="w-12 h-12 rounded-lg bg-navy-950/5 flex items-center justify-center text-2xl shrink-0">
                    {item.product.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-950 leading-snug truncate">{item.product.name}</p>
                    <p className="text-xs text-navy-900/45">{item.product.unit}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-6 h-6 rounded border border-navy-950/15 flex items-center justify-center text-navy-950 focus-ring"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm w-6 text-center text-navy-950">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-6 h-6 rounded border border-navy-950/15 flex items-center justify-center text-navy-950 focus-ring"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="ml-auto text-xs text-red-500/70 hover:text-red-600 focus-ring rounded"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-navy-950 shrink-0">
                    KES {(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-navy-950/10 px-5 py-4 space-y-3">
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 text-green-700 text-xs rounded-lg px-3 py-2">
                <span className="flex items-center gap-1.5">
                  <Tag size={12} /> {appliedCoupon.code} applied — {appliedCoupon.discountPercent}% off
                </span>
                <button onClick={removeCoupon} className="font-medium underline">
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="flex-1 text-sm rounded-lg border border-navy-950/15 px-3 py-2 focus-ring"
                />
                <button
                  onClick={() => {
                    applyCoupon(couponInput);
                    setCouponInput("");
                  }}
                  className="text-sm px-3 rounded-lg bg-navy-950/5 text-navy-950 font-medium focus-ring"
                >
                  Apply
                </button>
              </div>
            )}

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-navy-900/60">
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−KES {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-navy-900/60">
                <span>VAT (16%)</span>
                <span>KES {tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-navy-900/60">
                <span>Delivery</span>
                <span>KES {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-navy-950 pt-2 border-t border-navy-950/10">
                <span>Total</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
            </div>

            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="M-Pesa phone number"
              className="w-full text-sm rounded-lg border border-navy-950/15 px-3 py-2 focus-ring"
            />

            <button
              onClick={() => initiateStkPush(phone)}
              className="w-full h-12 rounded-lg bg-gold-600 text-white font-semibold focus-ring hover:bg-gold-500 transition-colors"
            >
              Pay with M-Pesa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AiAssistant() {
  const { aiChat, addToCart, products } = useAppState();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "sw">("en");
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([
    { from: "ai", text: "Hello! I am Mshauri AI. Ask me about prices, stock, or savings." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages((m) => [...m, { from: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    const reply = await aiChat(userMsg, lang);
    setMessages((m) => [...m, { from: "ai", text: reply }]);
    setLoading(false);
  };

  const cheaper = products.find((p) => p.id === "p1-cheap");

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-[80] w-14 h-14 rounded-full bg-navy-950 text-gold-400 shadow-xl flex items-center justify-center focus-ring hover:scale-105 transition-transform"
        aria-label="Open Mshauri AI assistant"
      >
        <Sparkles size={22} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 left-5 z-[80] w-[calc(100%-2.5rem)] sm:w-80 h-[420px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-navy-950/10">
      <div className="bg-navy-950 px-4 py-3 flex items-center gap-2">
        <Sparkles size={16} className="text-gold-400" />
        <span className="text-white text-sm font-semibold flex-1">Mshauri AI</span>
        <button
          onClick={() => setLang(lang === "en" ? "sw" : "en")}
          className="text-[10px] text-white/70 border border-white/20 rounded px-1.5 py-0.5"
        >
          {lang === "en" ? "EN" : "SW"}
        </button>
        <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white ml-1" aria-label="Close">
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] text-xs rounded-xl px-3 py-2 leading-snug ${
                m.from === "user" ? "bg-navy-950 text-white" : "bg-navy-950/5 text-navy-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-navy-900/40 px-1">Mshauri is typing…</div>}
        {cheaper && messages.some((m) => m.text.includes("Hodari")) && (
          <button
            onClick={() => addToCart(cheaper, 1)}
            className="text-[11px] bg-gold-500/10 text-gold-600 border border-gold-500/30 rounded-lg px-2 py-1.5 font-medium"
          >
            Swap and add Hodari Maize Flour
          </button>
        )}
      </div>
      <div className="p-2 border-t border-navy-950/10 flex gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={lang === "en" ? "Ask about prices…" : "Uliza kuhusu bei…"}
          className="flex-1 text-xs rounded-lg border border-navy-950/15 px-3 py-2 focus-ring"
        />
        <button
          onClick={send}
          aria-label="Send"
          className="w-8 h-8 rounded-lg bg-navy-950 text-white flex items-center justify-center shrink-0 focus-ring"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

function OrderTracker() {
  const { orders, activeOrderId, riders, setActiveOrderId, verifyDeliveryOtp } = useAppState();
  const order = orders.find((o) => o.id === activeOrderId);
  const [otpInput, setOtpInput] = useState("");

  if (!order) return null;

  const rider = riders.find((r) => r.id === order.riderId);
  const stepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-96">
      <div className="bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-navy-950/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-navy-900/45">Order {order.id}</p>
            <p className="font-display font-semibold text-navy-950">{order.wholesalerName}</p>
          </div>
          {order.status === "Completed" ? (
            <button
              onClick={() => setActiveOrderId(null)}
              className="text-xs text-navy-900/40 hover:text-navy-950 focus-ring rounded"
            >
              Dismiss
            </button>
          ) : (
            <span className="text-xs bg-gold-500/10 text-gold-600 rounded-full px-2 py-1 font-medium">Live</span>
          )}
        </div>

        <div className="flex items-center gap-1 mb-3">
          {STATUS_STEPS.map((s, i) => (
            <div key={s.key} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full h-1.5 rounded-full ${
                  i <= stepIdx ? "bg-gold-500" : "bg-navy-950/10"
                }`}
              />
            </div>
          ))}
        </div>
        <p className="text-xs text-navy-900/60 mb-3">{STATUS_STEPS[stepIdx]?.label ?? "Processing"}</p>

        {rider && stepIdx >= 1 && stepIdx < 4 && (
          <div className="flex items-center gap-2 bg-navy-950/[0.03] rounded-lg px-3 py-2 mb-3">
            <Bike size={16} className="text-navy-900/50 animate-pulse-dot" />
            <div className="text-xs">
              <p className="font-medium text-navy-950">{rider.name}</p>
              <p className="text-navy-900/45">{rider.vehicle}</p>
            </div>
            <MapPin size={14} className="ml-auto text-navy-900/30" />
          </div>
        )}

        {order.status === "Delivered" && (
          <div className="space-y-2">
            <p className="text-xs text-navy-900/60">Enter your secure OTP to release payment to the wholesaler.</p>
            <div className="flex gap-2">
              <input
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4-digit OTP"
                className="flex-1 text-sm rounded-lg border border-navy-950/15 px-3 py-2 focus-ring"
              />
              <button
                onClick={() => {
                  const ok = verifyDeliveryOtp(order.id, otpInput);
                  if (ok) setOtpInput("");
                }}
                className="px-4 rounded-lg bg-navy-950 text-white text-sm font-medium focus-ring"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {order.status === "Completed" && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <CheckCircle2 size={16} /> Delivered and payment released
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart, products } = useAppState();
  const [qty, setQty] = useState(1);
  const cheaper = product.cheaperAlternativeId
    ? products.find((p) => p.id === product.cheaperAlternativeId)
    : undefined;

  return (
    <div className="bg-white rounded-2xl border border-navy-950/8 p-4 flex flex-col">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-14 h-14 rounded-xl bg-navy-950/5 flex items-center justify-center text-3xl shrink-0">
          {product.image}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy-950 leading-snug">{product.name}</p>
          <p className="text-xs text-navy-900/45 mt-0.5">{product.wholesalerName}</p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="fill-gold-500 text-gold-500" />
            <span className="text-[11px] text-navy-900/55">{product.rating}</span>
          </div>
        </div>
      </div>

      {cheaper && (
        <div className="flex items-center gap-1.5 text-[11px] text-gold-600 bg-gold-500/8 rounded-lg px-2 py-1.5 mb-2">
          <Sparkles size={11} />
          <span>
            Mshauri AI: save KES {(product.price - cheaper.price).toLocaleString()} with {cheaper.wholesalerName}
          </span>
        </div>
      )}

      <div className="mt-auto">
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-display text-lg font-semibold text-navy-950">
            KES {product.price.toLocaleString()}
          </span>
          <span className="text-[11px] text-navy-900/40">{product.unit}</span>
        </div>
        <p className="text-[11px] text-navy-900/40 mb-3">{product.stock} units in stock</p>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-navy-950/15 rounded-lg">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="w-8 h-8 flex items-center justify-center text-navy-950 focus-ring"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm text-navy-950">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 flex items-center justify-center text-navy-950 focus-ring"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={() => addToCart(product, qty)}
            className="flex-1 h-8 rounded-lg bg-navy-950 text-white text-xs font-semibold focus-ring hover:bg-navy-900 transition-colors"
          >
            Add to list
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomerView() {
  const { products, cart, activeOrderId, orders } = useAppState();
  const [cartOpen, setCartOpen] = useState(false);
  const [category, setCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = category === "All" ? products : products.filter((p) => p.category === category);
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const activeOrder = orders.find((o) => o.id === activeOrderId);

  return (
    <div className="pb-32">
      <div className="px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy-950">Wholesale Catalog</h1>
          <p className="text-sm text-navy-900/50">Bulk essentials, Nairobi-wide delivery</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative w-11 h-11 rounded-full bg-navy-950 text-white flex items-center justify-center focus-ring shrink-0"
          aria-label="Open checkout list"
        >
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="px-4 sm:px-6 flex gap-2 overflow-x-auto pb-4 -mt-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-medium focus-ring transition-colors ${
              category === c ? "bg-navy-950 text-white" : "bg-navy-950/5 text-navy-900/60"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AiAssistant />
      {activeOrder && <OrderTracker />}
    </div>
  );
}
