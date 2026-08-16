import { Search } from "lucide-react";

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FilterInput({ value, onChange }: FilterInputProps) {
  return (
    <div className="relative max-w-xs">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--panel-text-secondary)]"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Filter by name or symbol…"
        aria-label="Filter cryptocurrencies"
        className="w-full rounded-lg border border-[var(--panel-border)] bg-[var(--panel-chassis)] py-1.5 pr-3 pl-9 text-sm text-[var(--panel-text-primary)] placeholder:text-[var(--panel-text-secondary)] focus:border-[var(--panel-amber)]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--panel-amber)]"
      />
    </div>
  );
}
