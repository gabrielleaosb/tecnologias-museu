import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { ArgumentoOsc } from "./osc.ts";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export interface Cue {
  endereco: string;
  args?: ArgumentoOsc[];
}

export interface Config {
  servidorUrl: string;
  madmapper: { host: string; porta: number };
  cues: Record<string, Cue | null>;
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

  for (const [chave, cue] of Object.entries(cues as Record<string, unknown>)) {
    if (cue === null) continue;
    const endereco = (cue as Record<string, unknown>).endereco;
    if (typeof endereco !== "string" || !endereco.startsWith("/")) {
      throw new Error(
        `config.json: cue "${chave}" precisa de um "endereco" começando com "/" ` +
          `(ou null para não disparar nada nesse estado).`,
      );
    }
  }

  return {
    servidorUrl: exigirTexto(dados as Record<string, unknown>, "servidorUrl"),
    madmapper: { host: exigirTexto(madmapper, "host"), porta },
    cues: cues as Record<string, Cue | null>,
  };
}
