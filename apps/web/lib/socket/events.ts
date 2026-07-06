import type { TemaId } from "@/lib/temas";

export const SALA1_ROOM = "sala1";

export interface ServerToClientEvents {
  "sala1:tocar-video": (payload: { temaId: TemaId; video: string }) => void;
  "sala1:voltar-loop": () => void;
}

export interface ClientToServerEvents {
  "sala1:entrar": (payload: { papel: "tablet" | "tv" }) => void;
  "sala1:selecionar-tema": (payload: { temaId: TemaId }) => void;
  "sala1:video-finalizado": () => void;
}
