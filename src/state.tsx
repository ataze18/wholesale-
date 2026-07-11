/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  Product,
  Order,
  Rider,
  Wholesaler,
  ChatMessage,
  Notification,
  SecurityAuditLog,
  AdminTelemetry,
  Coupon,
  OrderItem,
} from "./types";

interface AppContextType {
  products: Product[];
  orders: Order[];
  riders: Rider[];
  wholesalers: Wholesaler[];
  chatMessages: ChatMessage[];
  notifications: Notification[];
  auditLogs: SecurityAuditLog[];
  telemetry: AdminTelemetry;
  coupons: Coupon[];
  
  // App state
  currentRole: "customer" | "wholesaler" | "rider" | "admin";
  setCurrentRole: (role: "customer" | "wholesaler" | "rider" | "admin") => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  
  // Security settings
  rateLimitEnabled: boolean;
  setRateLimitEnabled: (val: boolean) => void;
  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (val: boolean) => void;
  
  // Customer Actions
  cart: OrderItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  updateCartQty: (productId: string, qty: number) => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  initiateStkPush: (phone: string) => Promise<void>;
  submitStkPin: (pin: string) => void;
  isStkModalOpen: boolean;
  setIsStkModalOpen: (val: boolean) => void;
  
  // Rider Actions
  acceptOrder: (orderId: string, riderId: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  verifyDeliveryOtp: (orderId: string, otp: string) => boolean;
  uploadDeliveryPhoto: (orderId: string, photoUrl: string) => void;
  sendRiderMessage: (text: string) => void;
  
  // Wholesaler Actions
  updateProduct: (productId: string, price: number, stock: number) => void;
  upgradeSubscription: (wholesalerId: string, plan: "Growth" | "Enterprise") => void;
  
  // AI Helper Actions
  aiChat: (text: string, language: "en" | "sw") => Promise<string>;
  addSystemToast: (title: string, message: string, type: Notification["type"]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Super Pembe Maize Flour - 24 Pack",
    category: "Grains & Flour",
    price: 3400,
    bulkQty: 24,
    unit: "Bales (2kg x 24)",
    stock: 120,
    wholesalerId: "w1",
    wholesalerName: "Mwamba Millers Wholesale",
    rating: 4.8,
    image: "🌽",
    cheaperAlternativeId: "p1-cheap",
  },
  {
    id: "p1-cheap",
    name: "Hodari Maize Flour Premium - 24 Pack",
    category: "Grains & Flour",
    price: 2950,
    bulkQty: 24,
    unit: "Bales (2kg x 24)",
    stock: 250,
    wholesalerId: "w2",
    wholesalerName: "Bargain Grain Wholesalers",
    rating: 4.5,
    image: "🌽",
  },
  {
    id: "p2",
    name: "Kabras Sugar Premium White - 50KG Bag",
    category: "Sugar & Sweeteners",
    price: 7400,
    bulkQty: 50,
    unit: "Bag (50kg)",
    stock: 85,
    wholesalerId: "w1",
    wholesalerName: "Mwamba Millers Wholesale",
    rating: 4.9,
    image: "🍬",
    cheaperAlternativeId: "p2-cheap",
  },
  {
    id: "p2-cheap",
    name: "Mara White Sugar Local - 50KG Bag",
    category: "Sugar & Sweeteners",
    price: 6900,
    bulkQty: 50,
    unit: "Bag (50kg)",
    stock: 90,
    wholesalerId: "w2",
    wholesalerName: "Bargain Grain Wholesalers",
    rating: 4.2,
    image: "🍬",
  },
  {
    id: "p3",
    name: "Rina Double Refined Vegetable Oil - 20L",
    category: "Cooking Oils",
    price: 4800,
    bulkQty: 20,
    unit: "Jerrycan (20L)",
    stock: 45,
    wholesalerId: "w3",
    wholesalerName: "Coastal Oils & Fats Ltd",
    rating: 4.7,
    image: "🌻",
  },
  {
    id: "p4",
    name: "Baraka Long Grain Biryani Rice - 25KG Bag",
    category: "Grains & Flour",
    price: 3900,
    bulkQty: 25,
    unit: "Bag (25kg)",
    stock: 140,
    wholesalerId: "w2",
    wholesalerName: "Bargain Grain Wholesalers",
    rating: 4.6,
    image: "🌾",
  },
];

const INITIAL_RIDERS: Rider[] = [
  {
    id: "r1",
    name: "Juma Boda Express",
    phone: "+254 712 345 678",
    lat: -1.286389,
    lng: 36.817223,
    vehicle: "Motorcycle (KMDM 293X)",
    rating: 4.9,
    earningsToday: 12400,
    completedTrips: 38,
  },
];

const INITIAL_WHOLESALERS: Wholesaler[] = [
  {
    id: "w1",
    name: "Mwamba Millers Wholesale",
    phone: "+254 722 999 888",
    balanceReleased: 184500,
    balanceEscrow: 0,
    subscriptionPlan: "Enterprise",
    rating: 4.8,
  },
  {
    id: "w2",
    name: "Bargain Grain Wholesalers",
    phone: "+254 733 444 555",
    balanceReleased: 94000,
    balanceEscrow: 0,
    subscriptionPlan: "Growth",
    rating: 4.4,
  },
  {
    id: "w3",
    name: "Coastal Oils & Fats Ltd",
    phone: "+254 711 222 333",
    balanceReleased: 320000,
    balanceEscrow: 0,
    subscriptionPlan: "Free",
    rating: 4.7,
  },
];

const INITIAL_COUPONS: Coupon[] = [
  { code: "BABAOYA", discountPercent: 10, description: "10% off for new wholesale businesses" },
  { code: "SOMA50", discountPercent: 5, description: "KES 500 equivalent discount on agricultural produce" },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>(INITIAL_WHOLESALERS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([
    {
      id: "a1",
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      action: "System JWT token issued for wholesaler admin @Mwamba",
      ip: "197.248.31.254",
      status: "success",
    },
    {
      id: "a2",
      timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
      action: "Rate-limiting monitor: client requests normal (42 req/min)",
      ip: "102.135.2.14",
      status: "success",
    },
  ]);
  const [telemetry, setTelemetry] = useState<AdminTelemetry>({
    gmv: 498400,
    totalCommissions: 29904,
    activeRiders: 1,
    activeWholesalers: 3,
    fraudAlerts: 0,
  });

  const [currentRole, setCurrentRole] = useState<"customer" | "wholesaler" | "rider" | "admin">("customer");
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isStkModalOpen, setIsStkModalOpen] = useState(false);

  useEffect(() => {
    if (!activeOrderId) return;
    const order = orders.find((o) => o.id === activeOrderId);
    if (!order || !order.riderId) return;

    const interval = setInterval(() => {
      setRiders((prevRiders) =>
        prevRiders.map((r) => {
          if (r.id !== order.riderId) return r;
          
          let targetLat = -1.286389;
          let targetLng = 36.817223;
          
          if (order.status === "RiderAssigned") {
            targetLat = -1.278;
            targetLng = 36.801;
          } else if (order.status === "InTransit") {
            targetLat = order.customerLocation.lat;
            targetLng = order.customerLocation.lng;
          } else {
            return r;
          }

          const step = 0.0015;
          const dLat = targetLat - r.lat;
          const dLng = targetLng - r.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          if (dist < 0.002) {
            return { ...r, lat: targetLat, lng: targetLng };
          }

          return {
            ...r,
            lat: r.lat + (dLat / dist) * step,
            lng: r.lng + (dLng / dist) * step,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrderId, orders]);

  const addSystemToast = (title: string, message: string, type: Notification["type"]) => {
    const newNotif: Notification = {
      id: "toast-" + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    addSystemToast("Cart Updated", `Added bulk quantity of ${product.name} to checkout list.`, "in-app");
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const coupon = INITIAL_COUPONS.find((c) => c.code.toLowerCase() === code.toLowerCase());
    if (coupon) {
      setAppliedCoupon(coupon);
      addSystemToast("Coupon Applied", `Received ${coupon.discountPercent}% off on base wholesale cost.`, "in-app");
      return true;
    }
    addSystemToast("Invalid Coupon", "Please double-check code spelling and try again.", "in-app");
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const initiateStkPush = async (phone: string) => {
    if (cart.length === 0) return;
    setIsStkModalOpen(true);
    addSystemToast("STK Push Sent", `Safaricom M-Pesa push initiated to ${phone}. Enter secret PIN to authorize.`, "sms");
  };

  const submitStkPin = (pin: string) => {
    if (pin.length < 4) {
      addSystemToast("Security Alert", "STK PIN must be exactly 4 digits.", "sms");
      return;
    }
    
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
    const tax = Math.round((subtotal - discount) * 0.16);
    const deliveryFee = 350;
    const total = subtotal - discount + tax + deliveryFee;
    const commission = Math.round(subtotal * 0.06);
    
    const uniqueOrderId = "W-" + Math.floor(10000 + Math.random() * 90000).toString();
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: Order = {
      id: uniqueOrderId,
      items: [...cart],
      subtotal,
      tax,
      deliveryFee,
      discount,
      total,
      platformCommission: commission,
      status: "EscrowPaid",
      customerId: "cust-1",
      customerName: "John Kamau (Nairobi Retailer)",
      customerPhone: "+254 700 111 222",
      customerLocation: { lat: -1.2921, lng: 36.8219, name: "Nairobi Central Business District" },
      wholesalerId: cart[0].product.wholesalerId,
      wholesalerName: cart[0].product.wholesalerName,
      otp: otpCode,
      createdAt: new Date().toLocaleTimeString(),
    };

    setWholesalers((prev) =>
      prev.map((w) =>
        w.id === newOrder.wholesalerId
          ? { ...w, balanceEscrow: w.balanceEscrow + (total - commission) }
          : w
      )
    );

    setTelemetry((t) => ({
      ...t,
      gmv: t.gmv + total,
      totalCommissions: t.totalCommissions + commission,
    }));

    const newLog: SecurityAuditLog = {
      id: "log-" + Math.random().toString(),
      timestamp: new Date().toLocaleTimeString(),
      action: `M-Pesa Escrow Paid successfully: ${uniqueOrderId} | Commission 6% (KES ${commission}) reserved`,
      ip: "197.248.98.11",
      status: "success",
    };
    
    setAuditLogs((prev) => [newLog, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrderId(uniqueOrderId);
    setIsStkModalOpen(false);
    clearCart();

    addSystemToast(
      "M-Pesa Confirm",
      `Ksh ${total} sent to wholesale platform escrow. Ref ID: QTX817077Y`,
      "sms"
    );

    setTimeout(() => {
      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if (o.id === uniqueOrderId) {
            addSystemToast(
              "Rider Matched",
              `Juma Boda Express is picking up your wholesale bundle! OTP for release: ${otpCode}`,
              "push"
            );
            return {
              ...o,
              status: "RiderAssigned",
              riderId: "r1",
              riderName: "Juma Boda Express",
              riderPhone: "+254 712 345 678",
            };
          }
          return o;
        })
      );
    }, 3000);
  };

  const acceptOrder = (orderId: string, riderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "RiderAssigned", riderId, riderName: "Juma Boda Express" }
          : o
      )
    );
    addSystemToast("Delivery Accepted", `Rider matched for order ${orderId}`, "push");
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        
        let msg = "";
        if (status === "PickedUp") msg = "Rider loaded items at wholesale depot.";
        if (status === "InTransit") msg = "Delivery is on the way. Live GPS navigation active.";
        if (status === "Delivered") msg = "Arrived! Awaiting customer secure OTP confirmation.";
        
        addSystemToast("Delivery System", msg, "push");
        return { ...o, status };
      })
    );
  };

  const verifyDeliveryOtp = (orderId: string, otpInput: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    if (order.otp === otpInput) {
      const payoutAmount = order.total - order.platformCommission;
      setWholesalers((prev) =>
        prev.map((w) =>
          w.id === order.wholesalerId
            ? {
                ...w,
                balanceEscrow: Math.max(0, w.balanceEscrow - payoutAmount),
                balanceReleased: w.balanceReleased + payoutAmount,
              }
            : w
        )
      );

      setRiders((prev) =>
        prev.map((r) =>
          r.id === order.riderId
            ? { ...r, earningsToday: r.earningsToday + order.deliveryFee, completedTrips: r.completedTrips + 1 }
            : r
        )
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Completed" } : o))
      );

      addSystemToast(
        "Escrow Completed",
        `Funds released: KES ${payoutAmount} credited to ${order.wholesalerName}.`,
        "email"
      );
      
      const newLog: SecurityAuditLog = {
        id: "log-" + Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        action: `OTP release success for ${orderId}. Wholesaler payouts authorized secure escrow.`,
        ip: "102.135.122.9",
        status: "success",
      };
      setAuditLogs((prev) => [newLog, ...prev]);
      return true;
    }

    addSystemToast("Security Alert", "Invalid secure release OTP code. Payout suspended.", "in-app");
    return false;
  };

  const uploadDeliveryPhoto = (orderId: string, photoUrl: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, deliveryPhoto: photoUrl } : o))
    );
    addSystemToast("Security System", "Delivery photo proof uploaded to blockchain log.", "push");
  };

  const sendRiderMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: "msg-" + Math.random().toString(),
      sender: currentRole === "customer" ? "customer" : "rider",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const updateProduct = (productId: string, price: number, stock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, price, stock } : p))
    );
    addSystemToast("Inventory Synced", `Product updated: KES ${price}, Stock: ${stock}`, "in-app");
  };

  const upgradeSubscription = (wholesalerId: string, plan: "Growth" | "Enterprise") => {
    setWholesalers((prev) =>
      prev.map((w) => (w.id === wholesalerId ? { ...w, subscriptionPlan: plan } : w))
    );
    addSystemToast("Premium Upgrade", `Subscribed to ${plan} services! Advanced analytics unlocked.`, "email");
  };

  const aiChat = async (text: string, language: "en" | "sw") => {
    const lower = text.toLowerCase();
    let reply = "";
    
    if (language === "sw") {
      if (lower.includes("bei") || lower.includes("rahisi") || lower.includes("pembe")) {
        reply = "Mshauri AI: Nimepata kabla ya Pembe! Unaweza kupata 'Hodari Maize Flour Premium' kwa KES 2,950 badala ya KES 3,400. Unaokoa KES 450! Bofya kitufe cha kubadilisha hapa chini ili kuongeza kwenye rukwama.";
      } else if (lower.includes("akiba") || lower.includes("sukari") || lower.includes("stock")) {
        reply = "Mshauri AI: Tahadhari ya Ghala! Sukari ya Kabras huko Mwamba Millers inaweza kuisha baada ya siku 3 kutokana na mahitaji makubwa ya kaunti.";
      } else if (lower.includes("hujambo") || lower.includes("mambo")) {
        reply = "Hujambo! Mimi ni Mshauri AI, msaidizi wako mahiri wa soko la jumla. Naweza kukusaidia kulinganisha bei na kupata ofa bora.";
      } else {
        reply = "Samahani, sijafahamu vizuri swaliako. Lakini naweza kukusaidia kulinganisha bei za bidhaa kama unga wa mahindi au sukari.";
      }
    } else {
      if (lower.includes("price") || lower.includes("cheap") || lower.includes("maize") || lower.includes("pembe")) {
        reply = "Mshauri AI: Price Smart-match found! You can purchase 'Hodari Maize Flour Premium' for KES 2,950 instead of Pembe (KES 3,400). That's a KES 450 discount! Click 'Swap and Add' below.";
      } else if (lower.includes("shortage") || lower.includes("sugar") || lower.includes("inventory")) {
        reply = "Mshauri AI: Predictive Shortage alert! Kabras Sugar stock at Mwamba Millers is declining fast and will deplete in 3 days. Recommend restocking now.";
      } else if (lower.includes("fraud") || lower.includes("secure") || lower.includes("limit")) {
        reply = "Mshauri AI Security Scan: Zero abnormal transaction patterns detected today. System is clean and running securely on 2FA protocols.";
      } else if (lower.includes("hello") || lower.includes("hi")) {
        reply = "Hello! I am Mshauri AI, your premium business assistant. I can recommend cheaper alternative products, predict shortages, or optimize your bulk pricing.";
      } else {
        reply = "I understand! Let me know if you would like me to generate a custom sales insight report or analyze your current wholesale inventory.";
      }
    }

    return reply;
  };

  return (
    <AppContext.Provider
      value={{
        products,
        orders,
        riders,
        wholesalers,
        chatMessages,
        notifications,
        auditLogs,
        telemetry,
        coupons: INITIAL_COUPONS,
        currentRole,
        setCurrentRole,
        darkMode,
        setDarkMode,
        activeOrderId,
        setActiveOrderId,
        rateLimitEnabled,
        setRateLimitEnabled,
        twoFactorEnabled,
        setTwoFactorEnabled,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
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
        uploadDeliveryPhoto,
        sendRiderMessage,
        updateProduct,
        upgradeSubscription,
        aiChat,
        addSystemToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return context;
};
