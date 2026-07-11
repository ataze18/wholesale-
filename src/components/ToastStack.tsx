import { useAppState } from "../state";
import { Bell, MessageSquare, Mail, Smartphone } from "lucide-react";

const ICONS: Record<string, typeof Bell> = {
  push: Bell,
  sms: Smartphone,
  email: Mail,
  "in-app": MessageSquare,
};

export default function ToastStack() {
  const { notifications } = useAppState();
  const visible = notifications.slice(0, 3);

  if (visible.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none">
      {visible.map((n) => {
        const Icon = ICONS[n.type] ?? Bell;
        return (
          <div
            key={n.id}
            className="animate-toast-in pointer-events-auto bg-navy-900 border border-gold-500/30 rounded-lg shadow-xl px-4 py-3 flex gap-3 items-start"
          >
            <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-gold-500/15 flex items-center justify-center">
              <Icon size={14} className="text-gold-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">{n.title}</p>
              <p className="text-xs text-white/60 leading-snug mt-0.5">{n.message}</p>
            </div>
            <span className="ml-auto text-[10px] text-white/30 shrink-0">{n.timestamp}</span>
          </div>
        );
      })}
    </div>
  );
}
