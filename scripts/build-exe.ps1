# Builds the Windows desktop app: dist\AquaLuna\AquaLuna.exe with the game files in dist\AquaLuna\game.
# Needs the .NET 10 SDK. Players need nothing extra (self-contained; WebView2 ships with Windows 10/11).
param([string]$Output = (Join-Path $PSScriptRoot '..\dist\AquaLuna'))
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if (Test-Path -LiteralPath $Output) {
    if (-not (Test-Path -LiteralPath (Join-Path $Output 'AquaLuna.exe')) -and (Get-ChildItem -LiteralPath $Output -Force | Select-Object -First 1)) {
        throw "$Output is not an earlier Aqua Luna build; refusing to delete it."
    }
    Remove-Item -LiteralPath $Output -Recurse -Force
}

dotnet publish (Join-Path $root 'launcher\AquaLuna.csproj') -c Release -r win-x64 --self-contained true `
    -p:PublishSingleFile=true -p:IncludeNativeLibrariesForSelfExtract=true -p:EnableCompressionInSingleFile=true -p:DebugType=none -o $Output
if ($LASTEXITCODE) { throw 'dotnet publish failed.' }

# Only what the game loads at runtime; Live2D work files, tests, QA captures and design docs stay out.
$game = Join-Path $Output 'game'
New-Item -ItemType Directory -Force $game | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'index.html') -Destination $game
Copy-Item -LiteralPath (Join-Path $root 'src') -Destination $game -Recurse
robocopy (Join-Path $root 'assets') (Join-Path $game 'assets') /E /XD live2d /NFL /NDL /NJH /NJS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw 'Copying assets failed.' }
$global:LASTEXITCODE = 0

$size = (Get-ChildItem -LiteralPath $Output -Recurse -File | Measure-Object Length -Sum).Sum / 1MB
Write-Host ("Built {0} ({1:N0} MB). Run AquaLuna.exe." -f (Join-Path $Output 'AquaLuna.exe'), $size)
