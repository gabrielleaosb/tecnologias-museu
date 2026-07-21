/**
 * Codificador mínimo de mensagens OSC 1.0 (Open Sound Control).
 *
 * O MadMapper é controlado por OSC sobre UDP — não por HTTP. Uma mensagem OSC é:
 *   1. endereço  — string ASCII terminada em NUL, com padding até múltiplo de 4 bytes
 *   2. type tag  — "," seguido de uma letra por argumento (i=int32, f=float32, s=string)
 *   3. argumentos — na ordem, cada um alinhado em 4 bytes
 *
 * Escrito à mão em vez de usar biblioteca: o formato é simples e estável, e assim o
 * agente roda no PC do museu com uma dependência a menos para instalar/quebrar.
 */

export type ArgumentoOsc =
  | number
  | string
  | boolean
  | { tipo: "i" | "f" | "s"; valor: number | string };

/** Arredonda para cima até o múltiplo de 4 mais próximo (OSC exige alinhamento de 4). */
function alinhar4(n: number): number {
  return (n + 3) & ~3;
}

/** String OSC: bytes ASCII + NUL, preenchida com zeros até múltiplo de 4. */
function stringOsc(texto: string): Buffer {
  const bytes = Buffer.from(texto, "ascii");
  // alloc zera o buffer, o que já dá o NUL terminador e o padding.
  const buffer = Buffer.alloc(alinhar4(bytes.length + 1));
  bytes.copy(buffer);
  return buffer;
}

function int32Osc(valor: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeInt32BE(valor | 0, 0);
  return buffer;
}

function float32Osc(valor: number): Buffer {
  const buffer = Buffer.alloc(4);
  buffer.writeFloatBE(valor, 0);
  return buffer;
}

interface ArgumentoNormalizado {
  tipo: "i" | "f" | "s";
  valor: number | string;
}

/**
 * Aceita tanto valores JSON crus (com inferência de tipo) quanto a forma explícita
 * `{ tipo, valor }`, para que o config.json possa ser escrito do jeito mais curto
 * e ainda assim permitir forçar float onde o MadMapper exigir.
 */
function normalizar(argumento: ArgumentoOsc): ArgumentoNormalizado {
  if (typeof argumento === "object") return argumento;
  if (typeof argumento === "boolean") return { tipo: "i", valor: argumento ? 1 : 0 };
  if (typeof argumento === "string") return { tipo: "s", valor: argumento };
  return Number.isInteger(argumento)
    ? { tipo: "i", valor: argumento }
    : { tipo: "f", valor: argumento };
}

/** Monta o pacote UDP de uma mensagem OSC pronta para envio. */
export function montarMensagemOsc(endereco: string, argumentos: ArgumentoOsc[] = []): Buffer {
  if (!endereco.startsWith("/")) {
    throw new Error(`Endereço OSC deve começar com "/": recebido ${JSON.stringify(endereco)}`);
  }

  const normalizados = argumentos.map(normalizar);
  const tags = "," + normalizados.map((a) => a.tipo).join("");

  const partes: Buffer[] = [stringOsc(endereco), stringOsc(tags)];

  for (const { tipo, valor } of normalizados) {
    if (tipo === "s") partes.push(stringOsc(String(valor)));
    else if (tipo === "i") partes.push(int32Osc(Number(valor)));
    else partes.push(float32Osc(Number(valor)));
  }

  return Buffer.concat(partes);
}

/** Representação legível de uma mensagem, para os logs e para o modo de teste. */
export function descreverMensagem(endereco: string, argumentos: ArgumentoOsc[] = []): string {
  if (argumentos.length === 0) return endereco;
  const valores = argumentos
    .map(normalizar)
    .map((a) => `${a.tipo}:${a.valor}`)
    .join(" ");
  return `${endereco} ${valores}`;
}
