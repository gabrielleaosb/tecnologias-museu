import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ArgumentoOsc } from "./osc.ts";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Uma mensagem OSC isolada. */
export interface MensagemOsc {
  endereco: string;
  args?: ArgumentoOsc[];
}

/**
 * O que disparar num estado da sala: uma lista de mensagens OSC, enviadas em ordem.
 *
 * É lista, e não uma mensagem só, porque a maquete tem várias superfícies e um tema
 * pode precisar trocar o conteúdo de mais de uma ao mesmo tempo. Também é o que
 * permite escolher entre as duas formas de comandar o MadMapper sem mexer em código:
 * disparar um cue nomeado (uma mensagem) ou trocar a mídia de cada superfície
 * (uma mensagem por superfície). Ver config.example.json.
 */
export type Acao = MensagemOsc[];

export interface Config {
  servidorUrl: string;
  madmapper: { host: string; porta: number };
  cues: Record<string, Acao | null>;
}

/**
 * Aceita tanto a forma nova (lista) quanto uma mensagem solta, que era o formato
 * antigo do config. Poupa reescrever configs já instaladas em campo.
 */
function normalizarAcao(chave: string, valor: unknown): Acao | null {
  if (valor === null || valor === undefined) return null;

  const lista = Array.isArray(valor) ? valor : [valor];
  if (lista.length === 0) return null;

  return lista.map((item, i) => {
    const onde = lista.length > 1 ? `${chave}[${i}]` : chave;
    if (typeof item !== "object" || item === null) {
      throw new Error(`config.json: cue "${onde}" precisa ser um objeto com "endereco".`);
    }
    const endereco = (item as Record<string, unknown>).endereco;
    if (typeof endereco !== "string" || !endereco.startsWith("/")) {
      throw new Error(
        `config.json: cue "${onde}" precisa de um "endereco" começando com "/" ` +
          `(ou null para não disparar nada nesse estado).`,
      );
    }
    const args = (item as Record<string, unknown>).args;
    if (args !== undefined && !Array.isArray(args)) {
      throw new Error(`config.json: cue "${onde}" tem "args" que não é uma lista.`);
    }
    return { endereco, args: args as ArgumentoOsc[] | undefined };
  });
}

function exigirTexto(objeto: Record<string, unknown>, campo: string): string {
  const valor = objeto[campo];
  if (typeof valor !== "string" || valor.trim() === "") {
    throw new Error(`config.json: campo "${campo}" é obrigatório e deve ser texto.`);
  }
  return valor;
}

export function carregarConfig(): Config {
  const caminho = resolve(RAIZ, "config.json");

  let bruto: string;
  try {
    bruto = readFileSync(caminho, "utf8");
  } catch {
    throw new Error(
      `Não encontrei ${caminho}.\n` +
        `Copie config.example.json para config.json e preencha os valores.`,
    );
  }

  let dados: Record<string, unknown>;
  try {
    dados = JSON.parse(bruto) as Record<string, unknown>;
  } catch (erro) {
    throw new Error(`config.json não é um JSON válido: ${(erro as Error).message}`);
  }

  const madmapper = (dados.madmapper ?? {}) as Record<string, unknown>;
  const porta = Number(madmapper.porta);
  if (!Number.isInteger(porta) || porta < 1 || porta > 65535) {
    throw new Error(`config.json: "madmapper.porta" deve ser um número de porta válido.`);
  }

  const cues = dados.cues;
  if (typeof cues !== "object" || cues === null) {
    throw new Error(`config.json: "cues" é obrigatório e deve ser um objeto.`);
  }

  const acoes: Record<string, Acao | null> = {};
  for (const [chave, valor] of Object.entries(cues as Record<string, unknown>)) {
    acoes[chave] = normalizarAcao(chave, valor);
  }

  return {
    servidorUrl: exigirTexto(dados as Record<string, unknown>, "servidorUrl"),
    madmapper: { host: exigirTexto(madmapper, "host"), porta },
    cues: acoes,
  };
}
