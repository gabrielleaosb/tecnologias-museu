import { cores } from "@/lib/escada/cores";
import { Logo } from "@/components/escada/Logo";
import { QrCode } from "@/components/escada/QRCode";

// Canvas 1920×1080

export function TelaAgradecimento() {
  const urlMapaSalas = typeof window !== "undefined" ? `${window.location.origin}/mapa-salas` : "/mapa-salas";

  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center text-center"
      style={{ backgroundColor: cores.fundoClaro, gap: "1.67vw", padding: "2.5vw" }}
    >
      <Logo variante="escura" />

      <h1 className="font-extrabold" style={{ color: cores.textoEscuro, fontSize: "1.875vw" }}>
        Obrigado(a)!
      </h1>

      <p style={{ color: cores.textoEscuro, fontSize: "1.125vw", maxWidth: "26.67vw" }}>
        Seu depoimento foi inserido no banco de dados e já pode ser visto da Galeria de Depoimentos na{" "}
        <strong>Sala 7 - Personalidades</strong>.
      </p>

      <div className="flex items-center" style={{ gap: "0.83vw" }}>
        <div className="rounded-md bg-white p-3">
          <QrCode valor={urlMapaSalas} />
        </div>
        <span className="font-extrabold tracking-wide" style={{ color: cores.textoEscuro, fontSize: "1.25vw" }}>
          MAPA DAS SALAS
        </span>
      </div>
    </div>
  );
}
