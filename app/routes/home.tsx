import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Crypto Dashboard" },
    { name: "description", content: "Live cryptocurrency exchange rates" },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold">Crypto Dashboard</h1>
      <p className="mt-2 text-gray-500">Coming soon.</p>
    </main>
  );
}
