/**
 * Diagnóstico do elo agente -> MadMapper, contra um MadMapper DE VERDADE.
 *
 * Diferente de `verificar`, que só confere o codificador OSC offline, este script
 * envia OSC pela rede e RELÊ o valor pelo OSC Query (HTTP, mesma porta) para
 * confirmar que o MadMapper recebeu e aplicou. É a ferramenta para responder
 * "o OSC está chegando?" em dez segundos, no museu, antes de procurar problema
 * em cue, projetor ou rede.
 *
 * Uso:
 *   npm run verificar-real                    # 127.0.0.1:8010
 *   npm run verificar-real -- 192.168.0.50    # outro host
 *   npm run verificar-real -- 127.0.0.1 9000  # outra porta
 *
 * Usa endereços de /master, que existem mesmo com o projeto vazio — então não
 * depende de cues, superfícies ou mídias estarem configurados. Restaura os
 * valores originais ao final.
 */
import { createSocket } from "node:dgram";
import { montarMensagemOsc, descreverMensagem, type ArgumentoOsc } from "./osc.ts";

const host = process.argv[2] ?? "127.0.0.1";
const porta = Number(process.argv[3] ?? 8010);

const udp = createSocket("udp4");

function enviar(endereco: string, args: ArgumentoOsc[]): Promise<void> {
  return new Promise((ok, erro) => {
    udp.send(montarMensagemOsc(endereco, args), porta, host, (e) => (e ? erro(e) : ok()));
  });
}

async function lerValor(caminho: string): Promise<unknown> {
  const resposta = await fetch(`http://${host}:${porta}${caminho}`);
  if (!resposta.ok) throw new Error(`OSC Query respondeu ${resposta.status} em ${caminho}`);
  const json = (await resposta.json()) as { VALUE?: unknown[] };
  return json.VALUE?.[0];
}

const pausa = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Caso {
  caminho: string;
  args: ArgumentoOsc[];
  esperado: unknown;
  restaurar: ArgumentoOsc[];
  oQueTesta: string;
}

const CASOS: Caso[] = [
  {
    caminho: "/master/test_pattern",
    args: [1],
    esperado: true,
    restaurar: [0],
    oQueTesta: "int32",
  },
  {
    caminho: "/master/master_level",
    args: [{ tipo: "f", valor: 0.5 }],
    esperado: 0.5,
    restaurar: [{ tipo: "f", valor: 1 }],
    oQueTesta: "float32",
  },
];

async function main(): Promise<void> {
  console.log(`\nMadMapper em ${host}:${porta} (OSC/UDP + OSC Query no mesmo número de porta)\n`);

  try {
    const info = (await (await fetch(`http://${host}:${porta}/?HOST_INFO`)).json()) as {
      NAME?: string;
      OSC_PORT?: number;
      OSC_TRANSPORT?: string;
    };
    console.log(`  Servidor: ${info.NAME} — OSC em ${info.OSC_TRANSPORT} porta ${info.OSC_PORT}`);
    if (info.OSC_PORT !== undefined && info.OSC_PORT !== porta) {
      console.log(
        `  ⚠ O MadMapper diz que escuta OSC na porta ${info.OSC_PORT}, não na ${porta}.\n` +
          `    Ajuste "madmapper.porta" no config.json.`,
      );
    }
  } catch (erro) {
    console.error(
      `\n✗ Não consegui falar com o OSC Query em http://${host}:${porta}/\n` +
        `  ${(erro as Error).message}\n\n` +
        `  Verifique, nesta ordem:\n` +
        `   1. O MadMapper está aberto?\n` +
        `   2. OSC está habilitado em Preferences > OSC?\n` +
        `   3. A porta está certa? (padrão 8010)\n` +
        `   4. Se o MadMapper está em outra máquina, o firewall dela libera a porta?\n`,
    );
    udp.close();
    process.exit(1);
  }

  console.log("");
  let falhas = 0;

  for (const caso of CASOS) {
    const antes = await lerValor(caso.caminho);
    await enviar(caso.caminho, caso.args);
    await pausa(400);
    const depois = await lerValor(caso.caminho);

    const ok = JSON.stringify(depois) === JSON.stringify(caso.esperado);
    if (!ok) falhas++;

    console.log(
      `  ${ok ? "✓" : "✗"} ${caso.oQueTesta.padEnd(8)} ${descreverMensagem(caso.caminho, caso.args)}`,
    );
    console.log(
      `      antes=${JSON.stringify(antes)} depois=${JSON.stringify(depois)} ` +
        `esperado=${JSON.stringify(caso.esperado)}`,
    );

    await enviar(caso.caminho, caso.restaurar);
    await pausa(200);
  }

  udp.close();

  if (falhas === 0) {
    console.log(
      `\n✓ O MadMapper recebeu e aplicou o OSC do agente.\n` +
        `  Se a projeção ainda não muda, o problema NÃO é o transporte —\n` +
        `  procure nos endereços do config.json (nomes de superfície/mídia/cue).\n`,
    );
  } else {
    console.log(
      `\n✗ ${falhas} de ${CASOS.length} casos falharam.\n` +
        `  O OSC Query respondeu, então o MadMapper está aberto — mas ele não\n` +
        `  aplicou o que foi enviado. Confira se algo está travando a saída\n` +
        `  (Freeze) ou se outra ferramenta está sobrescrevendo os valores.\n`,
    );
  }

  process.exit(falhas === 0 ? 0 : 1);
}

main().catch((erro) => {
  console.error(`\n✗ ${(erro as Error).message}\n`);
  udp.close();
  process.exit(1);
});
