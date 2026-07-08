import { NextResponse } from "next/server";
import { validarCredenciais } from "@/lib/auth/credenciais";
import { criarSessionToken, COOKIE_SESSAO } from "@/lib/auth/session";

export async function POST(request: Request) {
  const { usuario, senha } = await request.json();

  if (typeof usuario !== "string" || typeof senha !== "string" || !validarCredenciais(usuario, senha)) {
    return NextResponse.json({ erro: "Usuário ou senha inválidos." }, { status: 401 });
  }

  const token = criarSessionToken(usuario);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_SESSAO, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return response;
}
