import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET ?? "dev-secret-troque-em-producao";
const DURACAO_MS = 1000 * 60 * 60 * 12;

export const COOKIE_SESSAO = "admin_session";

function assinar(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function criarSessionToken(usuario: string): string {
  const payload = `${usuario}.${Date.now() + DURACAO_MS}`;
  return `${payload}.${assinar(payload)}`;
}

export function verificarSessionToken(token: string | undefined | null): string | null {
  if (!token) return null;

  const partes = token.split(".");
  if (partes.length !== 3) return null;

  const [usuario, expiraStr, assinatura] = partes;
  const payload = `${usuario}.${expiraStr}`;
  const esperada = assinar(payload);

  const bufAssinatura = Buffer.from(assinatura);
  const bufEsperada = Buffer.from(esperada);
  if (bufAssinatura.length !== bufEsperada.length || !timingSafeEqual(bufAssinatura, bufEsperada)) {
    return null;
  }

  if (Date.now() > Number(expiraStr)) return null;

  return usuario;
}
