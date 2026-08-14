interface FilterInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function FilterInput({ value, onChange }: FilterInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Filter by name or symbol…"
      aria-label="Filter cryptocurrencies"
      className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
    />
  );
}
