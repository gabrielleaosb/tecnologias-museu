import Link from "next/link";

const rotas = [
  { href: "/sala1/tablet", label: "Sala 1 — Tablet" },
  { href: "/sala1/tv", label: "Sala 1 — TV" },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-950 text-white">
      <h1 className="text-2xl font-semibold">Museu do Sertão de Piranhas — Painel de dev</h1>
      <div className="flex flex-col gap-3">
        {rotas.map((rota) => (
          <Link key={rota.href} href={rota.href} className="underline">
            {rota.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
