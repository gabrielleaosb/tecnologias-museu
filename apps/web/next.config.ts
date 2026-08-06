import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  // Sem isto, abrir o app pelo IP da máquina (tablet na mesma rede) faz o Next recusar
  // os assets internos de /_next/*, porque a origem é diferente de localhost.
  // Vale só em desenvolvimento; em produção o Caddy responde pelo domínio real.
  allowedDevOrigins: ["192.168.0.173", "192.168.0.*"],
};

export default nextConfig;
