# Agente MadMapper — Sala 1

Processo pequeno que roda **no PC do museu** e traduz o estado da Sala 1 em cues do MadMapper.

```
tablet  ──┐
          ├──►  servidor (VPS)  ──WebSocket──►  agente  ──OSC/UDP──►  MadMapper  ──►  maquete
TV      ──┘
```

## Por que ele existe

O MadMapper é controlado por **OSC sobre UDP** e só aceita comandos de quem está na **mesma máquina/rede** dele. O app roda numa VPS em São Paulo, que não alcança a rede local do museu — e navegadores não enviam UDP de jeito nenhum.

O agente resolve isso invertendo o sentido da conexão: ele **sai** do museu para a VPS (como qualquer navegador faria) e, ao receber um evento, fala com o MadMapper por dentro da rede local. Não precisa de IP fixo, port forwarding nem abrir o firewall.

## Instalação no PC do museu

Requer Node.js 20+.

```bash
cd apps/agente-madmapper
npm install
cp config.example.json config.json
```

Depois edite o `config.json` (ver abaixo). Ele é ignorado pelo git — cada máquina tem o seu.

## Configuração

```jsonc
{
  // Endereço público do servidor, o mesmo que o tablet e a TV usam.
  "servidorUrl": "https://SEU-DOMINIO.com.br",

  "madmapper": {
    "host": "127.0.0.1",  // 127.0.0.1 se o agente roda na mesma máquina do MadMapper
    "porta": 8010         // porta de entrada OSC — confira em Preferences > OSC
  },

  // Um cue por estado da sala. Use null para "não disparar nada".
  "cues": {
    "standby":                { "endereco": "/presets/Standby" },
    "menu":                   { "endereco": "/presets/Menu" },
    "tema:cangaco":           { "endereco": "/presets/Cangaco" },
    "tema:cidade":            { "endereco": "/presets/Cidade" },
    "tema:rio-sao-francisco": { "endereco": "/presets/Rio Sao Francisco" },
    "tema:ferrovia":          { "endereco": "/presets/Ferrovia" },
    "tema:museu":             { "endereco": "/presets/Museu" },
    "fim-video":              null,
    "encerrando":             { "endereco": "/presets/Standby" }
  }
}
```

### ⚠️ Os endereços do exemplo são chutes

Os nomes em `config.example.json` **não foram verificados contra o MadMapper real** — são placeholders com a cara certa. Os endereços verdadeiros dependem de como os cues forem nomeados no projeto do MadMapper.

Para descobrir os nomes reais, use o **OSC Query** do MadMapper, que lista todos os endereços disponíveis. O formato costuma ser `/presets/<nome do cue>` — e atenção: **se o nome do cue tem espaço, o endereço tem espaço** (`/presets/Cue 1`, não `/presets/Cue1`).

Se algum cue precisar de argumento, adicione `"args"`:

```jsonc
{ "endereco": "/presets/Cangaco", "args": [1] }          // int32
{ "endereco": "/opacity", "args": [0.5] }                 // float32
{ "endereco": "/x", "args": [{ "tipo": "f", "valor": 2 }] } // força float
```

## Como rodar

```bash
npm start        # operação normal — envia OSC de verdade
npm run teste    # modo de teste: mostra no log o que enviaria, sem enviar nada
npm run verificar # autoteste do codificador OSC (não precisa do MadMapper)
```

O `npm run teste` é a forma de validar a configuração e a conexão **antes** de ter o MadMapper à mão.

## Mapa de estados → cues

| Estado da sala | Chave no config | Quando acontece |
|---|---|---|
| `standby` | `standby` | Ocioso, ninguém interagindo |
| `menu` | `menu` | Menu de temas (inclusive a variante "após sim") |
| `tema` | `tema:<id>` | Visitante escolheu um tema |
| `fim-video` | `fim-video` | Vídeo acabou, perguntando se quer outro |
| `encerrando` | `encerrando` | Vídeo de despedida |

Os cinco temas são `cangaco`, `cidade`, `rio-sao-francisco`, `ferrovia`, `museu` — definidos em `apps/web/lib/sala1/temas.ts`.

## Comportamento

- **Reconecta sozinho** se a internet cair; o Socket.IO faz backoff automático.
- **Redispara o cue ao reconectar**, porque o MadMapper pode ter sido reiniciado enquanto o agente estava offline.
- **Não redispara o mesmo cue** quando o servidor reemite o estado sem mudança (acontece a cada cliente novo que entra na sala).
- **Avisa uma vez** — não em loop — quando aparece um estado sem cue configurado.

## Autostart no Windows

Crie um `.bat` e coloque um atalho dele em `shell:startup`:

```bat
@echo off
cd /d C:\museu\agente-madmapper
npm start >> C:\museu\logs\agente.log 2>&1
```

Deixe o MadMapper iniciar junto e conferir que o projeto certo está aberto. Se o agente subir antes do MadMapper, não tem problema: o UDP é sem conexão e o primeiro cue chega no próximo evento.

## Ainda não testado com MadMapper real

A codificação OSC está validada byte a byte (`npm run verificar`) e o fluxo de ponta a ponta foi testado contra um servidor simulado. **O que falta é ligar num MadMapper de verdade** e confirmar os nomes dos cues e a porta OSC. Até lá, trate os endereços do `config.example.json` como provisórios.
