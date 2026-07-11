import { useState } from "react";
import { useAppState } from "../state";
import {
  DollarSign,
  Percent,
  Bike,
  Store,
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Check,
  Sparkles,
} from "lucide-react";

const INITIAL_ALERTS = [
  { id: "al1", title: "Multiple checkout attempts", source: "IP 197.248.91.5 (Embakasi)", time: "8:51 PM" },
  { id: "al2", title: "Suspicious bulk quantity edit", source: "Mwamba Millers Wholesale", time: "8:44 PM" },
];

export default function AdminView() {
  const { telemetry, auditLogs, rateLimitEnabled, setRateLimitEnabled, twoFactorEnabled, setTwoFactorEnabled, orders, addSystemToast } =
    useAppState();
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    addSystemToast("Alert Cleared", "The security alert has been reviewed and resolved.", "in-app");
  };

  const stats = [
    { label: "Gross merchandise value", value: `KES ${telemetry.gmv.toLocaleString()}`, icon: DollarSign },
    { label: "Total commissions", value: `KES ${telemetry.totalCommissions.toLocaleString()}`, icon: Percent },
    { label: "Active riders", value: telemetry.activeRiders, icon: Bike },
    { label: "Active wholesalers", value: telemetry.activeWholesalers, icon: Store },
  ];

  return (
    <div className="px-4 sm:px-6 pt-6 pb-16 space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950">Platform Overview</h1>
        <p className="text-sm text-navy-900/50">Admin oversight & security console</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-navy-950/8 p-4">
            <s.icon size={16} className="text-gold-500 mb-2" />
            <p className="text-lg font-display font-semibold text-navy-950">{s.value}</p>
            <p className="text-xs text-navy-900/45">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-navy-950/8 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-green-600" />
          <h2 className="font-display text-lg font-semibold text-navy-950">Security controls</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock size={16} className="text-navy-900/40" />
              <div>
                <p className="text-sm font-medium text-navy-950">API rate limiting</p>
                <p className="text-xs text-navy-900/45">Throttle abnormal request bursts</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={rateLimitEnabled}
              onClick={() => setRateLimitEnabled(!rateLimitEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative focus-ring ${
                rateLimitEnabled ? "bg-navy-950" : "bg-navy-950/15"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  rateLimitEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <KeyRound size={16} className="text-navy-900/40" />
              <div>
                <p className="text-sm font-medium text-navy-950">Two-factor authentication</p>
                <p className="text-xs text-navy-900/45">Required for wholesaler admin logins</p>
              </div>
            </div>
            <button
              role="switch"
              aria-checked={twoFactorEnabled}
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative focus-ring ${
                twoFactorEnabled ? "bg-navy-950" : "bg-navy-950/15"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  twoFactorEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-gold-500" />
          <h2 className="font-display text-lg font-semibold text-navy-950">Fraud & support alerts</h2>
        </div>
        {alerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-navy-950/8 p-8 text-center">
            <p className="text-sm text-navy-900/50">No active alerts. Platform looks clean.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {alerts.map((a) => (
              <div key={a.id} className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-navy-950">{a.title}</p>
                  <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-100 rounded px-1.5 py-0.5 shrink-0">Active</span>
                </div>
                <p className="text-xs text-navy-900/50">{a.source} · {a.time}</p>
                <button
                  onClick={() => dismissAlert(a.id)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-white border border-navy-950/10 rounded-lg py-1.5 text-navy-900/70 focus-ring"
                >
                  <Check size={12} /> Dismiss & log resolved
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-navy-950 mb-3">Security audit log</h2>
        <div className="bg-white rounded-2xl border border-navy-950/8 divide-y divide-navy-950/5">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {log.status === "success" ? (
                  <ShieldCheck size={14} className="text-green-600" />
                ) : (
                  <ShieldAlert size={14} className="text-amber-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-navy-950 leading-snug">{log.action}</p>
                <p className="text-xs text-navy-900/40 mt-0.5">
                  {log.timestamp} · {log.ip}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-navy-950 mb-3">All orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-navy-900/45">No orders placed yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-navy-950/8 divide-y divide-navy-950/5">
            {orders.map((o) => (
              <div key={o.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-navy-950">{o.id}</p>
                  <p className="text-xs text-navy-900/45">
                    {o.wholesalerName} → {o.customerName}
                  </p>
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
