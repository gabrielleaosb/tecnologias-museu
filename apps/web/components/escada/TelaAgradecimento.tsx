import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { QrCode } from "@/components/escada/QRCode";

export function TelaAgradecimento() {
  const urlMapaSalas = typeof window !== "undefined" ? `${window.location.origin}/mapa-salas` : "/mapa-salas";

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 p-8 text-center" style={{ backgroundColor: cores.fundoClaro }}>
      <Logo variante="escura" />

      <h1 className="text-2xl font-extrabold sm:text-3xl" style={{ color: cores.textoEscuro }}>
        Obrigado(a)!
      </h1>

      <p className="max-w-lg text-lg" style={{ color: cores.textoEscuro }}>
        Seu depoimento foi inserido no banco de dados e já pode ser visto da Galeria de Depoimentos na{" "}
        <strong>Sala 7 - Personalidades</strong>.
      </p>

      <div className="flex items-center gap-4">
        <div className="rounded-md bg-white p-3">
          <QrCode valor={urlMapaSalas} />
        </div>
        <span className="text-xl font-extrabold tracking-wide" style={{ color: cores.textoEscuro }}>
          MAPA DAS SALAS
        </span>
      </div>
    </div>
  );
}
