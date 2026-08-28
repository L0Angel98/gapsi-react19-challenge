Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($env:APPDATA)) {
    throw 'No se encontró APPDATA. Quita las reglas manualmente desde Preferences: Open Keyboard Shortcuts (JSON).'
}

$userDirectory = Join-Path $env:APPDATA 'Code/User'
if (![string]::IsNullOrWhiteSpace($env:VSCODE_PORTABLE)) {
    $portableRoot = Split-Path -Parent $env:VSCODE_PORTABLE
    $userDirectory = Join-Path $portableRoot 'data/user-data/User'
}

$keybindingsPath = Join-Path $userDirectory 'keybindings.json'
if (!(Test-Path -LiteralPath $keybindingsPath)) {
    Write-Host 'No existe keybindings.json; no hay atajos Gapsi que quitar.'
    exit 0
}

$labels = @(
    'Gapsi - 1 Preparar proyecto',
    'Gapsi - 2 Continuar siguiente etapa',
    'Gapsi - Estado de etapas'
)
$raw = Get-Content -LiteralPath $keybindingsPath -Raw -Encoding utf8
try {
    $items = @($raw | ConvertFrom-Json)
}
catch {
    throw 'keybindings.json contiene comentarios o formato JSONC. Elimínalos desde Preferences: Open Keyboard Shortcuts (JSON) usando .vscode/keybindings.example.json como referencia.'
}

$remove = @($items | Where-Object {
    $command = ''
    $args = ''
    if ($null -ne $_ -and $_.PSObject.Properties.Name -contains 'command') {
        $command = [string]$_.command
    }
    if ($null -ne $_ -and $_.PSObject.Properties.Name -contains 'args') {
        $args = [string]$_.args
    }
    $command -eq 'workbench.action.tasks.runTask' -and $labels -contains $args
})
if ($remove.Count -eq 0) {
    Write-Host 'No se encontraron atajos Gapsi.'
    exit 0
}

$keep = @($items | Where-Object {
    $command = ''
    $args = ''
    if ($null -ne $_ -and $_.PSObject.Properties.Name -contains 'command') {
        $command = [string]$_.command
    }
    if ($null -ne $_ -and $_.PSObject.Properties.Name -contains 'args') {
        $args = [string]$_.args
    }
    !($command -eq 'workbench.action.tasks.runTask' -and $labels -contains $args)
})
$backup = $keybindingsPath + '.before-gapsi-remove.' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.bak'
Copy-Item -LiteralPath $keybindingsPath -Destination $backup -Force
if ($keep.Count -eq 0) {
    $new = '[]' + [Environment]::NewLine
}
else {
    $new = $keep | ConvertTo-Json -Depth 10
}
Set-Content -LiteralPath $keybindingsPath -Value $new -Encoding utf8
Write-Host ('Eliminados: ' + $remove.Count)
Write-Host ('Respaldo: ' + $backup)

