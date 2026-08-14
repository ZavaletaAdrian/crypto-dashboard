import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  retryAvailableAt: number | null;
}

export function RefreshButton({ onRefresh, isRefreshing, retryAvailableAt }: RefreshButtonProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (retryAvailableAt === null) return;
    setNow(Date.now()); // avoid showing a stale countdown until the first 1s tick
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= retryAvailableAt) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [retryAvailableAt]);

  const remainingMs = retryAvailableAt !== null ? Math.max(0, retryAvailableAt - now) : 0;
  const isWaiting = remainingMs > 0;
  const disabled = isRefreshing || isWaiting;

  const label = isRefreshing ? "Refreshing…" : isWaiting ? `Retry in ${Math.ceil(remainingMs / 1000)}s` : "Refresh";

  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
      {label}
    </button>
  );
}
