import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// A JSX comment ({/* ... */}) never reaches rendered output — the JSX
// transform strips it, same as any other in-source comment — so the
// direction contract has to ship as a real HTML comment via
// dangerouslySetInnerHTML, inside an inert <template> (never rendered,
// never in the a11y tree, zero layout impact) so it still survives the
// production build as grep-able markup.
const DIRECTION_CONTRACT = `<!--
  THESIS: The numbers are the instrument — each price lives on its own glowing
  digit-tube bank, not a flat number in a card.
  OWN-WORLD: Blackened-steel/brushed-steel chassis, one committed warm-amber
  glow as the signal color, hairline anode-mesh grays, tabular-mono digit
  readouts, small lit indicator lamps for trend/freshness (never color-alone).
  STORY: A glance reads live market state the way a technician reads a panel
  of instruments — trustworthy, physical, legible at a distance.
  FIRST VIEWPORT: The required card grid stays, but each card is a chassis
  panel: a digit-tube price readout, a lamp cluster for trend/freshness, a
  re-skinned drag handle. Signature interaction: price updates cross-fade
  between digit layers like a physical depth change, gated by reduced-motion.
  FORM: Nixie-Tube Instrument Panel — assigned direction, beat by the fused
  "nixie-laboratory-counter" catalog challenger on product clarity (exact
  digits vs. a VU needle's continuous level); seed key e5563037.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, DESIGN.md, and every shipping raster carrying
  its provenance.
-->`;

const THEME_INIT_SCRIPT = `
  (function () {
    var stored = null;
    try {
      stored = localStorage.getItem("theme");
    } catch (e) {}
    try {
      var isDark = stored === "dark" || stored === "light"
        ? stored === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", isDark);
    } catch (e) {}
  })();
`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Runs before first paint so there's no flash of the wrong theme —
            must stay a plain blocking script, not something React hydrates. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <template dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
