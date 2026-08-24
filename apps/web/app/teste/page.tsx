import Link from "next/link";

/**
 * Painel de testes: índice das rotas que já existem.
 *
 * Página interna — não vai para nenhum totem e não segue o protótipo.
 */

const GRUPOS = [
  {
    titulo: "Sala 1",
    destinos: [
      { href: "/sala1/tablet", nome: "Tablet" },
      { href: "/sala1/tv", nome: "TV" },
    ],
  },
  {
    titulo: "Escada",
    destinos: [
      { href: "/escada", nome: "Fluxo do depoimento" },
      { href: "/sala7", nome: "Sala 7 — galeria" },
    ],
  },
  { titulo: "Sala 6", destinos: [{ href: "/sala6", nome: "Jogo da memória" }] },
  { titulo: "Sala 8", destinos: [{ href: "/sala8/teste-voz", nome: "Reconhecimento de voz" }] },
  {
    titulo: "Administração",
    destinos: [
      { href: "/admin", nome: "Lista de depoimentos" },
      { href: "/admin/login", nome: "Login" },
    ],
  },
];

const cores = {
  fundo: "#2A1B10",
  texto: "#F5E6D8",
  suave: "#C4A78E",
  destaque: "#FFB50A",
} as const;

export default function TestePage() {
  return (
    <main
      className="min-h-screen px-8 py-12"
      style={{ backgroundColor: cores.fundo, color: cores.texto }}
    >
      <div className="mx-auto" style={{ maxWidth: "40rem" }}>
        <h1 className="mb-10 text-3xl font-bold">Museu do Sertão — painel de testes</h1>

        <div className="flex flex-col gap-8">
          {GRUPOS.map((grupo) => (
            <section key={grupo.titulo}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-widest" style={{ color: cores.suave }}>
                {grupo.titulo}
              </h2>

              <ul className="flex flex-col">
                {grupo.destinos.map((destino) => (
                  <li key={destino.href}>
                    <Link
                      href={destino.href}
                      className="flex items-baseline justify-between gap-6 border-b py-3 transition-colors hover:text-[#FFB50A]"
                      style={{ borderColor: "#3B2718" }}
                    >
                      <span className="text-lg">{destino.nome}</span>
                      <code className="text-sm" style={{ color: cores.destaque }}>
                        {destino.href}
                      </code>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
