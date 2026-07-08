export function validarCredenciais(usuario: string, senha: string): boolean {
  const raw = process.env.ADMIN_USUARIOS ?? "";
  const pares = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  return pares.some((par) => {
    const [u, ...resto] = par.split(":");
    const s = resto.join(":");
    return u === usuario && s === senha;
  });
}
