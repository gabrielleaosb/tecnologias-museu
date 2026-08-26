@echo off
rem ---------------------------------------------------------------------------
rem SALA 7 - Galeria em tempo real dos depoimentos da Escada
rem So exibe: nao tem interacao. Recebe as fotos/videos por WebSocket.
rem ---------------------------------------------------------------------------
call "%~dp0_config.bat"

start "" %CHROME% --kiosk --user-data-dir="%PERFIS%\sala7" ^
  --autoplay-policy=no-user-gesture-required ^
  --noerrdialogs --disable-session-crashed-bubble --disable-infobars ^
  --app=%SISTEMA%/sala7
