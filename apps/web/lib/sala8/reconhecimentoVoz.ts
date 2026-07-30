export type Comando = "sim" | "nao" | "1" | "2" | "3" | "4" | "5";

const SINONIMOS: Record<Comando, string[]> = {
  sim: ["sim"],
  nao: ["nao"],
  "1": ["um", "uma", "1"],
  "2": ["dois", "duas", "2"],
  "3": ["tres", "3"],
  "4": ["quatro", "4"],
  "5": ["cinco", "5"],
};

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

function distanciaEdicao(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) d[i][0] = i;
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + custo);
    }
  }
  return d[a.length][b.length];
}

/**
 * Casa uma transcrição livre do reconhecimento de voz contra o vocabulário
 * fechado da Sala 8 (sim/não/números). Tenta match exato por palavra primeiro;
 * se nada bater, tenta distância de edição <= 1 para tolerar erros pequenos
 * de transcrição (ex: "seis" reconhecido como "cei").
 */
export function reconhecerComando(transcricao: string, opcoesValidas?: Comando[]): Comando | null {
  const candidatos = opcoesValidas ?? (Object.keys(SINONIMOS) as Comando[]);
  const palavras = normalizar(transcricao).split(/\s+/).filter(Boolean);

  for (const palavra of palavras) {
    for (const comando of candidatos) {
      if (SINONIMOS[comando].includes(palavra)) return comando;
    }
  }

  for (const palavra of palavras) {
    if (palavra.length < 3) continue;
    for (const comando of candidatos) {
      for (const sinonimo of SINONIMOS[comando]) {
        if (sinonimo.length < 3) continue;
        if (distanciaEdicao(palavra, sinonimo) <= 1) return comando;
      }
    }
  }

  return null;
}
