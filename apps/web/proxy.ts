import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verificarSessionToken, COOKIE_SESSAO } from "@/lib/auth/session";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_SESSAO)?.value;
  const usuario = verificarSessionToken(token);

  if (!usuario) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
