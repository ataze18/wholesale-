import React, { useState } from "react";
import { useAppState } from "./state";
import {
  ShoppingCart,
  Truck,
  User,
  Settings,
  Shield,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  Percent,
  Send,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  X,
  FileText,
  Lock,
} from "lucide-react";

export default function App() {
  const {
    products,
    orders,
    riders,
    wholesalers,
    chatMessages,
    notifications,
    auditLogs,
    telemetry,
    currentRole,
    setCurrentRole,
    darkMode,
    setDarkMode,
    activeOrderId,
    rateLimitEnabled,
    setRateLimitEnabled,
    twoFactorEnabled,
    setTwoFactorEnabled,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    initiateStkPush,
    submitStkPin,
    isStkModalOpen,
    setIsStkModalOpen,
    acceptOrder,
    updateOrderStatus,
    verifyDeliveryOtp,
    sendRiderMessage,
    updateProduct,
    upgradeSubscription,
    aiChat,
  } = useAppState();

  const [couponInput, setCouponInput] = useState("");
  const [stkPhone, setStkPhone] = useState("+254 700 111 222");
  const [stkPin, setStkPin] = useState("");
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [aiLang, setAiLang] = useState<"en" | "sw">("en");
  const [aiInput, setAiInput] = useState("");
  const [aiIsTyping, setAiIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Wholesaler states
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editStock, setEditStock] = useState(0);

  // Active order inside customer/rider views
  const activeOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyCoupon(couponInput)) {
      setCouponInput("");
    }
  };

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const userText = aiInput;
    setAiInput("");

    // Add user message to chat state locally
    sendRiderMessage(`[AI Prompt - ${aiLang === "sw" ? "Kiswahili" : "English"}]: ${userText}`);
    setAiIsTyping(true);

    try {
      const reply = await aiChat(userText, aiLang);
      setTimeout(() => {
        sendRiderMessage(`[Mshauri AI]: ${reply}`);
        setAiIsTyping(false);
      }, 800);
    } catch {
      setAiIsTyping(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.wholesalerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartDiscount = appliedCoupon ? (cartSubtotal * appliedCoupon.discountPercent) / 100 : 0;
  const cartTax = Math.round((cartSubtotal - cartDiscount) * 0.16);
  const cartDeliveryFee = cart.length > 0 ? 350 : 0;
  const cartTotal = cartSubtotal - cartDiscount + cartTax + cartDeliveryFee;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* HEADER BAR */}
      <header className={`sticky top-0 z-40 border-b px-4 lg:px-8 py-3 transition-colors ${darkMode ? "bg-slate-900/90 border-slate-800 backdrop-blur" : "bg-white/90 border-slate-200 backdrop-blur"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-600 text-white font-bold text-xl shadow-lg shadow-green-500/20">
              W
            </span>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Wholesale Hub</h1>
              <p className="text-xs text-slate-500 font-medium">Secured by Safaricom M-Pesa & Escrow</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* ROLE SELECTOR */}
            <div className={`flex rounded-xl p-1 text-sm ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
              {(["customer", "wholesaler", "rider", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setCurrentRole(role)}
                  className={`rounded-lg px-3 py-1.5 font-semibold capitalize transition-all ${
                    currentRole === role
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            {/* DARK MODE TOGGLE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`rounded-xl p-2.5 transition-all border ${
                darkMode ? "border-slate-800 bg-slate-800 text-amber-400 hover:bg-slate-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
        {/* NOTIFICATIONS / SYSTEM TOASTS SECTION */}
        {notifications.length > 0 && (
          <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500">System Notification Stream (Kenya Edge Depot)</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1 max-w-full">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex-none w-80 rounded-xl p-3 border text-xs ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-500 capitalize">{notif.type} • {notif.timestamp}</span>
                    <span className="rounded-full bg-green-500/15 text-green-500 px-1.5 py-0.5 font-bold scale-90">{notif.title}</span>
                  </div>
                  <p className="font-medium text-slate-400 leading-relaxed">{notif.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOMER ROLE INTERFACE */}
        {currentRole === "customer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Catalog list */}
            <div className="lg:col-span-8 space-y-6">
              {/* Category & Search Filter */}
              <div className={`p-4 rounded-2xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search grains, sugar, millers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full rounded-xl pl-10 pr-4 py-2 text-sm outline-none border transition-all ${
                        darkMode ? "bg-slate-950 border-slate-800 focus:border-green-500" : "bg-slate-50 border-slate-200 focus:border-green-600 focus:bg-white"
                      }`}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          selectedCategory === cat
                            ? "bg-green-600 text-white"
                            : darkMode
                            ? "bg-slate-800 hover:bg-slate-700 text-slate-400"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Grid Catalog */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((p) => {
                  const cheapAlternative = p.cheaperAlternativeId
                    ? products.find((alt) => alt.id === p.cheaperAlternativeId)
                    : null;

                  return (
                    <div
                      key={p.id}
                      className={`relative flex flex-col justify-between rounded-3xl border p-5 transition-all group ${
                        darkMode ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:shadow-md shadow-sm"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-4xl">{p.image}</span>
                          <span className="rounded-lg bg-green-500/15 text-green-500 px-2 py-1 text-[10px] font-extrabold tracking-wider uppercase">
                            ⭐ {p.rating} Wholesaler rating
                          </span>
                        </div>

                        <h3 className="font-bold text-base group-hover:text-green-500 transition-colors">{p.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-semibold">Sold by: {p.wholesalerName}</p>

                        <div className="mt-4 flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-green-500">KES {p.price.toLocaleString()}</span>
                          <span className="text-xs text-slate-400 font-medium">/ {p.unit}</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className={`font-semibold ${p.stock < 100 ? "text-red-500" : "text-slate-500"}`}>
                            Stock Left: {p.stock} units
                          </span>
                          <span className="bg-slate-500/10 text-slate-500 px-2 py-0.5 rounded-md font-bold">
                            Pack: {p.bulkQty}x Bulk
                          </span>
                        </div>

                        {cheapAlternative && (
                          <div className="mt-4 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-xs">
                            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold mb-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              <span>Mshauri AI Price Smart-Match</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed font-medium">
                              Swap this for <span className="font-bold text-slate-300">{cheapAlternative.name}</span> to save <span className="font-black text-green-500">KES {(p.price - cheapAlternative.price).toLocaleString()}</span>!
                            </p>
                            <button
                              onClick={() => addToCart(cheapAlternative, 1)}
                              className="mt-2.5 w-full rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-2 transition-all"
                            >
                              Swap and Add to Cart
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => addToCart(p, 1)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-green-600 hover:dark:bg-green-600 text-white font-bold py-3 transition-all"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add Bulk Bundle</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Mshauri AI smart chat */}
              <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-500" />
                    <h3 className="font-bold text-base">Mshauri AI Wholesale Assistant</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAiLang("en")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                        aiLang === "en" ? "bg-green-600 text-white" : "bg-slate-500/10 text-slate-500"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setAiLang("sw")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                        aiLang === "sw" ? "bg-green-600 text-white" : "bg-slate-500/10 text-slate-500"
                      }`}
                    >
                      Kiswahili
                    </button>
                  </div>
                </div>

                <div className={`h-48 overflow-y-auto rounded-2xl p-4 mb-4 border space-y-3 ${darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"}`}>
                  <div className="bg-green-500/10 text-green-500 rounded-2xl p-3 text-xs max-w-[85%] font-medium">
                    {aiLang === "sw"
                      ? "Hujambo! Mimi ni Mshauri AI, msaidizi wako mahiri wa soko la jumla. Naweza kukusaidia kulinganisha bei na kupata ofa bora. Uliza chochote (mfano: 'pata bei rahisi ya unga wa pembe')."
                      : "Hello! I am Mshauri AI, your premium business assistant. I can recommend cheaper alternative products, predict shortages, or optimize your bulk pricing. Ask me anything!"}
                  </div>
                  {chatMessages
                    .filter((msg) => msg.sender === "ai" || msg.text.startsWith("[AI Prompt"))
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-2xl p-3 text-xs max-w-[85%] font-semibold ${
                          msg.text.includes("[Mshauri AI]")
                            ? "bg-green-500/10 text-green-500 ml-0 mr-auto"
                            : "bg-slate-500/10 text-slate-500 ml-auto mr-0"
                        }`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  {aiIsTyping && (
                    <div className="text-xs text-slate-500 animate-pulse font-bold">Mshauri AI is typing...</div>
                  )}
                </div>

                <form onSubmit={handleAiChat} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={aiLang === "sw" ? "Uliza kuhusu pembe, bei au akiba..." : "Ask about Pembe prices, shortages, security limits..."}
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    className={`flex-1 rounded-xl px-4 py-2 text-sm outline-none border ${
                      darkMode ? "bg-slate-950 border-slate-800 focus:border-green-500" : "bg-slate-50 border-slate-200 focus:border-green-600 focus:bg-white"
                    }`}
                  />
                  <button type="submit" className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-sm transition-all flex items-center gap-1.5">
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Shopping Cart & Orders */}
            <div className="lg:col-span-4 space-y-8">
              {/* CART SIDEBAR */}
              <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-green-500" />
                    <h3 className="font-bold text-base">Bulk Escrow Checkout</h3>
                  </div>
                  <span className="rounded-full bg-green-500/15 text-green-500 px-2.5 py-0.5 text-xs font-black">
                    {cart.reduce((a, b) => a + b.quantity, 0)} Items
                  </span>
                </div>

                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-sm font-semibold">
                    🛒 Your bulk checkout list is empty.<br />Add bundles from the catalog to proceed.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center text-xs">
                          <div className="flex-1 pr-2">
                            <span className="text-lg mr-1.5">{item.product.image}</span>
                            <span className="font-bold">{item.product.name}</span>
                            <div className="text-slate-400 font-semibold mt-0.5">KES {item.product.price.toLocaleString()} each</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                              className="rounded-lg bg-slate-500/10 p-1 hover:bg-slate-500/20 text-slate-500"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-black w-6 text-center text-slate-300">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                              className="rounded-lg bg-slate-500/10 p-1 hover:bg-slate-500/20 text-slate-500"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="rounded-lg bg-red-500/10 p-1 hover:bg-red-500/20 text-red-500 ml-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Box */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2 border-t pt-4">
                      {appliedCoupon ? (
                        <div className="flex w-full items-center justify-between rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs">
                          <span className="text-green-500 font-bold flex items-center gap-1">
                            <Percent className="h-3.5 w-3.5" />
                            <span>Promo: {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)</span>
                          </span>
                          <button type="button" onClick={removeCoupon} className="text-red-500 font-bold hover:underline">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            placeholder="Enter promo code (e.g. BABAOYA)"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value)}
                            className={`flex-1 rounded-lg px-3 py-1.5 text-xs outline-none border ${
                              darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                            }`}
                          />
                          <button type="submit" className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 text-xs transition-all">
                            Apply
                          </button>
                        </>
                      )}
                    </form>

                    {/* Fees list */}
                    <div className="border-t pt-4 space-y-2 text-xs font-semibold text-slate-400">
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className="text-slate-300">KES {cartSubtotal.toLocaleString()}</span>
                      </div>
                      {cartDiscount > 0 && (
                        <div className="flex justify-between text-green-500">
                          <span>Wholesale Discount:</span>
                          <span>-KES {cartDiscount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>16% VAT:</span>
                        <span className="text-slate-300">KES {cartTax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee (Rider):</span>
                        <span className="text-slate-300">KES {cartDeliveryFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-black text-slate-200">
                        <span className="text-slate-300">Total Escrow Amount:</span>
                        <span className="text-green-500">KES {cartTotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Safaricom Phone Field and Submit */}
                    <div className="space-y-2 pt-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Safaricom M-Pesa Mobile Number</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={stkPhone}
                          onChange={(e) => setStkPhone(e.target.value)}
                          className={`flex-1 rounded-xl px-3 py-2 text-xs outline-none border ${
                            darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                          }`}
                        />
                        <button
                          onClick={() => initiateStkPush(stkPhone)}
                          className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 text-xs transition-all flex items-center gap-1 shadow-md shadow-green-500/10"
                        >
                          <span>Checkout</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIVE ORDER STATE TRACKER & ESCROW ESCAPE OTP */}
              {orders.length > 0 && (
                <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-green-500" />
                      <h3 className="font-bold text-base">Escrow Tracker</h3>
                    </div>
                    <span className="rounded-lg bg-green-500/15 text-green-500 px-2 py-0.5 text-xs font-black">
                      {activeOrder.id}
                    </span>
                  </div>

                  {/* Life cycle status badges */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                        <span className="text-slate-500">Order Stage:</span>
                        <span className="text-green-500 uppercase tracking-widest text-[10px] font-extrabold">{activeOrder.status}</span>
                      </div>

                      {/* Step Progress Line */}
                      <div className="flex items-center justify-between gap-1">
                        {(["EscrowPaid", "RiderAssigned", "InTransit", "Delivered", "Completed"] as const).map((st, idx) => {
                          const stages = ["EscrowPaid", "RiderAssigned", "InTransit", "Delivered", "Completed"];
                          const currentIdx = stages.indexOf(activeOrder.status);
                          const isDone = stages.indexOf(st) <= currentIdx;
                          return (
                            <React.Fragment key={st}>
                              <div
                                title={st}
                                className={`h-2.5 w-2.5 rounded-full ${
                                  isDone ? "bg-green-500" : "bg-slate-800"
                                }`}
                              />
                              {idx < stages.length - 1 && (
                                <div
                                  className={`flex-1 h-0.5 ${
                                    stages.indexOf(stages[idx + 1]) <= currentIdx ? "bg-green-500" : "bg-slate-800"
                                  }`}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    {/* GPS Tracker Map Simulation */}
                    {activeOrder.riderId && (
                      <div className="rounded-2xl border border-slate-800 p-4 bg-slate-950/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-red-500 animate-pulse" />
                            <span>Live Rider GPS Signal</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{activeOrder.riderName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <div>
                            <div>Latitude: <span className="font-mono text-slate-200">{riders[0].lat.toFixed(6)}</span></div>
                            <div>Longitude: <span className="font-mono text-slate-200">{riders[0].lng.toFixed(6)}</span></div>
                          </div>
                          <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-400 animate-pulse">
                            ACTIVE
                          </span>
                        </div>
                      </div>
                    )}

                    {/* OTP Release Verification Form */}
                    <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-xs">
                      <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-green-500" />
                        <span>Escrow OTP Protection Key</span>
                      </h4>
                      <p className="text-slate-400 leading-relaxed font-semibold mb-3">
                        Give this code to the rider only after you inspect and accept your wholesale delivery:
                      </p>
                      <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-2">
                        <span className="text-slate-500 font-bold">Your Secret OTP Code:</span>
                        <span className="text-green-500 text-lg font-black tracking-widest">{activeOrder.otp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WHOLESALER ROLE INTERFACE */}
        {currentRole === "wholesaler" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Wholesaler Stats */}
            <div className="lg:col-span-4 space-y-6">
              <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h3 className="font-bold text-base border-b pb-3 mb-4">Mwamba Millers Dashboard</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-500 font-bold">Released Earnings (Available)</span>
                    <h2 className="text-2xl font-black text-green-500 mt-1">KES {wholesalers[0].balanceReleased.toLocaleString()}</h2>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold">In Escrow (Secured pending OTP)</span>
                    <h2 className="text-xl font-bold text-slate-300 mt-1">KES {wholesalers[0].balanceEscrow.toLocaleString()}</h2>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-bold">Subscription Plan Tier</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="rounded-lg bg-green-500/10 text-green-500 px-3 py-1 text-xs font-black">
                        {wholesalers[0].subscriptionPlan}
                      </span>
                      {wholesalers[0].subscriptionPlan !== "Enterprise" && (
                        <button
                          onClick={() => upgradeSubscription(wholesalers[0].id, "Enterprise")}
                          className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2.5 text-[10px] transition-all"
                        >
                          Upgrade Premium
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Management */}
            <div className="lg:col-span-8 space-y-6">
              <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h3 className="font-bold text-base border-b pb-3 mb-4 flex items-center gap-2">
                  <span>Sync Price & Bulk Inventory</span>
                </h3>

                <div className="space-y-4">
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      className={`flex flex-col md:flex-row justify-between items-start md:items-center rounded-2xl border p-4 text-xs gap-4 ${
                        darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{prod.image}</span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-200">{prod.name}</h4>
                          <span className="text-slate-400 font-bold">{prod.category} • {prod.unit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Wholesale Price</div>
                          <span className="font-black text-green-500 text-sm">KES {prod.price.toLocaleString()}</span>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Stock Available</div>
                          <span className="font-black text-slate-300 text-sm">{prod.stock} units</span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingProduct(prod.id);
                            setEditPrice(prod.price);
                            setEditStock(prod.stock);
                          }}
                          className="rounded-xl bg-slate-850 hover:bg-green-600 hover:text-white border border-slate-700 p-2 text-xs font-bold transition-all text-slate-300"
                        >
                          Sync
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIDER ROLE INTERFACE */}
        {currentRole === "rider" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              {/* Earnings & Profile */}
              <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h3 className="font-bold text-base border-b pb-3 mb-4">Rider: {riders[0].name}</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold">Earnings Cleared Today</span>
                    <h2 className="text-2xl font-black text-green-500 mt-1">KES {riders[0].earningsToday.toLocaleString()}</h2>
                  </div>
                  <div className="flex justify-between font-bold text-slate-400">
                    <span>Trips Completed:</span>
                    <span className="text-slate-200">{riders[0].completedTrips}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-400">
                    <span>Vehicle:</span>
                    <span className="text-slate-200">{riders[0].vehicle}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accept / Complete orders */}
            <div className="lg:col-span-8 space-y-6">
              <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <h3 className="font-bold text-base border-b pb-3 mb-4 flex items-center justify-between">
                  <span>Assigned Deliveries</span>
                  <span className="rounded-full bg-green-500/10 text-green-500 px-3 py-1 text-xs font-black">
                    {orders.length} Deliveries
                  </span>
                </h3>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm font-semibold">
                    🏍️ No pending deliveries available at the moment.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((ord) => {
                      const otpValue = otpInputs[ord.id] || "";

                      return (
                        <div
                          key={ord.id}
                          className={`rounded-2xl border p-5 space-y-4 text-xs ${
                            darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs text-slate-500 font-bold">Order ID:</span>
                              <span className="ml-1 text-green-500 font-black">{ord.id}</span>
                            </div>
                            <span className="rounded-lg bg-amber-500/15 text-amber-500 px-2.5 py-0.5 text-[10px] uppercase font-black">
                              {ord.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-400 font-bold border-t border-b border-slate-800 py-3">
                            <div>
                              <div className="text-[10px] text-slate-500">Pick-up Depot</div>
                              <span className="text-slate-200">{ord.wholesalerName}</span>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500">Retailer Delivery Address</div>
                              <span className="text-slate-200">{ord.customerLocation.name}</span>
                            </div>
                          </div>

                          {/* Action flow for rider */}
                          <div className="flex flex-wrap gap-2.5 items-center justify-between pt-2">
                            <div className="flex gap-2">
                              {ord.status === "EscrowPaid" && (
                                <button
                                  onClick={() => acceptOrder(ord.id, riders[0].id)}
                                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 transition-all"
                                >
                                  Accept Order
                                </button>
                              )}
                              {ord.status === "RiderAssigned" && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, "PickedUp")}
                                  className="rounded-lg bg-slate-900 hover:bg-green-600 text-white font-bold px-3 py-1.5 border border-slate-700 transition-all"
                                >
                                  Load at Depot (PickedUp)
                                </button>
                              )}
                              {ord.status === "PickedUp" && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, "InTransit")}
                                  className="rounded-lg bg-slate-900 hover:bg-green-600 text-white font-bold px-3 py-1.5 border border-slate-700 transition-all"
                                >
                                  Start Transit (InTransit)
                                </button>
                              )}
                              {ord.status === "InTransit" && (
                                <button
                                  onClick={() => updateOrderStatus(ord.id, "Delivered")}
                                  className="rounded-lg bg-slate-900 hover:bg-green-600 text-white font-bold px-3 py-1.5 border border-slate-700 transition-all"
                                >
                                  Mark as Arrived (Delivered)
                                </button>
                              )}
                            </div>

                            {/* OTP confirmation */}
                            {ord.status === "Delivered" && (
                              <div className="flex gap-2 w-full md:w-auto items-center">
                                <input
                                  type="text"
                                  placeholder="Enter Secure Release OTP"
                                  value={otpValue}
                                  onChange={(e) => setOtpInputs({ ...otpInputs, [ord.id]: e.target.value })}
                                  className={`rounded-lg px-3 py-1.5 text-xs outline-none border w-40 ${
                                    darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                                  }`}
                                />
                                <button
                                  onClick={() => {
                                    if (verifyDeliveryOtp(ord.id, otpValue)) {
                                      setOtpInputs({ ...otpInputs, [ord.id]: "" });
                                    }
                                  }}
                                  className="rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 transition-all"
                                >
                                  Release Escrow Payout
                                </button>
                              </div>
                            )}

                            {ord.status === "Completed" && (
                              <div className="flex items-center gap-1.5 text-green-500 font-bold text-xs">
                                <CheckCircle className="h-4 w-4" />
                                <span>Escrow Completed! Ksh {ord.deliveryFee} fee paid.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ADMIN ROLE INTERFACE */}
        {currentRole === "admin" && (
          <div className="space-y-8">
            {/* Telemetry metrics row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { title: "Platform GMV Today", val: `KES ${telemetry.gmv.toLocaleString()}`, icon: TrendingUp, color: "text-green-500" },
                { title: "6% Platform Commission", val: `KES ${telemetry.totalCommissions.toLocaleString()}`, icon: BarChart3, color: "text-indigo-500" },
                { title: "Active Riders", val: telemetry.activeRiders.toString(), icon: Truck, color: "text-amber-500" },
                { title: "Active Wholesalers", val: telemetry.activeWholesalers.toString(), icon: User, color: "text-sky-500" },
                { title: "Security Alerts", val: telemetry.fraudAlerts.toString(), icon: AlertTriangle, color: "text-red-500" },
              ].map((m, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border flex items-center justify-between ${
                    darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{m.title}</span>
                    <h2 className={`text-xl font-black mt-1 ${m.color}`}>{m.val}</h2>
                  </div>
                  <span className={`p-2.5 rounded-xl bg-slate-500/5 ${m.color}`}>
                    <m.icon className="h-5 w-5" />
                  </span>
                </div>
              ))}
            </div>

            {/* Split row - settings and logs */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Security Admin Panel */}
              <div className="lg:col-span-4 space-y-6">
                <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h3 className="font-bold text-base border-b pb-3 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span>Security Systems Controls</span>
                  </h3>

                  <div className="space-y-4 text-xs font-semibold">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4>Rate Limiting & Anti-DDoS</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Limits client requests to 60 req/min</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={rateLimitEnabled}
                        onChange={(e) => setRateLimitEnabled(e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                      <div>
                        <h4>M-Pesa 2FA STK Push Verification</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Requires secure Safaricom STK pin</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Audit logs */}
              <div className="lg:col-span-8 space-y-6">
                <div className={`p-6 rounded-3xl border ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h3 className="font-bold text-base border-b pb-3 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-500" />
                      <span>Security Audit Log (Realtime)</span>
                    </span>
                    <span className="rounded-lg bg-green-500/15 text-green-500 px-2 py-0.5 text-xs font-black">
                      SYSTEM OK
                    </span>
                  </h3>

                  <div className="space-y-3 max-h-80 overflow-y-auto font-mono text-[11px] leading-relaxed">
                    {auditLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 justify-between ${
                          darkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-100 text-slate-700"
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-500 font-bold">[{log.timestamp}]</span>
                            <span className="bg-slate-500/10 text-slate-400 px-1.5 py-0.5 rounded text-[10px] font-bold">IP: {log.ip}</span>
                          </div>
                          <p className="font-semibold text-slate-400">{log.action}</p>
                        </div>
                        <span className="rounded-full bg-green-500/15 text-green-500 px-2 py-0.5 font-bold uppercase text-[9px]">
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* SAFARICOM STK PUSH ESCROW MODAL PIN POPUP */}
      {isStkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-center text-xs text-slate-200 shadow-2xl">
            <button
              onClick={() => setIsStkModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Safaricom M-Pesa Header branding */}
            <div className="flex flex-col items-center gap-2.5 mb-5 mt-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white font-extrabold text-2xl shadow-lg shadow-green-500/20">
                M
              </span>
              <div>
                <h3 className="font-black text-sm tracking-tight text-white">M-Pesa Escrow Authorization</h3>
                <span className="text-[10px] text-green-500 font-black tracking-widest uppercase">STK PIN PUSH</span>
              </div>
            </div>

            <p className="text-slate-400 font-semibold leading-relaxed mb-4">
              Enter your M-Pesa 4-digit PIN to authorize escrow payment of <span className="font-extrabold text-green-500">KES {cartTotal.toLocaleString()}</span> to the wholesale platform:
            </p>

            <div className="space-y-4">
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={stkPin}
                onChange={(e) => setStkPin(e.target.value)}
                className="w-full text-center text-2xl tracking-[1.5rem] font-bold py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-green-500 focus:border-green-600 outline-none"
              />

              <button
                onClick={() => {
                  submitStkPin(stkPin);
                  setStkPin("");
                }}
                className="w-full rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 transition-all"
              >
                Confirm Payment Authorization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INVENTORY PRODUCT SYNC MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 text-xs text-slate-200 shadow-2xl">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-black text-sm text-white mb-1.5 flex items-center gap-1.5">
              <Settings className="h-4 w-4 text-green-500" />
              <span>Sync Bulk Product Inventory</span>
            </h3>
            <p className="text-slate-400 font-semibold leading-relaxed mb-4">
              Adjust wholesale bulk price and stock units for: <span className="text-slate-200 font-bold">{products.find(p => p.id === editingProduct)?.name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Wholesale Price (KES)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none border bg-slate-950 border-slate-800 text-slate-200 focus:border-green-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Available Stock (units)</label>
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(Number(e.target.value))}
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none border bg-slate-950 border-slate-800 text-slate-200 focus:border-green-500"
                />
              </div>

              <button
                onClick={() => {
                  updateProduct(editingProduct, editPrice, editStock);
                  setEditingProduct(null);
                }}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 transition-all"
              >
                Sync with Edge Depots
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
