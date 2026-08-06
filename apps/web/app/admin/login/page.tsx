"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { coresAdmin } from "@/lib/admin/cores";
import { u, UNIDADE_ADMIN_TELA } from "@/lib/admin/medidas";
import { Logo } from "@/components/escada/Logo";

// Medidas extraídas de design/escada/LoginADM.jpeg (845×475, ou seja o canvas 1920×1080),
// convertidas para a unidade `u` do Admin (1u = 1% de 1920px). Esta tela não está no PDF
// do Admin — o JPEG é a única referência.
const m = {
  logo: 20.24,
  espacoLogoTitulo: 3.2,
  titulo: 1.9,
  espacoTituloCard: 2.96,
  card: { largura: 34.31, padding: 3.31, paddingTopo: 4.14 },
  login: 2.37,
  espacoLoginCampo: 2.6,
  label: 1.42,
  espacoLabelCampo: 0.95,
  campo: { altura: 3.79, texto: 1.3, paddingLado: 1.3, raio: 0.47 },
  espacoEntreCampos: 2.13,
  espacoCampoBotao: 1.42,
  botao: { altura: 3.67, texto: 1.42 },
};

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

  // lineHeight 1 nos rótulos e no "Login": a entrelinha padrão do Futura sobra ~10px por
  // linha e empilhada deixava o card mais alto que o mock.
  const estiloLabel: React.CSSProperties = {
    display: "block",
    color: coresAdmin.textoLogin,
    fontSize: u(m.label),
    lineHeight: 1,
  };

  const estiloCampo: React.CSSProperties = {
    width: "100%",
    height: u(m.campo.altura),
    marginTop: u(m.espacoLabelCampo),
    paddingInline: u(m.campo.paddingLado),
    border: `1px solid ${coresAdmin.bordaCampo}`,
    borderRadius: u(m.campo.raio),
    backgroundColor: coresAdmin.cardLogin,
    color: coresAdmin.textoLogin,
    fontSize: u(m.campo.texto),
  };

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center"
      style={
        {
          "--u": UNIDADE_ADMIN_TELA,
          backgroundColor: coresAdmin.fundo,
        } as React.CSSProperties
      }
    >
      <Logo variante="clara" style={{ width: u(m.logo), display: "block" }} />

      <h1
        style={{
          marginTop: u(m.espacoLogoTitulo),
          color: coresAdmin.texto,
          fontSize: u(m.titulo),
          fontWeight: 600,
          letterSpacing: "0.08em",
          lineHeight: 1,
        }}
      >
        DEPOIMENTOS
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{
          marginTop: u(m.espacoTituloCard),
          width: u(m.card.largura),
          paddingInline: u(m.card.padding),
          paddingTop: u(m.card.paddingTopo),
          paddingBottom: u(m.card.padding),
          backgroundColor: coresAdmin.cardLogin,
        }}
      >
        <h2
          className="text-center"
          style={{
            color: coresAdmin.textoLogin,
            fontSize: u(m.login),
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          Login
        </h2>

        <label className="block" style={{ marginTop: u(m.espacoLoginCampo) }}>
          <span style={estiloLabel}>Usuário</span>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="block outline-none"
            style={estiloCampo}
            autoComplete="username"
          />
        </label>

        <label className="block" style={{ marginTop: u(m.espacoEntreCampos) }}>
          <span style={estiloLabel}>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="block outline-none"
            style={estiloCampo}
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={enviando}
          className="block cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            marginTop: u(m.espacoCampoBotao),
            width: "100%",
            height: u(m.botao.altura),
            borderRadius: u(m.campo.raio),
            backgroundColor: coresAdmin.botaoLogin,
            color: coresAdmin.texto,
            fontSize: u(m.botao.texto),
          }}
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      {/* Fica fora do card: o mock não tem mensagem de erro, e reservar espaço para ela
          dentro do card mudaria a altura dele em relação à referência. */}
      <p
        aria-live="polite"
        className="text-center"
        style={{
          minHeight: u(2.2),
          marginTop: u(1.2),
          color: coresAdmin.botaoDeletar,
          fontSize: u(m.label),
        }}
      >
        {erro}
      </p>
    </div>
  );
}
