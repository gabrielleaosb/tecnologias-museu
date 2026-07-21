/**
 * Autoteste do codificador OSC — roda com `npm run verificar`.
 *
 * Confere o formato do pacote sem precisar do MadMapper ligado: alinhamento em 4 bytes,
 * NUL terminador, type tag e leitura de volta dos argumentos. Se estes testes passam,
 * o que sai na rede é uma mensagem OSC 1.0 válida; o que resta validar em campo é só
 * se o *endereço* configurado corresponde a um cue que existe no projeto do MadMapper.
 */
import { montarMensagemOsc } from "./osc.ts";
import type { ArgumentoOsc } from "./osc.ts";

let falhas = 0;

function conferir(descricao: string, condicao: boolean): void {
  if (condicao) {
    console.log(`  ok   ${descricao}`);
  } else {
    console.log(`  FALHA ${descricao}`);
    falhas++;
  }
}

function tamanho(endereco: string, args: ArgumentoOsc[], esperado: number): void {
  const pacote = montarMensagemOsc(endereco, args);
  conferir(
    `"${endereco}" com ${args.length} arg(s) → ${pacote.length} bytes (esperado ${esperado})`,
    pacote.length === esperado,
  );
}

console.log("\nVerificando codificação OSC:\n");

// "/presets/Cue 1" = 14 bytes + NUL = 15 → alinhado para 16; type tag "," = 2 → 4. Total 20.
tamanho("/presets/Cue 1", [], 20);
// "/presets/next" = 13 + NUL = 14 → 16; ",i" = 3 → 4; int32 = 4. Total 24.
tamanho("/presets/next", [1], 24);
// "/a" = 2 + NUL = 3 → 4; "," = 2 → 4. Total 8.
tamanho("/a", [], 8);

const pacote = montarMensagemOsc("/presets/Cue 1");
conferir("tamanho é múltiplo de 4", pacote.length % 4 === 0);
conferir("endereço preservado", pacote.subarray(0, 14).toString("ascii") === "/presets/Cue 1");
conferir("NUL terminador após o endereço", pacote[14] === 0);
conferir("padding zerado", pacote[15] === 0);
conferir("type tag começa com vírgula", pacote.subarray(16, 17).toString("ascii") === ",");

const comInteiro = montarMensagemOsc("/presets/next", [1]);
conferir("int32 lido de volta", comInteiro.readInt32BE(comInteiro.length - 4) === 1);
conferir("type tag do int é ',i'", comInteiro.subarray(16, 18).toString("ascii") === ",i");

const comFloat = montarMensagemOsc("/x", [0.5]);
conferir("float32 lido de volta", comFloat.readFloatBE(comFloat.length - 4) === 0.5);

const comTexto = montarMensagemOsc("/x", ["oi"]);
conferir("string codificada", comTexto.subarray(8, 10).toString("ascii") === "oi");

const forcado = montarMensagemOsc("/x", [{ tipo: "f", valor: 2 }]);
conferir("tipo forçado para float", forcado.readFloatBE(forcado.length - 4) === 2);

conferir("booleano vira int 1", montarMensagemOsc("/x", [true]).readInt32BE(8) === 1);

let recusou = false;
try {
  montarMensagemOsc("presets/sem-barra");
} catch {
  recusou = true;
}
conferir("recusa endereço sem barra inicial", recusou);

if (falhas > 0) {
  console.log(`\n✗ ${falhas} verificação(ões) falharam.\n`);
  process.exit(1);
}
console.log("\n✓ Codificação OSC válida.\n");
