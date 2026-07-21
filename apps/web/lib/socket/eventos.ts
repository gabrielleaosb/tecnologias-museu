import type { Estado } from "@/lib/sala1/estado";

export const SALA1_ROOM = "sala1";
export const SALA7_ROOM = "sala7";

export interface DepoimentoPublico {
  id: string;
  nome: string;
  pais: string;
  estado: string;
  tipo: "foto" | "video";
  arquivoUrl: string;
  texto: string | null;
  prestigios: number;
  criadoEm: string;
}

export interface ServerToClientEvents {
  "sala1:estado": (estado: Estado) => void;
  "sala7:novo-depoimento": (depoimento: DepoimentoPublico) => void;
  "sala7:depoimento-removido": (payload: { id: string }) => void;
  "sala7:prestigio-atualizado": (payload: { id: string; prestigios: number }) => void;
}

export interface ClientToServerEvents {
  "sala1:entrar": (payload: { papel: "tablet" | "tv" | "madmapper" }) => void;
  "sala1:iniciar": () => void;
  "sala1:selecionar-tema": (payload: { temaId: import("@/lib/sala1/temas").TemaId }) => void;
  "sala1:sair": () => void;
  "sala1:outro-sim": () => void;
  "sala1:outro-nao": () => void;
  "sala1:video-finalizado": () => void;
  "sala7:entrar": () => void;
}
