import { Search } from "lucide-react";

interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FilterInput({ value, onChange }: FilterInputProps) {
  return (
    <div className="relative max-w-xs">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Filter by name or symbol…"
        aria-label="Filter cryptocurrencies"
        className="w-full rounded-lg border border-gray-300 py-1.5 pr-3 pl-9 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:outline-gray-100"
      />
    </div>
  );
}
