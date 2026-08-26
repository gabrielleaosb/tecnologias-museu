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
  // Para testar na própria máquina: "http://localhost:3000"
  "servidorUrl": "https://SEU-DOMINIO.com.br",

  "madmapper": {
    "host": "127.0.0.1",  // 127.0.0.1 se o agente roda na mesma máquina do MadMapper
    "porta": 8010         // porta de entrada OSC (padrão do MadMapper 6, confirmado em campo)
  },

  // Cada estado da sala -> a LISTA de mensagens OSC a enviar, em ordem.
  // null (ou lista vazia) = não dispara nada nesse estado.
  "cues": {
    "standby": [ { "endereco": "/surfaces/Maquete/visual/name", "args": ["Standby"] } ],
    "tema:cangaco": [ { "endereco": "/surfaces/Maquete/visual/name", "args": ["Cangaco"] } ],
    "fim-video": null
  }
}
```

O `config.example.json` é JSON puro (sem comentários), para poder ser copiado direto.

### Por que a ação é uma lista

A maquete tem várias superfícies, e um tema pode precisar trocar o conteúdo de mais de uma:

```jsonc
"tema:cangaco": [
  { "endereco": "/surfaces/MaqueteFrente/visual/name", "args": ["Cangaco"] },
  { "endereco": "/surfaces/MaqueteLado/visual/name",   "args": ["CangacoLado"] }
]
```

A lista também é o que permite **escolher entre as duas formas de comandar o MadMapper editando só o JSON**, sem tocar em código — ver a seção seguinte. Uma mensagem solta (o formato antigo, sem os colchetes) continua sendo aceita.

### As duas formas de comandar o MadMapper

**A) Trocar a mídia de cada superfície** — recomendado, e o que está no `config.example.json`.

```jsonc
{ "endereco": "/surfaces/<nome da superfície>/visual/name", "args": ["<nome da mídia>"] }
```

O MadMapper faz só a deformação geométrica sobre a maquete; quem decide o conteúdo é o config. Setup no museu: mapear as superfícies uma vez e carregar os vídeos com os nomes certos. Sem ritual de gravação, sem estado escondido no arquivo do MadMapper.

**B) Disparar um cue nomeado.**

```jsonc
{ "endereco": "/timelines/Bank-1/by_name/<nome do cue>/play" }
```

Exige que alguém tenha criado e **preenchido** os cues no MadMapper. Atenção: um cue recém-criado nasce **vazio** — ele dispara sem erro e não muda nada. É preciso entrar no modo de edição do cue (botão `Edit`, no rodapé do painel) para colocar parâmetros dentro dele.

### ⚠ `/presets/...` não existe no MadMapper 6

Versões antigas usavam `/presets/<nome>`. **No MadMapper 6 esse ramo não existe** — o OSC Query responde 404. Verificado contra um MadMapper 6.1.2 real. Se você encontrar essa forma em algum tutorial, ignore.

### Descobrir os endereços da sua instalação

O MadMapper serve um **OSC Query** por HTTP, na mesma porta do OSC. Abra no navegador:

```
http://127.0.0.1:8010/            # árvore completa de endereços
http://127.0.0.1:8010/?HOST_INFO  # confirma a porta e o transporte
```

É a fonte de verdade dos nomes. **Não adivinhe** — nome de superfície, de mídia e de cue aparecem ali exatamente como o agente precisa escrever. Atenção: espaço no nome vira espaço no endereço.

## Como rodar

```bash
npm start            # operação normal — envia OSC de verdade
npm run teste        # modo de teste: mostra no log o que enviaria, sem enviar nada
npm run verificar    # autoteste do codificador OSC, offline (não precisa do MadMapper)
npm run verificar-real  # testa contra um MadMapper DE VERDADE e relê o resultado
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

## Diagnóstico em campo: `npm run verificar-real`

Responde "o OSC está chegando no MadMapper?" em dez segundos, antes de você sair procurando problema em cue, projetor ou rede.

```bash
npm run verificar-real                    # 127.0.0.1:8010
npm run verificar-real -- 192.168.0.50    # outro host
npm run verificar-real -- 127.0.0.1 9000  # outra porta
```

Ele envia OSC de verdade e **relê o valor pelo OSC Query** para confirmar que o MadMapper aplicou. Usa endereços de `/master`, que existem mesmo com o projeto vazio — então **não depende de cues, superfícies ou mídias estarem configurados**, e restaura os valores originais no final.

Se passar, o transporte está bom e o problema (se houver) está nos nomes do `config.json`.

## Status da validação

- **Codificação OSC:** validada byte a byte (`npm run verificar`).
- **Transporte contra MadMapper real:** ✅ validado em 2026-08-26 contra MadMapper 6.1.2 — int32 e float32, com releitura pelo OSC Query.
- **Cadeia completa** (tablet → servidor → agente → OSC → MadMapper): ✅ validada em 2026-08-26 com o app rodando e um MadMapper real, percorrendo standby → menu → tema → fim-video → encerrando.
- **Falta:** rodar com a maquete e o projetor reais, em Piranhas.
