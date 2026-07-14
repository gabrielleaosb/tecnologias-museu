import { cores } from "@/lib/escada/cores";
import { TopoTela } from "@/components/escada/TopoTela";
import { BotaoCirculo } from "@/components/escada/BotaoCirculo";

interface TelaEscolhaProps {
  onEscolher: (tipo: "video" | "foto") => void;
  onSair: () => void;
}

export function TelaEscolha({ onEscolher, onSair }: TelaEscolhaProps) {
  return (
    <div className="flex h-screen w-screen flex-col gap-16 p-8 sm:p-12" style={{ backgroundColor: cores.fundoEscuro }}>
      <TopoTela onSair={onSair} variante="clara" />

      <div className="flex flex-1 flex-col items-center justify-center gap-16">
        <h1 className="text-2xl font-extrabold tracking-wide sm:text-3xl" style={{ color: cores.textoClaro }}>
          ESCOLHA UMA DAS OPÇÕES
        </h1>

        <div className="flex gap-16 sm:gap-24">
          <BotaoCirculo icone="/icons/escada/play.png" label="VÍDEO" onClick={() => onEscolher("video")} claro />
          <BotaoCirculo icone="/icons/escada/foto.png" label="FOTO" onClick={() => onEscolher("foto")} claro />
        </div>

        <div className="max-w-xl rounded-md px-6 py-6" style={{ backgroundColor: cores.caixaEscura }}>
          <p className="text-center text-lg" style={{ color: cores.textoClaro }}>
            Sua participação contribui para contar a história deste espaço e de todos que passam por ele.
          </p>
        </div>
      </div>
    </div>
  );
}
