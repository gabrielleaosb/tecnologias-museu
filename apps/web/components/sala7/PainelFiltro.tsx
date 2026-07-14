import { coresSala7 } from "@/lib/sala7/cores";

export type FiltroTipo = "todos" | "foto" | "video";
export type Ordenacao = "recentes" | "prestigiados";

interface PainelFiltroProps {
  tipo: FiltroTipo;
  ordenacao: Ordenacao;
  onTipoChange: (tipo: FiltroTipo) => void;
  onOrdenacaoChange: (ordenacao: Ordenacao) => void;
}

export function PainelFiltro({ tipo, ordenacao, onTipoChange, onOrdenacaoChange }: PainelFiltroProps) {
  const itemClasse = "w-full rounded-md px-4 py-2 text-left cursor-pointer";

  return (
    <div className="flex w-48 flex-col overflow-hidden rounded-md shadow-lg">
      <h2
        className="px-4 py-3 text-sm font-extrabold tracking-wide text-white"
        style={{ backgroundColor: coresSala7.painelFiltro }}
      >
        FILTRAR
      </h2>
      <div className="flex flex-col gap-1 p-3" style={{ backgroundColor: coresSala7.painelFiltroItem }}>
        <button
          onClick={() => onTipoChange(tipo === "foto" ? "todos" : "foto")}
          className={itemClasse}
          style={{ color: coresSala7.texto, fontWeight: tipo === "foto" ? 800 : 500 }}
        >
          Fotos
        </button>
        <button
          onClick={() => onTipoChange(tipo === "video" ? "todos" : "video")}
          className={itemClasse}
          style={{ color: coresSala7.texto, fontWeight: tipo === "video" ? 800 : 500 }}
        >
          Vídeos
        </button>
        <button
          onClick={() => onOrdenacaoChange("recentes")}
          className={itemClasse}
          style={{ color: coresSala7.texto, fontWeight: ordenacao === "recentes" ? 800 : 500 }}
        >
          Mais recentes
        </button>
        <button
          onClick={() => onOrdenacaoChange("prestigiados")}
          className={itemClasse}
          style={{ color: coresSala7.texto, fontWeight: ordenacao === "prestigiados" ? 800 : 500 }}
        >
          Mais prestigiados
        </button>
      </div>
    </div>
  );
}
