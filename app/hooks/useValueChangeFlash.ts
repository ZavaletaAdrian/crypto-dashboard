import { useEffect, useRef, useState } from "react";

const FLASH_DURATION_MS = 260;

/**
 * True for FLASH_DURATION_MS immediately after `value` changes from what it
 * was last render, then false again — drives the digit-tube cross-fade
 * (CryptoCard's `data-changed` attribute). Never true on mount (nothing
 * "changed" from nothing), and never true if the formatted string is the
 * same even though the underlying rate re-rendered (e.g. a poll tick that
 * didn't move the price).
 */
export function useValueChangeFlash(value: string): boolean {
  const previous = useRef(value);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setChanged(true);
    const id = setTimeout(() => setChanged(false), FLASH_DURATION_MS);
    return () => clearTimeout(id);
  }, [value]);

  return changed;
}
