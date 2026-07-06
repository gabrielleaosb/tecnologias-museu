import type { TemaId } from "@/lib/sala1/temas";

export type Estado =
  | { tipo: "standby" }
  | { tipo: "menu"; variante?: "apos-sim" }
  | { tipo: "tema"; temaId: TemaId }
  | { tipo: "fim-video"; temaId: TemaId }
  | { tipo: "encerrando" };

export type Acao =
  | { tipo: "iniciar" }
  | { tipo: "selecionar-tema"; temaId: TemaId }
  | { tipo: "sair" }
  | { tipo: "outro-sim" }
  | { tipo: "outro-nao" }
  | { tipo: "video-finalizado" }
  | { tipo: "ocioso" };

export function reduzir(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case "iniciar":
      if (estado.tipo !== "standby") return estado;
      return { tipo: "menu" };

    case "selecionar-tema":
      if (estado.tipo !== "menu") return estado;
      return { tipo: "tema", temaId: acao.temaId };

    case "sair":
      if (estado.tipo !== "tema") return estado;
      return { tipo: "fim-video", temaId: estado.temaId };

    case "video-finalizado":
      if (estado.tipo === "tema") return { tipo: "fim-video", temaId: estado.temaId };
      if (estado.tipo === "encerrando") return { tipo: "standby" };
      return estado;

    case "outro-sim":
      if (estado.tipo !== "fim-video") return estado;
      return { tipo: "menu", variante: "apos-sim" };

    case "outro-nao":
      if (estado.tipo !== "fim-video") return estado;
      return { tipo: "encerrando" };

    case "ocioso":
      if (estado.tipo === "menu" || estado.tipo === "fim-video") return { tipo: "standby" };
      return estado;

    default:
      return estado;
  }
}
