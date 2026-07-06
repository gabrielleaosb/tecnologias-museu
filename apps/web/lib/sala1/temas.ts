export type TemaId = "cangaco" | "cidade" | "rio-sao-francisco" | "ferrovia" | "museu";

export interface Tema {
  id: TemaId;
  titulo: string;
  imagem: string;
  video: string;
}

export const temas: Tema[] = [
  { id: "cangaco", titulo: "O Cangaço", imagem: "/images/sala1/tema-cangaco.jpg", video: "/videos/sala1/tema-cangaco.mp4" },
  { id: "cidade", titulo: "A Cidade", imagem: "/images/sala1/tema-cidade.jpg", video: "/videos/sala1/tema-cidade.mp4" },
  { id: "rio-sao-francisco", titulo: "O Rio São Francisco", imagem: "/images/sala1/tema-rio-sao-francisco.jpg", video: "/videos/sala1/tema-rio-sao-francisco.mp4" },
  { id: "ferrovia", titulo: "A Ferrovia", imagem: "/images/sala1/tema-ferrovia.jpg", video: "/videos/sala1/tema-ferrovia.mp4" },
  { id: "museu", titulo: "O Museu", imagem: "/images/sala1/tema-museu.jpg", video: "/videos/sala1/tema-museu.mp4" },
];

export function buscarTema(id: TemaId): Tema {
  const tema = temas.find((t) => t.id === id);
  if (!tema) throw new Error(`Tema desconhecido: ${id}`);
  return tema;
}

export const assets = {
  standby: { imagem: "/images/sala1/standby.jpg", video: "/videos/sala1/standby.mp4" },
  menu: { imagem: "/images/sala1/menu.jpg", video: "/videos/sala1/menu.mp4" },
  menuAposSim: { video: "/videos/sala1/menu-apos-sim.mp4" },
  fimVideo: { imagem: "/images/sala1/fim-video.jpg", video: "/videos/sala1/fim-video.mp4" },
  encerrando: { imagem: "/images/sala1/encerrando.jpg", video: "/videos/sala1/encerrando.mp4" },
};
