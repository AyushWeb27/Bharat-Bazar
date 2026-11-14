"use client";
import type { RealtimeStatus } from "@/hooks/useRealtimeQuery";

const STATUS: Record<RealtimeStatus, { dot: string; label: string; text: string }> = {
  live:       { dot: "bg-green-500",                label: "Live",           text: "text-green-600"  },
  connecting: { dot: "bg-yellow-400 animate-pulse", label: "Connecting...",  text: "text-yellow-600" },
  stale:      { dot: "bg-orange-400 animate-pulse", label: "Reconnecting...",text: "text-orange-600" },
  error:      { dot: "bg-red-500",                  label: "Offline",        text: "text-red-600"    },
  closed:     { dot: "bg-gray-400",                 label: "Closed",         text: "text-gray-500"   },
};

export function RealtimeBadge({ status }: { status: RealtimeStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${s.text}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
