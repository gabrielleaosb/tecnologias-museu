import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "depoimentos");

/**
 * Teto do arquivo de depoimento. O vídeo é limitado a 60s e a ~2 Mbps pelo
 * client (`lib/escada/useCamera.ts`), o que dá ~15 MB — os 25 MB deixam folga
 * para variação de resolução da webcam sem liberar arquivo arbitrário.
 *
 * Existe porque o arquivo é lido inteiro para a memória antes de ir pro disco:
 * sem teto, um upload grande derruba o processo Node — o mesmo que mantém os
 * WebSockets de sincronização de todas as salas.
 */
export const TAMANHO_MAXIMO_UPLOAD_BYTES = 25 * 1024 * 1024;

export class ErroArquivoGrandeDemais extends Error {
  constructor(readonly tamanho: number) {
    super(`Arquivo de ${tamanho} bytes excede o limite de ${TAMANHO_MAXIMO_UPLOAD_BYTES} bytes.`);
    this.name = "ErroArquivoGrandeDemais";
  }
}

export async function salvarArquivoDepoimento(arquivo: File): Promise<string> {
  if (arquivo.size > TAMANHO_MAXIMO_UPLOAD_BYTES) {
    throw new ErroArquivoGrandeDemais(arquivo.size);
  }

  await mkdir(UPLOADS_DIR, { recursive: true });

  const extensao = arquivo.type === "video/webm" ? "webm" : arquivo.type.split("/")[1] ?? "bin";
  const nomeArquivo = `${randomUUID()}.${extensao}`;
  const bytes = Buffer.from(await arquivo.arrayBuffer());

  await writeFile(path.join(UPLOADS_DIR, nomeArquivo), bytes);

  return `/uploads/depoimentos/${nomeArquivo}`;
}

export async function removerArquivoDepoimento(arquivoUrl: string): Promise<void> {
  const nomeArquivo = path.basename(arquivoUrl);
  await unlink(path.join(UPLOADS_DIR, nomeArquivo)).catch(() => {});
}
