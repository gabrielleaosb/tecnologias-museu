// Catálogo das cartas. Cada arquivo em public/images/sala6/ já vem com a arte, o
// nome popular e o nome científico embutidos na imagem — no PDF a face da carta é
// uma imagem achatada, não texto sobre foto. Por isso não há legenda a renderizar:
// a carta virada é só a imagem ocupando a célula.

export interface Carta {
  id: string;
  /** Nome popular, usado só para leitores de tela e depuração. */
  nome: string;
  imagem: string;
}

export const CARTAS: Carta[] = [
  { id: "cachorro-do-mato", nome: "Cachorro-do-mato", imagem: "/images/sala6/cachorro-do-mato.jpg" },
  { id: "cardeal-do-nordeste", nome: "Cardeal-do-nordeste", imagem: "/images/sala6/cardeal-do-nordeste.jpg" },
  { id: "cassaco", nome: "Cassaco", imagem: "/images/sala6/cassaco.jpg" },
  { id: "catingueira", nome: "Catingueira-de-folha-larga", imagem: "/images/sala6/catingueira.jpg" },
  { id: "cobra-coral", nome: "Cobra-coral-verdadeira", imagem: "/images/sala6/cobra-coral.jpg" },
  { id: "gaviao", nome: "Gavião-caramujeiro", imagem: "/images/sala6/gaviao.jpg" },
  { id: "jacare", nome: "Jacaré-de-papo-amarelo", imagem: "/images/sala6/jacare.jpg" },
  { id: "mandacaru", nome: "Mandacaru", imagem: "/images/sala6/mandacaru.jpg" },
  { id: "mastodonte", nome: "Mastodonte antigo", imagem: "/images/sala6/mastodonte.jpg" },
  { id: "monarca-do-sul", nome: "Monarca-do-sul", imagem: "/images/sala6/monarca-do-sul.jpg" },
  { id: "morcego", nome: "Morcego-das-frutas", imagem: "/images/sala6/morcego.jpg" },
  { id: "pinhao-bravo", nome: "Pinhão-bravo", imagem: "/images/sala6/pinhao-bravo.jpg" },
  { id: "preguica-gigante", nome: "Preguiça gigante", imagem: "/images/sala6/preguica-gigante.jpg" },
  { id: "punare", nome: "Punaré", imagem: "/images/sala6/punare.jpg" },
  { id: "quixabeira", nome: "Quixabeira", imagem: "/images/sala6/quixabeira.jpg" },
  { id: "sagui", nome: "Sagui-de-tufos-brancos", imagem: "/images/sala6/sagui.jpg" },
];

const PORID = new Map(CARTAS.map((c) => [c.id, c]));

export function carta(id: string): Carta {
  const c = PORID.get(id);
  if (!c) throw new Error(`Carta desconhecida: ${id}`);
  return c;
}

/**
 * As nove cartas que o protótipo mostra no nível fácil (p.4 do PDF), na ordem em
 * que aparecem. A lista é fixa, e não um sorteio entre as dezesseis, para que o
 * nível fácil fique igual ao protótipo — o que muda a cada partida é a posição.
 */
export const CARTAS_FACIL = [
  "cachorro-do-mato",
  "sagui",
  "punare",
  "preguica-gigante",
  "monarca-do-sul",
  "gaviao",
  "morcego",
  "mandacaru",
  "cassaco",
];

/** O nível difícil usa as dezesseis (p.8 do PDF). */
export const CARTAS_DIFICIL = CARTAS.map((c) => c.id);
