# Builds the Windows desktop app: dist\AquaLuna\AquaLuna.exe with the game files in dist\AquaLuna\game.
# Needs the .NET 10 SDK. Players need nothing extra (self-contained; WebView2 ships with Windows 10/11).
param([string]$Output = (Join-Path $PSScriptRoot '..\dist\AquaLuna'))
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

# Keep the main-game build away from the separate demo and other folders.
# This script deletes its output before rebuilding, so allow only its own default path.
$allowedOutput = [System.IO.Path]::GetFullPath((Join-Path $root 'dist\AquaLuna')).TrimEnd('\', '/')
$requestedOutput = [System.IO.Path]::GetFullPath($Output).TrimEnd('\', '/')
if (-not [string]::Equals($requestedOutput, $allowedOutput, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'The main-game build output must be dist\AquaLuna inside this repository.'
}
foreach ($guardPath in @((Join-Path $root 'dist'), $allowedOutput)) {
    if (Test-Path -LiteralPath $guardPath) {
        $item = Get-Item -LiteralPath $guardPath -Force
        if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Build output must not use a symbolic link or junction: $guardPath"
        }
    }
}
$Output = $allowedOutput

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
New-Item -ItemType Directory -Force (Join-Path $game 'src') | Out-Null
Copy-Item -LiteralPath (Join-Path $root 'src\campus-v2') -Destination (Join-Path $game 'src') -Recurse
# Copy runtime collections only. Retired art and authoring projects are not payload.
foreach ($assetFolder in @('campus-v2', 'heroines', 'environment', 'fonts', 'ui', 'audio')) {
    robocopy (Join-Path $root "assets\$assetFolder") (Join-Path $game "assets\$assetFolder") /E /NFL /NDL /NJH /NJS /NP | Out-Null
    if ($LASTEXITCODE -ge 8) { throw "Copying assets failed: $assetFolder" }
}
$global:LASTEXITCODE = 0

$size = (Get-ChildItem -LiteralPath $Output -Recurse -File | Measure-Object Length -Sum).Sum / 1MB
Write-Host ("Built {0} ({1:N0} MB). Run AquaLuna.exe." -f (Join-Path $Output 'AquaLuna.exe'), $size)
