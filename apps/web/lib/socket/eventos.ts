import type { Estado } from "@/lib/sala1/estado";

export const SALA1_ROOM = "sala1";

export interface ServerToClientEvents {
  "sala1:estado": (estado: Estado) => void;
}

export interface ClientToServerEvents {
  "sala1:entrar": (payload: { papel: "tablet" | "tv" }) => void;
  "sala1:iniciar": () => void;
  "sala1:selecionar-tema": (payload: { temaId: import("@/lib/sala1/temas").TemaId }) => void;
  "sala1:sair": () => void;
  "sala1:outro-sim": () => void;
  "sala1:outro-nao": () => void;
  "sala1:video-finalizado": () => void;
}
