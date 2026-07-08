"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { coresAdmin } from "@/lib/admin/cores";

export default function AdminLoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(evento: React.FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);

    const resposta = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha }),
    });

    setEnviando(false);

    if (!resposta.ok) {
      setErro("Usuário ou senha inválidos.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ backgroundColor: coresAdmin.fundo }}>
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-md bg-black/20 p-8">
        <h1 className="text-2xl font-bold text-white">Painel de Depoimentos</h1>

        <input
          type="text"
          placeholder="Usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="rounded-md bg-white px-4 py-3 text-black outline-none"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="rounded-md bg-white px-4 py-3 text-black outline-none"
          autoComplete="current-password"
        />

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-md px-4 py-3 font-bold cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: coresAdmin.botaoAcao, color: coresAdmin.fundo }}
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
