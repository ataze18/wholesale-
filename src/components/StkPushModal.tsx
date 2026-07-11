import { useState } from "react";
import { useAppState } from "../state";
import { X, Smartphone, ShieldCheck } from "lucide-react";

export default function StkPushModal() {
  const { isStkModalOpen, setIsStkModalOpen, submitStkPin, cart } = useAppState();
  const [pin, setPin] = useState("");

  if (!isStkModalOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-6 relative animate-toast-in">
        <button
          onClick={() => setIsStkModalOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 text-navy-900/40 hover:text-navy-900 focus-ring rounded"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Smartphone size={22} className="text-green-700" />
        </div>

        <h2 className="font-display text-lg font-semibold text-navy-950">M-Pesa STK Push</h2>
        <p className="text-sm text-navy-900/60 mt-1 leading-snug">
          A prompt has been sent to your phone. Enter your M-Pesa PIN below to authorize payment of{" "}
          <span className="font-semibold text-navy-950">KES {total.toLocaleString()}</span> into secure escrow.
        </p>

        <div className="flex justify-center gap-3 my-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-11 h-13 h-[52px] rounded-lg border-2 flex items-center justify-center text-lg font-semibold ${
                i < pin.length ? "border-green-600 bg-green-50 text-navy-950" : "border-navy-950/10 text-navy-950/20"
              }`}
            >
              {i < pin.length ? "•" : ""}
            </div>
          ))}
        </div>

        <input
          autoFocus
          inputMode="numeric"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="sr-only"
          aria-label="M-Pesa PIN"
        />

        <div className="grid grid-cols-3 gap-2 mb-4">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"].map((k, idx) =>
            k === "" ? (
              <div key={idx} />
            ) : (
              <button
                key={idx}
                onClick={() =>
                  k === "back" ? setPin((p) => p.slice(0, -1)) : setPin((p) => (p.length < 4 ? p + k : p))
                }
                className="h-12 rounded-lg bg-navy-950/5 hover:bg-navy-950/10 font-medium text-navy-950 focus-ring transition-colors"
              >
                {k === "back" ? "⌫" : k}
              </button>
            )
          )}
        </div>

        <button
          disabled={pin.length !== 4}
          onClick={() => {
            submitStkPin(pin);
            setPin("");
          }}
          className="w-full h-12 rounded-lg bg-navy-950 text-white font-semibold disabled:opacity-30 flex items-center justify-center gap-2 focus-ring"
        >
          <ShieldCheck size={16} /> Authorize Payment
        </button>
        <p className="text-[11px] text-center text-navy-900/40 mt-3">
          Funds held in escrow until delivery is confirmed by OTP.
        </p>
      </div>
    </div>
  );
}
