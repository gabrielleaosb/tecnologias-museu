@echo off
rem ---------------------------------------------------------------------------
rem SALA 6 - Jogo da memoria (totem touch)
rem Sala autocontida: nao sincroniza com nenhuma outra tela.
rem ---------------------------------------------------------------------------
call "%~dp0_config.bat"

start "" %CHROME% --kiosk --user-data-dir="%PERFIS%\sala6" ^
  --noerrdialogs --disable-session-crashed-bubble --disable-infobars ^
  --app=%SISTEMA%/sala6
