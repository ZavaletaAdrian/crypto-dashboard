// Bundled offline at build time (via the cryptocurrency-icons package) rather
// than fetched from a CDN at runtime — one less external network dependency,
// consistent with this app's resilience stance elsewhere (T4): a coin's logo
// never fails to load just because some third-party image host is down.
import ada from "cryptocurrency-icons/svg/color/ada.svg";
import atom from "cryptocurrency-icons/svg/color/atom.svg";
import avax from "cryptocurrency-icons/svg/color/avax.svg";
import bch from "cryptocurrency-icons/svg/color/bch.svg";
import btc from "cryptocurrency-icons/svg/color/btc.svg";
import doge from "cryptocurrency-icons/svg/color/doge.svg";
import dot from "cryptocurrency-icons/svg/color/dot.svg";
import etc from "cryptocurrency-icons/svg/color/etc.svg";
import eth from "cryptocurrency-icons/svg/color/eth.svg";
import link from "cryptocurrency-icons/svg/color/link.svg";
import ltc from "cryptocurrency-icons/svg/color/ltc.svg";
import sol from "cryptocurrency-icons/svg/color/sol.svg";
import trx from "cryptocurrency-icons/svg/color/trx.svg";
import uni from "cryptocurrency-icons/svg/color/uni.svg";
import usdc from "cryptocurrency-icons/svg/color/usdc.svg";
import usdt from "cryptocurrency-icons/svg/color/usdt.svg";
import xlm from "cryptocurrency-icons/svg/color/xlm.svg";
import xrp from "cryptocurrency-icons/svg/color/xrp.svg";

export const COIN_ICON_URLS: Partial<Record<string, string>> = {
  ADA: ada,
  ATOM: atom,
  AVAX: avax,
  BCH: bch,
  BTC: btc,
  DOGE: doge,
  DOT: dot,
  ETC: etc,
  ETH: eth,
  LINK: link,
  LTC: ltc,
  SOL: sol,
  TRX: trx,
  UNI: uni,
  USDC: usdc,
  USDT: usdt,
  XLM: xlm,
  XRP: xrp,
};
