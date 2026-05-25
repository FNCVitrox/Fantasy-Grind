@echo off
setlocal
title Fantasy Grind - Testlauf

cd /d "%~dp0"

echo.
echo ==================================================
echo   FANTASY GRIND - QUALITAETSCHECK
echo ==================================================
echo.
echo Projektordner:
echo %CD%
echo.

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo [FEHLER] npm.cmd wurde nicht gefunden.
  echo Installiere Node.js oder oeffne dieses Projekt in einer Node-Umgebung.
  echo.
  pause
  exit /b 1
)

if not exist package.json (
  echo [FEHLER] package.json wurde nicht gefunden.
  echo Starte die Datei bitte aus dem Fantasy-Grind-Projektordner.
  echo.
  pause
  exit /b 1
)

echo Starte Tests...
echo --------------------------------------------------
echo.

call npm.cmd test
set "TEST_EXIT=%ERRORLEVEL%"

echo.
echo --------------------------------------------------
if "%TEST_EXIT%"=="0" (
  echo [OK] ALLE TESTS BESTANDEN
  echo Fantasy Grind ist bereit fuer den naechsten Push.
) else (
  echo [STOPP] TESTS FEHLGESCHLAGEN
  echo Bitte die Fehlermeldung oben anschauen und erst danach pushen.
)
echo --------------------------------------------------
echo.
pause
exit /b %TEST_EXIT%
