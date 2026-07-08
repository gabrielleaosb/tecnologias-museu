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
  const itemClasse = (ativo: boolean) => "w-full rounded-md px-4 py-2 text-left font-semibold cursor-pointer";

  return (
    <div className="flex w-48 flex-col gap-2 rounded-md p-4" style={{ backgroundColor: coresSala7.painelFiltro }}>
      <h2 className="mb-1 font-extrabold tracking-wide" style={{ color: coresSala7.texto }}>
        FILTRAR
      </h2>
      <button
        onClick={() => onTipoChange(tipo === "foto" ? "todos" : "foto")}
        className={itemClasse(tipo === "foto")}
        style={{ backgroundColor: coresSala7.painelFiltroItem, color: coresSala7.texto, opacity: tipo === "foto" ? 1 : 0.75 }}
      >
        Fotos
      </button>
      <button
        onClick={() => onTipoChange(tipo === "video" ? "todos" : "video")}
        className={itemClasse(tipo === "video")}
        style={{ backgroundColor: coresSala7.painelFiltroItem, color: coresSala7.texto, opacity: tipo === "video" ? 1 : 0.75 }}
      >
        Vídeos
      </button>
      <button
        onClick={() => onOrdenacaoChange("recentes")}
        className={itemClasse(ordenacao === "recentes")}
        style={{ backgroundColor: coresSala7.painelFiltroItem, color: coresSala7.texto, opacity: ordenacao === "recentes" ? 1 : 0.75 }}
      >
        Mais recentes
      </button>
      <button
        onClick={() => onOrdenacaoChange("prestigiados")}
        className={itemClasse(ordenacao === "prestigiados")}
        style={{ backgroundColor: coresSala7.painelFiltroItem, color: coresSala7.texto, opacity: ordenacao === "prestigiados" ? 1 : 0.75 }}
      >
        Mais prestigiados
      </button>
    </div>
  );
}
