export interface Product {
  id: string;
  name: string;
  category: string;
  price: number; // in KES (Kenya Shillings)
  bulkQty: number; // e.g. 50 (50kg bag)
  unit: string; // e.g. "Bag", "Box", "Carton"
  stock: number;
  wholesalerId: string;
  wholesalerName: string;
  rating: number;
  image: string;
  cheaperAlternativeId?: string; // AI price comparisons
}

export interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export type OrderStatus =
  | "PendingPayment"
  | "EscrowPaid"
  | "RiderAssigned"
  | "PickedUp"
  | "InTransit"
  | "Delivered"
  | "Completed";

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number; // 16% VAT
  deliveryFee: number;
  discount: number;
  total: number;
  platformCommission: number; // 6% of items subtotal
  status: OrderStatus;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerLocation: { lat: number; lng: number; name: string };
  wholesalerId: string;
  wholesalerName: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  otp: string; // Secure release OTP
  deliveryPhoto?: string;
  createdAt: string;
}

export interface Rider {
  id: string;
  name: string;
  phone: string;
  lat: number;
  lng: number;
  vehicle: string;
  rating: number;
  earningsToday: number;
  completedTrips: number;
}

export interface Wholesaler {
  id: string;
  name: string;
  phone: string;
  balanceReleased: number;
  balanceEscrow: number;
  subscriptionPlan: "Free" | "Growth" | "Enterprise";
  rating: number;
}

export interface ChatMessage {
  id: string;
  sender: "customer" | "rider" | "wholesaler" | "ai";
  text: string;
  timestamp: string;
  language?: "en" | "sw" | "so";
}

export interface Notification {
  id: string;
  type: "push" | "sms" | "email" | "in-app";
  title: string;
  message: string;
  timestamp: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  action: string;
  ip: string;
  status: "success" | "warning" | "error";
}

export interface AdminTelemetry {
  gmv: number;
  totalCommissions: number;
  activeRiders: number;
  activeWholesalers: number;
  fraudAlerts: number;
}
