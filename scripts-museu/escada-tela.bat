@echo off
rem ---------------------------------------------------------------------------
rem ESCADA - Cabine lambe-lambe (foto/video do visitante)
rem
rem Precisa de HTTPS: getUserMedia (webcam) so funciona em contexto seguro.
rem Se %SISTEMA% estiver em http://, a camera nao abre e o erro nao e obvio.
rem
rem A permissao de camera/microfone precisa ser concedida UMA VEZ neste perfil,
rem a mao, antes de virar kiosk. Ver AUTOMACAO-PCS.md, secao "Permissoes".
rem ---------------------------------------------------------------------------
call "%~dp0_config.bat"

start "" %CHROME% --kiosk --user-data-dir="%PERFIS%\escada" ^
  --noerrdialogs --disable-session-crashed-bubble --disable-infobars ^
  --app=%SISTEMA%/escada
