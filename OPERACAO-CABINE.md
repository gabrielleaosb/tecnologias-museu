# Operação física da Cabine Lambe-Lambe (Escada)

Guia prático para colocar o hardware da Escada (webcam USB + monitor touch + mini PC) rodando em modo kiosk, apontando pro sistema web. Complementa `PROJETO.md`.

## Hardware

- **Mini PC** (Windows ou Linux) — roda o navegador em kiosk, é o único "computador" da cabine
- **Webcam USB** conectada ao mini PC
- **Monitor touch** conectado ao mini PC (é uma tela touch, não um tablet Android/iOS — o mini PC que faz tudo)

O app web (`/escada`) é a mesma aplicação Next.js hospedada na VPS — o mini PC só roda um navegador em tela cheia apontando pra URL. Não precisa instalar nada além do navegador.

## Passo a passo

### 1. Pré-requisito: HTTPS

A captura de câmera (`getUserMedia`) só funciona em contexto seguro. Confirme que a VPS está servindo a Escada em `https://<dominio>/escada` (ver seção HTTPS em `PROJETO.md`) antes de configurar o kiosk — em `http://`, a câmera falha silenciosamente no navegador.

### 2. Perfil do Chromium persistente (crítico pra permissão de câmera)

O ponto mais importante: **use sempre a mesma pasta de perfil do Chromium**, nunca o modo `--incognito`/convidado. A permissão de câmera concedida uma vez (clicar "Permitir" no prompt do navegador) só é lembrada entre reinicializações se o perfil for persistente.

Crie uma pasta fixa pro perfil, ex:
- Windows: `C:\kiosk-profile`
- Linux: `/home/museu/kiosk-profile`

E sempre inicie o Chromium com `--user-data-dir` apontando pra ela (ver comandos abaixo).

**Passo manual único, na primeira instalação:** inicie o navegador (pode ser sem `--kiosk` nessa primeira vez, pra ver o prompt), acesse `https://<dominio>/escada`, avance até a tela de captura e clique "Permitir" quando o navegador pedir a câmera. A partir daí, com o mesmo `--user-data-dir`, a permissão persiste — inclusive depois de reiniciar o mini PC.

**Reforço opcional (caso o perfil seja apagado por engano num reset):** pré-autorizar a origem via política do Chromium, sem depender de clique manual. No Windows, via registro:

```
HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Google\Chrome
  VideoCaptureAllowedUrls (REG_SZ, tipo lista) = ["https://<dominio>"]
```
(equivalente em `Policies\Chromium` se usar Chromium puro em vez do Chrome). No Linux, arquivo de política em `/etc/chromium/policies/managed/camera.json`:
```json
{ "VideoCaptureAllowedUrls": ["https://<dominio>"] }
```

### 3. Comando de kiosk

**Windows (atalho ou `.bat` na pasta Inicializar):**
```bat
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --kiosk "https://<dominio>/escada" ^
  --user-data-dir=C:\kiosk-profile ^
  --noerrdialogs --disable-infobars ^
  --autoplay-policy=no-user-gesture-required ^
  --overscroll-history-navigation=0 --disable-pinch
```

**Linux (script de autostart, ex: `~/.config/autostart/kiosk.desktop` ou serviço systemd):**
```bash
chromium --kiosk "https://<dominio>/escada" \
  --user-data-dir=/home/museu/kiosk-profile \
  --noerrdialogs --disable-infobars \
  --autoplay-policy=no-user-gesture-required \
  --overscroll-history-navigation=0 --disable-pinch
```

Flags relevantes:
- `--kiosk`: tela cheia sem barra de endereço/navegação
- `--noerrdialogs` / `--disable-infobars`: some com popups de erro/restaurar sessão que travariam a interação
- `--autoplay-policy=no-user-gesture-required`: mesma flag já documentada pra Sala 1 — libera autoplay
- `--overscroll-history-navigation=0` / `--disable-pinch`: evita que um gesto touch acidental (arrastar, beliscar) navegue pra trás ou dê zoom, tirando o visitante do fluxo

### 4. Início automático e recuperação de falhas

- Configurar login automático do SO (sem tela de senha) — se faltar energia à noite, a cabine precisa voltar sozinha de manhã
- Desabilitar suspensão/protetor de tela/desligamento automático da tela
- Iniciar o navegador automaticamente no login (Startup folder no Windows / autostart no Linux, ou Agendador de Tarefas / systemd)
- Envolver o comando num loop que reabre o navegador se ele fechar/travar (ex: `.bat` com `:loop` + `goto loop` no Windows; `Restart=always` numa unit systemd no Linux) — isso cobre o caso de o Chromium crashar durante o dia sem ninguém por perto pra reiniciar manualmente
- Pausar atualização automática do SO/navegador durante o horário de funcionamento do museu, pra não reiniciar a tela no meio de uma sessão

### 5. Checklist de validação em campo

- [ ] Webcam é a única câmera visível pro navegador (se o mini PC tiver câmera embutida além da USB, `getUserMedia({video:true})` pode escolher a errada — nesse caso listar dispositivos e desabilitar a indesejada no gerenciador de dispositivos do SO)
- [ ] Permissão de câmera concedida sobrevive a um reboot completo do mini PC
- [ ] Toque nos campos de texto (nome, e-mail, país, estado, depoimento) abre teclado — ver item de teclado virtual em `PROJETO.md`
- [ ] Fluxo completo testado do início ao fim na tela touch real (não só mouse/teclado)
- [ ] Cabine reseta sozinha se alguém abandonar o fluxo no meio (ver timeout de inatividade em `PROJETO.md`)
- [ ] Internet do museu estável o suficiente pro upload do vídeo/foto (até 1 min de vídeo) sem timeout
