import { useState } from "react";
import { useAppState } from "../state";
import { Package, Wallet, TrendingUp, Star, Crown, Check } from "lucide-react";

export default function WholesalerView() {
  const { products, updateProduct, wholesalers, orders, upgradeSubscription } = useAppState();
  const wholesaler = wholesalers[0];
  const myProducts = products.filter((p) => p.wholesalerId === wholesaler.id);
  const myOrders = orders.filter((o) => o.wholesalerId === wholesaler.id);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ price: 0, stock: 0 });

  return (
    <div className="px-4 sm:px-6 pt-6 pb-16 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950">{wholesaler.name}</h1>
        <div className="flex items-center gap-1 mt-1">
          <Star size={13} className="fill-gold-500 text-gold-500" />
          <span className="text-sm text-navy-900/55">{wholesaler.rating} wholesaler rating</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-navy-950/8 p-4">
          <Wallet size={16} className="text-gold-500 mb-2" />
          <p className="text-lg font-display font-semibold text-navy-950">
            KES {wholesaler.balanceReleased.toLocaleString()}
          </p>
          <p className="text-xs text-navy-900/45">Released balance</p>
        </div>
        <div className="bg-white rounded-xl border border-navy-950/8 p-4">
          <Package size={16} className="text-navy-900/40 mb-2" />
          <p className="text-lg font-display font-semibold text-navy-950">
            KES {wholesaler.balanceEscrow.toLocaleString()}
          </p>
          <p className="text-xs text-navy-900/45">In escrow</p>
        </div>
        <div className="bg-white rounded-xl border border-navy-950/8 p-4">
          <TrendingUp size={16} className="text-green-600 mb-2" />
          <p className="text-lg font-display font-semibold text-navy-950">{myOrders.length}</p>
          <p className="text-xs text-navy-900/45">Total orders</p>
        </div>
        <div className="bg-white rounded-xl border border-navy-950/8 p-4">
          <Crown size={16} className="text-gold-500 mb-2" />
          <p className="text-lg font-display font-semibold text-navy-950">{wholesaler.subscriptionPlan}</p>
          <p className="text-xs text-navy-900/45">Plan</p>
        </div>
      </div>

      {wholesaler.subscriptionPlan !== "Enterprise" && (
        <div className="bg-navy-950 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-gold-400 text-xs font-medium uppercase tracking-wide">Grow your reach</p>
            <p className="text-white font-display text-lg font-semibold mt-1">
              Upgrade to unlock advanced demand forecasting
            </p>
            <p className="text-white/50 text-sm mt-1">
              Priority placement, AI reorder predictions, and fraud protection insights.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {wholesaler.subscriptionPlan === "Free" && (
              <button
                onClick={() => upgradeSubscription(wholesaler.id, "Growth")}
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium focus-ring"
              >
                Growth
              </button>
            )}
            <button
              onClick={() => upgradeSubscription(wholesaler.id, "Enterprise")}
              className="px-4 py-2 rounded-lg bg-gold-500 text-navy-950 text-sm font-semibold focus-ring"
            >
              Enterprise
            </button>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-display text-lg font-semibold text-navy-950 mb-3">Inventory</h2>
        <div className="bg-white rounded-2xl border border-navy-950/8 divide-y divide-navy-950/5">
          {myProducts.map((p) => (
            <div key={p.id} className="p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-navy-950/5 flex items-center justify-center text-2xl shrink-0">
                {p.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy-950 truncate">{p.name}</p>
                {editing === p.id ? (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="number"
                      value={draft.price}
                      onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                      className="w-24 text-xs rounded-lg border border-navy-950/15 px-2 py-1.5 focus-ring"
                      aria-label="Price"
                    />
                    <input
                      type="number"
                      value={draft.stock}
                      onChange={(e) => setDraft((d) => ({ ...d, stock: Number(e.target.value) }))}
                      className="w-20 text-xs rounded-lg border border-navy-950/15 px-2 py-1.5 focus-ring"
                      aria-label="Stock"
                    />
                    <button
                      onClick={() => {
                        updateProduct(p.id, draft.price, draft.stock);
                        setEditing(null);
                      }}
                      className="text-xs bg-navy-950 text-white rounded-lg px-3 focus-ring"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-navy-900/45">
                    KES {p.price.toLocaleString()} · {p.stock} in stock
                  </p>
                )}
              </div>
              {editing !== p.id && (
                <button
                  onClick={() => {
                    setEditing(p.id);
                    setDraft({ price: p.price, stock: p.stock });
                  }}
                  className="text-xs text-navy-900/50 hover:text-navy-950 font-medium focus-ring rounded shrink-0"
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-navy-950 mb-3">Recent orders</h2>
        {myOrders.length === 0 ? (
          <p className="text-sm text-navy-900/45">No orders yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-navy-950/8 divide-y divide-navy-950/5">
            {myOrders.map((o) => (
              <div key={o.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-navy-950">{o.id}</p>
                  <p className="text-xs text-navy-900/45">{o.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-navy-950">KES {o.total.toLocaleString()}</p>
                  <p className="text-xs text-navy-900/45">{o.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
