import { cores } from "@/lib/escada/cores";
import { TopoTela } from "@/components/escada/TopoTela";
import { BotaoCirculo } from "@/components/escada/BotaoCirculo";

interface TelaEscolhaProps {
  onEscolher: (tipo: "video" | "foto") => void;
  onSair: () => void;
}

export function TelaEscolha({ onEscolher, onSair }: TelaEscolhaProps) {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden p-[2.5vw]" style={{ backgroundColor: cores.fundoEscuro }}>
      <TopoTela
        onSair={onSair}
        variante="clara"
        logoVariante="cinza-vertical"
        logoStyle={{ width: "11.53vw", marginTop: "2vh", marginLeft: "3vw" }}
        sairStyle={{ marginTop: "6vh", marginRight: "7vw" }}
      />

      {/* Título na mesma altura do SAIR (top: padding 2.5vw + marginTop 2vh) */}
      <h1
        className="absolute font-bold tracking-widest text-center"
        style={{
          color: cores.textoClaro,
          fontSize: "2.08vw",
          top: "calc(2.5vw + 9vh)",
          left: "50%",
          transform: "translateX(-50%)",
          whiteSpace: "nowrap",
        }}
      >
        ESCOLHA UMA DAS OPÇÕES
      </h1>

      <div className="flex flex-1 flex-col items-center justify-evenly" style={{ marginBottom: "8vh" }}>
        <div style={{ display: "flex", gap: "10.89vw", marginTop: "-3vh" }}>
          <BotaoCirculo icone="/icons/escada/video.png" label="VÍDEO" onClick={() => onEscolher("video")} claro iconWidthVw={12.66} iconHeightVw={12.66} />
          <BotaoCirculo icone="/icons/escada/foto.png" label="FOTO" onClick={() => onEscolher("foto")} claro iconWidthVw={15.12} iconHeightVw={12.32} />
        </div>

        <div className="flex items-center justify-center rounded-md px-[2.5vw]" style={{ width: "59.58vw", height: "15.56vh", backgroundColor: "#465760", marginTop: "7vh" }}>
          <p className="text-center" style={{ color: cores.textoClaro, fontSize: "2.08vw", fontWeight: 400, letterSpacing: "4px" }}>
            Sua participação contribui para contar a história deste espaço e de todos que passam por ele.
          </p>
        </div>
      </div>
    </div>
  );
}
