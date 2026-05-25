$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot
$started = Get-Date

$ae = [char]0x00E4
$oe = [char]0x00F6
$ue = [char]0x00FC
$ss = [char]0x00DF
$moon = [char]::ConvertFromUtf32(0x1F319)
$spark = [char]::ConvertFromUtf32(0x2728)
$owl = [char]::ConvertFromUtf32(0x1F989)

function Write-Line {
    param(
        [string]$Text = "",
        [ConsoleColor]$Color = [ConsoleColor]::Gray
    )

    Write-Host $Text -ForegroundColor $Color
}

function Write-Step {
    param(
        [string]$Label,
        [string]$Text
    )

    Write-Host "[$Label] " -ForegroundColor Cyan -NoNewline
    Write-Host $Text -ForegroundColor Gray
}

function Write-Rule {
    Write-Line ("=" * 79) DarkYellow
}

function Write-SoftRule {
    Write-Line ("-" * 79) DarkGray
}

function Wait-To-Close {
    Read-Host "Enter dr$($ue)cken zum Schlie$($ss)en"
}

Clear-Host
Write-Rule
Write-Host "  FANTASY GRIND" -ForegroundColor Yellow -NoNewline
Write-Host " :: TEST CONSOLE" -ForegroundColor Cyan -NoNewline
Write-Host "  local quality gate" -ForegroundColor DarkGray
Write-Host "  Nemurenai Game Studio" -ForegroundColor Magenta -NoNewline
Write-Host "  $moon $owl $spark" -ForegroundColor Yellow
Write-Host "  night-build sentinel" -ForegroundColor DarkGray
Write-Rule
Write-Line
Write-Host "Projekt " -ForegroundColor DarkGray -NoNewline
Write-Line (Get-Location).Path Gray
Write-Host "Checks  " -ForegroundColor DarkGray -NoNewline
Write-Line "JavaScript-Syntax, Datenvertr$($ae)ge, Smoke-Test-Suite" Gray
Write-Host "Start   " -ForegroundColor DarkGray -NoNewline
Write-Line $started.ToString("HH:mm:ss") Gray
Write-Line

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    Write-Line "[ERROR] npm.cmd wurde nicht gefunden." Red
    Write-Line "Installiere Node.js oder $($oe)ffne dieses Projekt in einer Node-Umgebung." Gray
    Wait-To-Close
    exit 1
}

if (-not (Test-Path -LiteralPath "package.json")) {
    Write-Line "[ERROR] package.json wurde nicht gefunden." Red
    Write-Line "Starte diese Datei bitte aus dem Fantasy-Grind-Projektordner." Gray
    Wait-To-Close
    exit 1
}

Write-Step "SCAN" "npm gefunden"
Write-Step "LOAD" "package.json gefunden"
Write-Step "RUN " "npm test --silent"
Write-SoftRule
Write-Line

& npm.cmd test --silent
$testExit = $LASTEXITCODE
$ended = Get-Date

Write-Line
Write-SoftRule
if ($testExit -eq 0) {
    Write-Line "[PASS] TEST PASSED  Exit code 0" Green
    Write-Line
    Write-Line "        __________  ___   __________" Green
    Write-Line "       /_  __/ __ \/   | / ___/ ___/" Green
    Write-Line "        / / / /_/ / /| | \__ \\__ \ " Green
    Write-Line "       / / / ____/ ___ |___/ /__/ / " Green
    Write-Line "      /_/ /_/   /_/  |_/____/____/  " Green
    Write-Line
    Write-Line "      Alle Checks sind gr$($ue)n. Fantasy Grind ist bereit f$($ue)r den n$($ae)chsten Push." White
} else {
    Write-Line "[FAIL] TESTS FAILED  Exit code $testExit" Red
    Write-Line
    Write-Line "      Erst die Meldung oben fixen, dann wieder starten." Red
}

Write-Line
Write-Host "Start " -ForegroundColor DarkGray -NoNewline
Write-Line $started.ToString("HH:mm:ss") Gray
Write-Host "Ende  " -ForegroundColor DarkGray -NoNewline
Write-Line $ended.ToString("HH:mm:ss") Gray
Write-SoftRule
Write-Line
Wait-To-Close
exit $testExit
