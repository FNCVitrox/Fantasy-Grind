@echo off
title Fantasy Grind Tests
echo.
echo Fantasy Grind - Tests starten
echo =============================
echo.

call npm test

echo.
if errorlevel 1 (
  echo TESTS FEHLGESCHLAGEN
  echo Schau dir die Fehlermeldung oben an.
) else (
  echo ALLE TESTS BESTANDEN
)
echo.
pause
