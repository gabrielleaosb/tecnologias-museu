import { NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_SESSAO);
  return response;
}
