"use client";

import { useRouter } from "next/navigation";
import { coresAdmin } from "@/lib/admin/cores";
import { medidasAdmin, u } from "@/lib/admin/medidas";

const { cabecalho: c } = medidasAdmin;

export function BotaoLogout() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex cursor-pointer items-center justify-center"
      style={{
        width: u(c.larguraLogout),
        height: u(c.botao.altura),
        backgroundColor: coresAdmin.botaoSecundario,
        color: coresAdmin.texto,
        fontSize: u(c.botao.texto),
      }}
    >
      Logout
    </button>
  );
}
