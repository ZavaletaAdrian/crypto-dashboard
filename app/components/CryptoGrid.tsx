import { CryptoCard } from "./CryptoCard";
import type { Coin, CoinRate } from "~/types/coin";

interface CryptoGridProps {
  coins: Coin[];
  rates: Record<string, CoinRate>;
}

export function CryptoGrid({ coins, rates }: CryptoGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {coins.map((coin) => (
        <CryptoCard key={coin.code} coin={coin} rate={rates[coin.code]} />
      ))}
    </div>
  );
}
