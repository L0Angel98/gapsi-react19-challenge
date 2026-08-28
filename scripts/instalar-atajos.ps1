param(
    [switch]$Preview
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($env:APPDATA)) {
    throw 'No se encontró APPDATA. Abre VS Code en Windows o añade los atajos manualmente.'
}

$userDirectory = Join-Path $env:APPDATA 'Code/User'
if (![string]::IsNullOrWhiteSpace($env:VSCODE_PORTABLE)) {
    $portableRoot = Split-Path -Parent $env:VSCODE_PORTABLE
    $userDirectory = Join-Path $portableRoot 'data/user-data/User'
}

$keybindingsPath = Join-Path $userDirectory 'keybindings.json'
$entries = @(
    [ordered]@{
        key = 'ctrl+alt+g p'
        command = 'workbench.action.tasks.runTask'
        args = 'Gapsi - 1 Preparar proyecto'
    }
    [ordered]@{
        key = 'ctrl+alt+g n'
        command = 'workbench.action.tasks.runTask'
        args = 'Gapsi - 2 Continuar siguiente etapa'
    }
    [ordered]@{
        key = 'ctrl+alt+g s'
        command = 'workbench.action.tasks.runTask'
        args = 'Gapsi - Estado de etapas'
    }
)

$entryJson = ($entries | ConvertTo-Json -Depth 5).Trim()
$entryBody = $entryJson.Substring(1, $entryJson.Length - 2).Trim()
$raw = if (Test-Path -LiteralPath $keybindingsPath) {
    Get-Content -LiteralPath $keybindingsPath -Raw -Encoding utf8
}
else {
    '[]'
}

$missing = @($entries | Where-Object {
    $needle = [regex]::Escape([string]$_.args)
    $raw -notmatch $needle
})

if ($missing.Count -eq 0) {
    Write-Host 'Los atajos ya están instalados.'
    exit 0
}

if ($Preview) {
    Write-Host ("Archivo: " + $keybindingsPath)
    Write-Host 'Se agregarían:'
    $missing | ConvertTo-Json -Depth 5
    exit 0
}

function Ensure-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (!(Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

Ensure-Directory -Path $userDirectory
$nl = [Environment]::NewLine
$trimmed = $raw.Trim()
if ($trimmed -eq '' -or $trimmed -eq '[]') {
    $newRaw = '[' + $nl + $entryBody + $nl + ']' + $nl
}
else {
    $closingIndex = $trimmed.LastIndexOf(']')
    if ($closingIndex -lt 0) {
        throw "No se encontró el cierre de keybindings.json. Haz una copia manual y agrega el bloque de .vscode/keybindings.example.json."
    }

    $prefix = $trimmed.Substring(0, $closingIndex)
    $suffix = $trimmed.Substring($closingIndex)
    if ($prefix -match '(?m)^\s*//') {
        throw 'El archivo keybindings.json termina con un comentario antes de ]. Agrega los atajos manualmente desde .vscode/keybindings.example.json.'
    }

    $separator = if ($prefix.TrimEnd().EndsWith('[')) { '' } else { ',' }
    $newRaw = $prefix.TrimEnd() + $separator + $nl + $entryBody + $nl + $suffix + $nl
}

$backupPath = $keybindingsPath + '.' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.bak'
if (Test-Path -LiteralPath $keybindingsPath) {
    Copy-Item -LiteralPath $keybindingsPath -Destination $backupPath -Force
    Write-Host ("Copia de seguridad: " + $backupPath)
}
Set-Content -LiteralPath $keybindingsPath -Value $newRaw -Encoding utf8
Write-Host ("Atajos instalados en: " + $keybindingsPath)
Write-Host 'Reinicia o vuelve a enfocar VS Code si no aparecen inmediatamente.'

