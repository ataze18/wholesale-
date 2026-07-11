import { useAppState } from "./state";
import CustomerView from "./components/CustomerView";
import WholesalerView from "./components/WholesalerView";
import RiderView from "./components/RiderView";
import AdminView from "./components/AdminView";
import ToastStack from "./components/ToastStack";
import StkPushModal from "./components/StkPushModal";
import { ShoppingBag, Store, Bike, ShieldCheck } from "lucide-react";

const ROLES = [
  { key: "customer", label: "Buyer", icon: ShoppingBag },
  { key: "wholesaler", label: "Wholesaler", icon: Store },
  { key: "rider", label: "Rider", icon: Bike },
  { key: "admin", label: "Admin", icon: ShieldCheck },
] as const;

export default function App() {
  const { currentRole, setCurrentRole } = useAppState();

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <header className="sticky top-0 z-50 bg-navy-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
              <span className="font-display font-bold text-navy-950 text-sm">B</span>
            </div>
            <span className="font-display font-semibold tracking-wide">BulkFlow</span>
          </div>
          <nav className="flex items-center gap-1 bg-white/5 rounded-full p-1">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = currentRole === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setCurrentRole(r.key)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors focus-ring ${
                    active ? "bg-gold-500 text-navy-950" : "text-white/60 hover:text-white"
                  }`}
                >
                  <Icon size={13} />
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {currentRole === "customer" && <CustomerView />}
        {currentRole === "wholesaler" && <WholesalerView />}
        {currentRole === "rider" && <RiderView />}
        {currentRole === "admin" && <AdminView />}
      </main>

      <ToastStack />
      <StkPushModal />
    </div>
  );
}
