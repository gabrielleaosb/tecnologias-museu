@echo off
rem ---------------------------------------------------------------------------
rem SALA 1 - as duas telas (tela touch "tablet" + TV)
rem
rem Este PC tem TRES saidas de video:
rem   saida 1 -> tela touch  -> /sala1/tablet   (este script)
rem   saida 2 -> TV          -> /sala1/tv       (este script)
rem   saida 3 -> projetor    -> MadMapper       (atalho separado no startup)
rem
rem ATENCAO - as duas armadilhas que quebram isso:
rem
rem 1. --user-data-dir DIFERENTE para cada janela. Sem isso, o segundo comando
rem    NAO abre janela nova: o Chrome ve que ja existe instancia rodando e abre
rem    so uma aba dentro da primeira. Resultado: as duas telas no mesmo monitor
rem    e nada no outro, com um sintoma que nao sugere a causa.
rem
rem 2. --autoplay-policy=no-user-gesture-required na TV. A TV troca de video
rem    sozinha, sem ninguem tocar nela. Sem essa flag o video troca mas nao toca.
rem
rem AJUSTE OS --window-position: o X e a coordenada onde cada monitor comeca no
rem arranjo do Windows (Configuracoes > Sistema > Video). Os valores abaixo
rem assumem dois monitores 1920x1080 lado a lado.
rem ---------------------------------------------------------------------------
call "%~dp0_config.bat"

start "" %CHROME% --kiosk --user-data-dir="%PERFIS%\sala1-tablet" ^
  --window-position=0,0 ^
  --noerrdialogs --disable-session-crashed-bubble --disable-infobars ^
  --app=%SISTEMA%/sala1/tablet

start "" %CHROME% --kiosk --user-data-dir="%PERFIS%\sala1-tv" ^
  --window-position=1920,0 ^
  --autoplay-policy=no-user-gesture-required ^
  --noerrdialogs --disable-session-crashed-bubble --disable-infobars ^
  --app=%SISTEMA%/sala1/tv
