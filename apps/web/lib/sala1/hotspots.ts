import type { TemaId } from "@/lib/sala1/temas";

export interface Hotspot {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export const hotspotsStandby: Hotspot[] = [{ id: "iniciar", left: 28, top: 67, width: 44, height: 18 }];

export const hotspotsMenu: (Hotspot & { temaId: TemaId })[] = [
  { id: "cangaco", temaId: "cangaco", left: 14, top: 19, width: 17, height: 32 },
  { id: "cidade", temaId: "cidade", left: 41.5, top: 19, width: 17, height: 32 },
  { id: "rio-sao-francisco", temaId: "rio-sao-francisco", left: 69, top: 19, width: 18, height: 36 },
  { id: "ferrovia", temaId: "ferrovia", left: 27.5, top: 58, width: 17, height: 33 },
  { id: "museu", temaId: "museu", left: 56, top: 58, width: 17, height: 33 },
];

export const hotspotsTema: Hotspot[] = [{ id: "sair", left: 42.5, top: 81.5, width: 15.5, height: 8.5 }];

export const hotspotsFimVideo: Hotspot[] = [
  { id: "nao", left: 17, top: 47, width: 29.5, height: 18.5 },
  { id: "sim", left: 53.5, top: 47, width: 29.5, height: 18.5 },
];

export const hotspotsEncerrando: Hotspot[] = [];
