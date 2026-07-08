import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "depoimentos");

export async function salvarArquivoDepoimento(arquivo: File): Promise<string> {
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
