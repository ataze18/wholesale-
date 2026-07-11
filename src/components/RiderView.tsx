import { useState } from "react";
import { useAppState } from "../state";
import { Bike, MapPin, Package, Camera, Wallet, TrendingUp, ChevronRight } from "lucide-react";

const NEXT_STATUS: Record<string, string | null> = {
  RiderAssigned: "PickedUp",
  PickedUp: "InTransit",
  InTransit: "Delivered",
};

const ACTION_LABEL: Record<string, string> = {
  RiderAssigned: "Confirm pickup",
  PickedUp: "Start delivery",
  InTransit: "Mark delivered",
};

export default function RiderView() {
  const { orders, riders, acceptOrder, updateOrderStatus, uploadDeliveryPhoto } = useAppState();
  const rider = riders[0];
  const [confirmingPickup, setConfirmingPickup] = useState<string | null>(null);

  const unassigned = orders.filter((o) => o.status === "EscrowPaid");
  const active = orders.filter(
    (o) => o.riderId === rider.id && !["Completed", "EscrowPaid"].includes(o.status)
  );
  const completed = orders.filter((o) => o.riderId === rider.id && o.status === "Completed");

  return (
    <div className="px-4 sm:px-6 pt-6 pb-16 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950">{rider.name}</h1>
        <p className="text-sm text-navy-900/50">{rider.vehicle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-navy-950/8 p-4">
          <Wallet size={16} className="text-gold-500 mb-2" />
          <p className="text-lg font-display font-semibold text-navy-950">
            KES {rider.earningsToday.toLocaleString()}
          </p>
          <p className="text-xs text-navy-900/45">Earnings today</p>
        </div>
        <div className="bg-white rounded-xl border border-navy-950/8 p-4">
          <TrendingUp size={16} className="text-green-600 mb-2" />
          <p className="text-lg font-display font-semibold text-navy-950">{rider.completedTrips}</p>
          <p className="text-xs text-navy-900/45">Completed trips</p>
        </div>
      </div>

      {active.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-navy-950 mb-3">Active delivery</h2>
          {active.map((o) => (
            <div key={o.id} className="bg-navy-950 rounded-2xl p-5 text-white mb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs bg-white/10 rounded-full px-2 py-1">{o.status}</span>
                <span className="text-xs text-white/50">{o.id}</span>
              </div>
              <p className="font-display font-semibold">{o.wholesalerName}</p>
              <div className="flex items-center gap-1.5 text-white/60 text-sm mt-1">
                <MapPin size={13} /> {o.customerLocation.name}
              </div>
              <p className="text-white/60 text-sm mt-1">{o.customerName} · {o.customerPhone}</p>

              {o.status === "Delivered" ? (
                <div className="mt-4 bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-white/60 mb-2">Awaiting customer OTP to release payment.</p>
                  {!o.deliveryPhoto ? (
                    <button
                      onClick={() => uploadDeliveryPhoto(o.id, "captured")}
                      className="flex items-center gap-2 text-xs bg-white/10 rounded-lg px-3 py-2 font-medium focus-ring"
                    >
                      <Camera size={14} /> Upload delivery photo
                    </button>
                  ) : (
                    <p className="text-xs text-green-400">✓ Delivery photo uploaded</p>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (o.status === "RiderAssigned" && confirmingPickup !== o.id) {
                      setConfirmingPickup(o.id);
                      return;
                    }
                    const next = NEXT_STATUS[o.status];
                    if (next) updateOrderStatus(o.id, next as any);
                    setConfirmingPickup(null);
                  }}
                  className="mt-4 w-full h-11 rounded-lg bg-gold-500 text-navy-950 font-semibold text-sm focus-ring"
                >
                  {o.status === "RiderAssigned" && confirmingPickup === o.id
                    ? "Confirm you have the goods — tap again"
                    : ACTION_LABEL[o.status]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold text-navy-950 mb-3">Available deliveries</h2>
        {unassigned.length === 0 ? (
          <p className="text-sm text-navy-900/45">No deliveries waiting right now.</p>
        ) : (
          <div className="space-y-2">
            {unassigned.map((o) => (
              <div key={o.id} className="bg-white rounded-xl border border-navy-950/8 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-950/5 flex items-center justify-center shrink-0">
                  <Package size={16} className="text-navy-900/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-950">{o.wholesalerName}</p>
                  <p className="text-xs text-navy-900/45 truncate">→ {o.customerLocation.name}</p>
                </div>
                <button
                  onClick={() => acceptOrder(o.id, rider.id)}
                  className="flex items-center gap-1 text-xs bg-navy-950 text-white rounded-lg px-3 py-2 font-medium focus-ring shrink-0"
                >
                  <Bike size={12} /> Accept <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-navy-950 mb-3">Completed today</h2>
          <div className="bg-white rounded-2xl border border-navy-950/8 divide-y divide-navy-950/5">
            {completed.map((o) => (
              <div key={o.id} className="p-3 flex items-center justify-between text-sm">
                <span className="text-navy-950">{o.id}</span>
                <span className="text-navy-900/45">KES {o.deliveryFee}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
