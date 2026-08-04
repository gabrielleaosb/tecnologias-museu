export type Comando = "sim" | "nao" | "1" | "2" | "3" | "4" | "5";

const SINONIMOS: Record<Comando, string[]> = {
  sim: ["sim"],
  nao: ["nao"],
  "1": ["um", "uma", "1", "primeiro", "primeira"],
  "2": ["dois", "duas", "2", "segundo", "segunda"],
  "3": ["tres", "3", "terceiro", "terceira"],
  "4": ["quatro", "4", "quarto", "quarta"],
  "5": ["cinco", "5", "quinto", "quinta"],
};

/**
 * Como o comando deve ser PEDIDO ao visitante (na fala do personagem e na tela).
 *
 * Os números são pedidos como "número um", não "um" solto: confirmado em campo
 * (2026-08-04, Google Chrome) que "um" isolado nunca é transcrito — são ~200ms
 * de som nasal sem consoante de ataque, que o reconhecedor genérico modela como
 * hesitação e descarta. Falar "um um um" funciona, o que confirma ser limiar de
 * duração de áudio, não a palavra em si. A Web Speech API não expõe controle de
 * endpointing nem gramática restrita (`SpeechGrammarList` é um stub no Chrome),
 * então não há correção possível por código — a saída é a frase mais longa.
 *
 * "número" e "opção" foram testados e ambos resolvem; o número é mantido porque
 * é o que aparece na tela para o visitante ler.
 */
export const FRASE_SUGERIDA: Record<Comando, string> = {
  sim: "sim",
  nao: "não",
  "1": "número um",
  "2": "número dois",
  "3": "número três",
  "4": "número quatro",
  "5": "número cinco",
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

  return casarExato(palavras, candidatos) ?? casarAproximado(palavras, candidatos);
}

/**
 * Varre as palavras de trás para frente: quando uma transcrição contém mais de
 * um comando, vale o ÚLTIMO. O Chrome não fecha a frase num monossílabo — se o
 * visitante diz "um", nada é emitido, e ao dizer "dois" em seguida chega
 * "um dois" numa transcrição só. A intenção corrente é sempre a última falada
 * (vale também para correção em voz alta: "não, quer dizer, sim").
 */
function casarExato(palavras: string[], candidatos: Comando[]): Comando | null {
  for (let i = palavras.length - 1; i >= 0; i--) {
    for (const comando of candidatos) {
      if (SINONIMOS[comando].includes(palavras[i])) return comando;
    }
  }
  return null;
}

function casarAproximado(palavras: string[], candidatos: Comando[]): Comando | null {
  for (let i = palavras.length - 1; i >= 0; i--) {
    const palavra = palavras[i];
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

/**
 * Igual a `reconhecerComando`, mas considera todas as alternativas devolvidas
 * pelo reconhecimento (`maxAlternatives > 1`). O Chrome às vezes coloca a
 * transcrição correta na 2ª ou 3ª alternativa — sobretudo em palavras curtas
 * como "um", que ele tende a confundir com hesitação.
 *
 * Faz uma passada exata sobre TODAS as alternativas antes de tentar a
 * aproximada em qualquer uma: um match exato na 3ª alternativa é mais
 * confiável que um fuzzy na 1ª.
 */
export function reconhecerEntreAlternativas(
  alternativas: string[],
  opcoesValidas?: Comando[]
): Comando | null {
  const candidatos = opcoesValidas ?? (Object.keys(SINONIMOS) as Comando[]);
  const porAlternativa = alternativas.map((a) => normalizar(a).split(/\s+/).filter(Boolean));

  for (const palavras of porAlternativa) {
    const comando = casarExato(palavras, candidatos);
    if (comando) return comando;
  }

  for (const palavras of porAlternativa) {
    const comando = casarAproximado(palavras, candidatos);
    if (comando) return comando;
  }

  return null;
}
