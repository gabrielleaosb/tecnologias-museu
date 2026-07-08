"use client";

import { useRouter } from "next/navigation";
import { coresAdmin } from "@/lib/admin/cores";

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
      className="rounded-md px-5 py-2 font-bold cursor-pointer"
      style={{ backgroundColor: coresAdmin.botaoSecundario, color: coresAdmin.fundo }}
    >
      Logout
    </button>
  );
}
