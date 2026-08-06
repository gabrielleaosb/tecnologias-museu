import { cores } from "@/lib/escada/cores";
import { ESCADA } from "@/lib/escada/estilos";
import { Logo } from "@/components/escada/Logo";
import { QrCode } from "@/components/escada/QRCode";

// Canvas 1920×1080

export function TelaAgradecimento() {
  const urlMapaSalas = typeof window !== "undefined" ? `${window.location.origin}/mapa-salas` : "/mapa-salas";

  return (
    <div
      className="flex h-screen w-screen flex-col items-center justify-center text-center"
      style={{ ...ESCADA.tela, gap: "1.67vw" }}
    >
      <Logo variante="escura" />

      <h1 className="font-bold" style={ESCADA.texto.titulo}>
        Obrigado(a)!
      </h1>

      <p className="font-medium" style={{ ...ESCADA.texto.corpo, maxWidth: "58vw" }}>
        Seu depoimento foi inserido no banco de dados e já pode ser visto da Galeria de Depoimentos na{" "}
        <strong>Sala 7 - Personalidades</strong>.
      </p>

      <div className="flex items-center" style={{ gap: "0.83vw" }}>
        <div className="rounded-md bg-white p-3">
          <QrCode valor={urlMapaSalas} />
        </div>
        <span className="font-bold" style={ESCADA.texto.titulo}>
          MAPA DAS SALAS
        </span>
      </div>
    </div>
  );
}
