export type TemaId = "cangaco" | "cidade" | "rio-sao-francisco" | "ferrovia";

export interface Tema {
  id: TemaId;
  titulo: string;
  video: string;
}

export const temas: Tema[] = [
  { id: "cangaco", titulo: "Cangaço", video: "/videos/sala1/cangaco.mp4" },
  { id: "cidade", titulo: "A Cidade", video: "/videos/sala1/cidade.mp4" },
  { id: "rio-sao-francisco", titulo: "Rio São Francisco", video: "/videos/sala1/rio-sao-francisco.mp4" },
  { id: "ferrovia", titulo: "A Ferrovia", video: "/videos/sala1/ferrovia.mp4" },
];

export const videoLoop = "/videos/sala1/loop.mp4";
