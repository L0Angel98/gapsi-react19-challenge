param(
    [ValidateSet('bootstrap', 'next', 'status', 'reset', 'finalize')]
    [string]$Action = 'status',

    [string]$TargetPath = '',

    [switch]$Force,

    [switch]$NoServer
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$script:RunnerRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if ([string]::IsNullOrWhiteSpace($TargetPath)) {
    $script:TargetRoot = $script:RunnerRoot
}
elseif (Test-Path -LiteralPath $TargetPath) {
    $script:TargetRoot = (Resolve-Path -LiteralPath $TargetPath).Path
}
else {
    $script:TargetRoot = [System.IO.Path]::GetFullPath((Join-Path (Get-Location).Path $TargetPath))
}

$script:StatePath = Join-Path $script:TargetRoot '.challenge-state.json'
$script:LogPath = Join-Path $script:TargetRoot 'docs/challenge-runner.log'
$script:ManualPath = Join-Path $script:RunnerRoot 'docs/manual-construccion.md'
$script:CurrentState = $null

function Ensure-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (!(Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Ensure-Target {
    Ensure-Directory -Path $script:TargetRoot
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'docs')
}

function Write-Log {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Message)

    Ensure-Target
    $line = '{0} {1}' -f (Get-Date -Format 's'), $Message
    Add-Content -LiteralPath $script:LogPath -Value $line -Encoding utf8
}

function Write-RunnerMessage {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Message)

    Write-Host $Message
    Write-Log -Message $Message
}

function New-EmptyState {
    [pscustomobject]@{
        version = 1
        target = $script:TargetRoot
        completed = @()
        tracked = @()
        updatedAt = (Get-Date).ToString('o')
    }
}

function Get-State {
    if (!(Test-Path -LiteralPath $script:StatePath)) {
        return New-EmptyState
    }

    try {
        $raw = Get-Content -LiteralPath $script:StatePath -Raw -Encoding utf8
        $parsed = $raw | ConvertFrom-Json
    }
    catch {
        throw "No se pudo leer $($script:StatePath). Revisa el JSON o usa -Action reset."
    }

    $completed = @()
    $tracked = @()
    if ($parsed.PSObject.Properties.Name -contains 'completed') {
        $completed = @($parsed.completed | ForEach-Object { [string]$_ })
    }
    if ($parsed.PSObject.Properties.Name -contains 'tracked') {
        $tracked = @($parsed.tracked | ForEach-Object { [string]$_ })
    }

    [pscustomobject]@{
        version = 1
        target = $script:TargetRoot
        completed = $completed
        tracked = $tracked
        updatedAt = (Get-Date).ToString('o')
    }
}

function Save-State {
    Ensure-Target
    $script:CurrentState.updatedAt = (Get-Date).ToString('o')
    $script:CurrentState | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $script:StatePath -Encoding utf8
}

function Add-TrackedFile {
    param([Parameter(Mandatory = $true)][string]$RelativePath)

    if (!(@($script:CurrentState.tracked) -contains $RelativePath)) {
        $script:CurrentState.tracked = @($script:CurrentState.tracked) + $RelativePath
    }
}

function Is-StageComplete {
    param([Parameter(Mandatory = $true)][string]$Id)

    return @($script:CurrentState.completed) -contains $Id
}

function Complete-Stage {
    param([Parameter(Mandatory = $true)][string]$Id)

    if (!(Is-StageComplete -Id $Id)) {
        $script:CurrentState.completed = @($script:CurrentState.completed) + $Id
    }
    Save-State
}

function Get-StageDefinitions {
    @(
        [pscustomobject]@{
            id = 'bootstrap'
            title = 'Preparar proyecto'
            description = 'Crea el proyecto Vite si la carpeta está vacía, prepara carpetas, Git y archivos de soporte.'
            files = @('.gitignore', 'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 'scripts/challenge-runner.ps1', 'scripts/01-preparar-proyecto.ps1', 'scripts/02-siguiente-etapa.ps1', 'scripts/03-estado.ps1', 'scripts/instalar-atajos.ps1', 'scripts/desinstalar-atajos.ps1', '.vscode/tasks.json', '.vscode/keybindings.example.json')
        }
        [pscustomobject]@{
            id = 'dependencies'
            title = 'Instalar dependencias'
            description = 'Configura package.json desde el manual, instala MUI, Bootstrap, Vitest y las dependencias del reto.'
            files = @('package.json')
        }
        [pscustomobject]@{
            id = 'foundation'
            title = 'Fundación y tema'
            description = 'Define el contrato Product, ThemeProvider MUI y el punto de entrada de React.'
            files = @('src/types/product.ts', 'src/theme.ts', 'src/main.tsx')
        }
        [pscustomobject]@{
            id = 'header'
            title = 'Header y shell visual'
            description = 'Monta la cabecera con identidad Gapsi y layout adaptable.'
            files = @('src/components/Header.tsx')
        }
        [pscustomobject]@{
            id = 'data'
            title = 'Datos y arquitectura'
            description = 'Implementa normalización, Repository, Strategy, Factory y proxy REST.'
            files = @('src/services/productNormalizer.ts', 'src/services/productRepository.ts', 'src/services/repositoryFactory.ts', 'vite.config.ts', '.env.example')
        }
        [pscustomobject]@{
            id = 'search'
            title = 'Búsqueda y paginación'
            description = 'Añade búsqueda, debounce, sentinel de IntersectionObserver y carga incremental.'
            files = @('src/hooks/useProductSearch.ts', 'src/hooks/useIntersectionSentinel.ts', 'src/components/SearchBar.tsx', 'src/components/ProductGrid.tsx')
        }
        [pscustomobject]@{
            id = 'catalog'
            title = 'Tarjetas del catálogo'
            description = 'Construye las tarjetas de producto con estados de carga, errores y drag source.'
            files = @('src/components/ProductCard.tsx')
        }
        [pscustomobject]@{
            id = 'cart'
            title = 'Carrito y drag and drop'
            description = 'Conecta reducer, hook, dropzone, teclado, touch y la composición principal.'
            files = @('src/state/cartReducer.ts', 'src/hooks/useCart.ts', 'src/components/CartDropzone.tsx', 'src/App.tsx')
        }
        [pscustomobject]@{
            id = 'platform'
            title = 'Estilos, Bootstrap y PWA'
            description = 'Aplica el estilo global sin sombra problemática, Bootstrap Grid CDN, manifest y service worker.'
            files = @('src/index.css', 'index.html', 'public/manifest.webmanifest', 'public/sw.js', 'public/gapsi-logo.svg', 'public/pwa-icon-192.svg', 'public/pwa-icon-512.svg')
        }
        [pscustomobject]@{
            id = 'graphql'
            title = 'Preparación GraphQL opcional'
            description = 'Activa el adapter/facade GraphQL únicamente por configuración, con límites y allowlist.'
            files = @('src/services/graphqlFacade.ts', 'src/vite-env.d.ts', '.env.example')
        }
        [pscustomobject]@{
            id = 'qa'
            title = 'Calidad y pruebas'
            description = 'Copia la configuración de Vitest, ejecuta lint, pruebas y build.'
            files = @('vitest.config.ts', 'src/test/setup.ts', 'src/services/graphqlFacade.test.ts', 'src/services/productRepository.test.ts', 'src/services/repositoryFactory.test.ts', 'src/state/cartReducer.test.ts')
        }
        [pscustomobject]@{
            id = 'delivery'
            title = 'Entrega documentada'
            description = 'Genera el reporte final y deja comandos seguros para commit y Pull Request.'
            files = @('docs/challenge-runner-report.md')
        }
    )
}

function Test-Prerequisites {
    $required = @('node', 'pnpm')
    foreach ($commandName in $required) {
        if (!(Get-Command $commandName -ErrorAction SilentlyContinue)) {
            throw "No se encontró '$commandName'. Instálalo antes de continuar."
        }
    }

    Write-RunnerMessage -Message ("Node: " + ((& node --version) -join ' '))
    Write-RunnerMessage -Message ("pnpm: " + ((& pnpm --version) -join ' '))
}

function Invoke-External {
    param(
        [Parameter(Mandatory = $true)][string]$File,
        [Parameter()][string[]]$Arguments = @()
    )

    $display = (($File) + ' ' + ($Arguments -join ' ')).Trim()
    Write-RunnerMessage -Message ("$ " + $display)
    & $File @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Falló el comando: $display"
    }
}

function Get-ManualCode {
    param([Parameter(Mandatory = $true)][string]$RelativePath)

    if (!(Test-Path -LiteralPath $script:ManualPath)) {
        return $null
    }

    $manual = Get-Content -LiteralPath $script:ManualPath -Raw -Encoding utf8
    $escapedPath = [regex]::Escape($RelativePath)
    $fence = ([char]96).ToString() * 3
    $escapedFence = [regex]::Escape($fence)
    $pattern = '(?ms)^### [^\r\n]*' + $escapedPath + '[^\r\n]*\r?\n\r?\n' + $escapedFence + '[^\r\n]*\r?\n(?<code>.*?)\r?\n' + $escapedFence
    $match = [regex]::Match($manual, $pattern)
    if ($match.Success) {
        return $match.Groups['code'].Value.TrimEnd()
    }

    return $null
}

function Write-ImplementationFile {
    param(
        [Parameter(Mandatory = $true)][string]$RelativePath,
        [bool]$Overwrite = $false
    )

    $source = Get-ManualCode -RelativePath $RelativePath
    $fallbackPath = Join-Path $script:RunnerRoot $RelativePath
    if ([string]::IsNullOrWhiteSpace($source) -and (Test-Path -LiteralPath $fallbackPath)) {
        $source = Get-Content -LiteralPath $fallbackPath -Raw -Encoding utf8
    }
    if ([string]::IsNullOrWhiteSpace($source)) {
        throw "No existe bloque de código ni archivo fuente para '$RelativePath'."
    }

    $destination = Join-Path $script:TargetRoot $RelativePath
    if ((Test-Path -LiteralPath $destination) -and !$Overwrite) {
        Write-RunnerMessage -Message ("Ya existe, se conserva: " + $RelativePath)
        Add-TrackedFile -RelativePath $RelativePath
        return
    }

    Ensure-Directory -Path (Split-Path -Parent $destination)
    Set-Content -LiteralPath $destination -Value $source -Encoding utf8
    Add-TrackedFile -RelativePath $RelativePath
    Write-RunnerMessage -Message ("Escrito: " + $RelativePath)
}

function Copy-SupportFile {
    param(
        [Parameter(Mandatory = $true)][string]$RelativePath,
        [bool]$Overwrite = $false
    )

    $source = Join-Path $script:RunnerRoot $RelativePath
    $destination = Join-Path $script:TargetRoot $RelativePath
    if (!(Test-Path -LiteralPath $source)) {
        Write-RunnerMessage -Message ("Soporte no disponible todavía: " + $RelativePath)
        return
    }
    if ((Test-Path -LiteralPath $destination) -and !$Overwrite) {
        Add-TrackedFile -RelativePath $RelativePath
        return
    }
    Ensure-Directory -Path (Split-Path -Parent $destination)
    Copy-Item -LiteralPath $source -Destination $destination -Force
    Add-TrackedFile -RelativePath $RelativePath
    Write-RunnerMessage -Message ("Copiado: " + $RelativePath)
}

function Initialize-Project {
    Ensure-Target
    $packagePath = Join-Path $script:TargetRoot 'package.json'
    if (!(Test-Path -LiteralPath $packagePath)) {
        $visibleItems = @(Get-ChildItem -LiteralPath $script:TargetRoot -Force | Where-Object { $_.Name -notin @('.challenge-state.json', 'docs') })
        if ($visibleItems.Count -gt 0) {
            throw "La carpeta destino no está vacía y no contiene package.json. Usa otra carpeta o revisa el contenido."
        }

        Test-Prerequisites
        Invoke-External -File 'pnpm.cmd' -Arguments @('create', 'vite@latest', '.', '--template', 'react-ts')
    }

    Ensure-Directory -Path (Join-Path $script:TargetRoot 'src')
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'src/components')
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'src/hooks')
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'src/services')
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'src/state')
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'src/types')
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'src/test')
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'public')
    Ensure-Directory -Path (Join-Path $script:TargetRoot 'scripts')
    Ensure-Directory -Path (Join-Path $script:TargetRoot '.vscode')

    if (!(Test-Path -LiteralPath (Join-Path $script:TargetRoot '.git'))) {
        if (Get-Command git -ErrorAction SilentlyContinue) {
            Push-Location $script:TargetRoot
            try {
                Invoke-External -File 'git' -Arguments @('init')
                Invoke-External -File 'git' -Arguments @('branch', '-M', 'main')
            }
            finally {
                Pop-Location
            }
        }
        else {
            Write-RunnerMessage -Message 'Git no está instalado; se omitió la inicialización.'
        }
    }

    $support = @(
        '.gitignore',
        'tsconfig.json',
        'tsconfig.app.json',
        'tsconfig.node.json',
        'vitest.config.ts',
        'src/test/setup.ts',
        'index.html',
        'public/gapsi-logo.svg',
        'public/pwa-icon-192.svg',
        'public/pwa-icon-512.svg',
        'scripts/obfuscate.mjs',
        'docs/manual-construccion.md',
        'docs/requirements.md',
        'docs/requirements-matrix.md',
        'docs/architecture-and-patterns.md',
        'docs/design-guide.md',
        'docs/exam-log.md',
        'resources/README.md',
        'resources/implementation-notes.md'
    )
    foreach ($file in $support) {
        Copy-SupportFile -RelativePath $file -Overwrite:$Force
    }

    Copy-SupportFile -RelativePath 'scripts/challenge-runner.ps1' -Overwrite:$true
    Copy-SupportFile -RelativePath 'scripts/01-preparar-proyecto.ps1' -Overwrite:$true
    Copy-SupportFile -RelativePath 'scripts/02-siguiente-etapa.ps1' -Overwrite:$true
    Copy-SupportFile -RelativePath 'scripts/03-estado.ps1' -Overwrite:$true
    Copy-SupportFile -RelativePath 'scripts/instalar-atajos.ps1' -Overwrite:$true
    Copy-SupportFile -RelativePath 'scripts/desinstalar-atajos.ps1' -Overwrite:$true
    Copy-SupportFile -RelativePath '.vscode/keybindings.example.json' -Overwrite:$true
    Copy-SupportFile -RelativePath '.vscode/tasks.json' -Overwrite:$true
}

function Start-DevServer {
    if ($NoServer) {
        Write-RunnerMessage -Message 'Servidor omitido por -NoServer.'
        return
    }

    if (!(Test-Path -LiteralPath (Join-Path $script:TargetRoot 'node_modules'))) {
        Write-RunnerMessage -Message 'El servidor se iniciará después de instalar dependencias.'
        return
    }

    Write-RunnerMessage -Message 'Iniciando servidor Vite en http://localhost:5173 ...'
    $process = Start-Process -FilePath 'pnpm.cmd' -ArgumentList @('dev', '--', '--host', '127.0.0.1') -WorkingDirectory $script:TargetRoot -PassThru -WindowStyle Normal
    Write-RunnerMessage -Message ("Servidor iniciado (PID " + $process.Id + "). Cierra esa ventana cuando termines.")
}

function Invoke-Stage {
    param([Parameter(Mandatory = $true)][pscustomobject]$Stage)

    $overwrite = $Force -or ($script:TargetRoot -ne $script:RunnerRoot)
    Write-RunnerMessage -Message ''
    Write-RunnerMessage -Message ("=== Etapa " + $Stage.id + ": " + $Stage.title + " ===")
    Write-RunnerMessage -Message $Stage.description

    switch ($Stage.id) {
        'bootstrap' {
            Test-Prerequisites
            Initialize-Project
        }
        'dependencies' {
            Test-Prerequisites
            Write-ImplementationFile -RelativePath 'package.json' -Overwrite:$overwrite
            Push-Location $script:TargetRoot
            try {
                Invoke-External -File 'pnpm.cmd' -Arguments @('install')
            }
            finally {
                Pop-Location
            }
            Start-DevServer
        }
        'foundation' {
            Write-ImplementationFile -RelativePath 'src/types/product.ts' -Overwrite:$overwrite
            Write-ImplementationFile -RelativePath 'src/theme.ts' -Overwrite:$overwrite
            Write-ImplementationFile -RelativePath 'src/main.tsx' -Overwrite:$overwrite
        }
        'header' {
            Write-ImplementationFile -RelativePath 'src/components/Header.tsx' -Overwrite:$overwrite
        }
        'data' {
            foreach ($file in $Stage.files) {
                Write-ImplementationFile -RelativePath $file -Overwrite:$overwrite
            }
        }
        'search' {
            foreach ($file in $Stage.files) {
                Write-ImplementationFile -RelativePath $file -Overwrite:$overwrite
            }
        }
        'catalog' {
            Write-ImplementationFile -RelativePath 'src/components/ProductCard.tsx' -Overwrite:$overwrite
        }
        'cart' {
            foreach ($file in $Stage.files) {
                Write-ImplementationFile -RelativePath $file -Overwrite:$overwrite
            }
        }
        'platform' {
            foreach ($file in $Stage.files) {
                Write-ImplementationFile -RelativePath $file -Overwrite:$overwrite
            }
        }
        'graphql' {
            foreach ($file in $Stage.files) {
                Write-ImplementationFile -RelativePath $file -Overwrite:$overwrite
            }
        }
        'qa' {
            foreach ($file in $Stage.files) {
                Write-ImplementationFile -RelativePath $file -Overwrite:$overwrite
            }
            Push-Location $script:TargetRoot
            try {
                Test-Prerequisites
                Invoke-External -File 'pnpm.cmd' -Arguments @('lint')
                Invoke-External -File 'pnpm.cmd' -Arguments @('test')
                Invoke-External -File 'pnpm.cmd' -Arguments @('build')
            }
            finally {
                Pop-Location
            }
        }
        'delivery' {
            $rows = foreach ($item in Get-StageDefinitions) {
                $mark = if (Is-StageComplete -Id $item.id) { '[x]' } else { '[ ]' }
                "- $mark $($item.id): $($item.title)"
            }
            $report = @"
# Reporte del runner del challenge

Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Destino: $($script:TargetRoot)

## Checklist

$($rows -join [Environment]::NewLine)

## Verificación manual antes de entregar

1. Ejecuta pnpm dev y revisa desktop, tablet y móvil.
2. Prueba búsqueda vacía, error HTTP, carga incremental y botón Reintentar.
3. Arrastra una tarjeta al carrito y repite con teclado y touch.
4. Confirma que la sombra visual no aparece como una franja sobre las imágenes.
5. Revisa Lighthouse/PWA y el endpoint REST o GraphQL elegido.
6. Configura el BFF GraphQL externo antes de activar VITE_PRODUCT_DATA_SOURCE=graphql.

## Commit y PR

El runner nunca publica ni hace push por sí solo. Después de revisar los cambios:

    git status
    git add -- <archivos revisados>
    git commit -m "feat: build Gapsi React challenge"
    git push -u origin main

Para abrir PR con GitHub CLI, define remoto, base y permisos:

    gh pr create --base develop --head main --title "feat: Gapsi React challenge"

El BFF, CORS, autenticación, rate limiting y límites de consulta GraphQL pertenecen al backend externo.
"@
            $reportPath = Join-Path $script:TargetRoot 'docs/challenge-runner-report.md'
            Set-Content -LiteralPath $reportPath -Value $report -Encoding utf8
            Add-TrackedFile -RelativePath 'docs/challenge-runner-report.md'
            Write-RunnerMessage -Message 'Generado: docs/challenge-runner-report.md'
        }
        default {
            throw "Etapa desconocida: $($Stage.id)"
        }
    }

    Complete-Stage -Id $Stage.id
    Write-RunnerMessage -Message ("Etapa completada: " + $Stage.id)
}

function Invoke-Status {
    if (!(Test-Path -LiteralPath $script:StatePath)) {
        Write-Host ("Sin estado todavía para: " + $script:TargetRoot)
        Write-Host 'Usa -Action bootstrap para preparar el proyecto.'
        return
    }

    $stages = @(Get-StageDefinitions)
    foreach ($stage in $stages) {
        $mark = if (Is-StageComplete -Id $stage.id) { '[x]' } else { '[ ]' }
        Write-Host ("$mark " + $stage.id + ' - ' + $stage.title)
    }

    $next = $stages | Where-Object { !(Is-StageComplete -Id $_.id) } | Select-Object -First 1
    if ($null -ne $next) {
        Write-Host ''
        Write-Host ("Siguiente: " + $next.id + ' - ' + $next.title)
    }
    else {
        Write-Host ''
        Write-Host 'Todas las etapas están completas. Puedes usar -Action finalize.'
    }
}

function Invoke-Reset {
    Ensure-Target
    if (Test-Path -LiteralPath $script:StatePath) {
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $backup = Join-Path $script:TargetRoot ('.challenge-state.' + $stamp + '.json')
        Move-Item -LiteralPath $script:StatePath -Destination $backup
        Write-RunnerMessage -Message ("Estado anterior respaldado en: " + (Split-Path -Leaf $backup))
    }
    $script:CurrentState = New-EmptyState
    Save-State
    Write-RunnerMessage -Message 'Estado reiniciado. No se borraron archivos del proyecto.'
}

function Invoke-Finalize {
    $stages = @(Get-StageDefinitions)
    $pending = @($stages | Where-Object { !(Is-StageComplete -Id $_.id) })
    if ($pending.Count -gt 0) {
        throw ("Faltan etapas: " + (($pending | ForEach-Object { $_.id }) -join ', '))
    }

    if (!(Get-Command git -ErrorAction SilentlyContinue)) {
        Write-RunnerMessage -Message 'Git no está disponible. Revisa y ejecuta commit/PR manualmente.'
        return
    }

    Push-Location $script:TargetRoot
    try {
        & git status --short
        $confirmation = Read-Host 'Escribe COMMIT para crear el commit; cualquier otra respuesta cancela'
        if ($confirmation -cne 'COMMIT') {
            Write-RunnerMessage -Message 'Commit cancelado. No se modificó el índice de Git.'
            return
        }

        $tracked = @($script:CurrentState.tracked | Where-Object { $_ -and (Test-Path -LiteralPath (Join-Path $script:TargetRoot $_)) })
        if ($tracked.Count -eq 0) {
            throw 'No hay archivos registrados para staging.'
        }

        $gitAddArgs = @('add', '--') + $tracked
        Invoke-External -File 'git' -Arguments $gitAddArgs
        Invoke-External -File 'git' -Arguments @('commit', '-m', 'feat: build Gapsi React challenge')
        Write-RunnerMessage -Message 'Commit creado. Revisa el remoto y publica la rama manualmente.'
    }
    finally {
        Pop-Location
    }
}

try {
    Ensure-Target
    $script:CurrentState = Get-State

    switch ($Action) {
        'status' {
            Invoke-Status
        }
        'reset' {
            Invoke-Reset
        }
        'bootstrap' {
            $stage = @(Get-StageDefinitions | Where-Object { $_.id -eq 'bootstrap' })[0]
            if (!(Is-StageComplete -Id $stage.id)) {
                Invoke-Stage -Stage $stage
            }
            else {
                Write-RunnerMessage -Message 'Bootstrap ya completado. Usa -Action next para continuar.'
            }
        }
        'next' {
            $nextStage = @(Get-StageDefinitions | Where-Object { !(Is-StageComplete -Id $_.id) })[0]
            if ($null -eq $nextStage) {
                Write-RunnerMessage -Message 'No hay etapas pendientes. Usa -Action finalize.'
            }
            else {
                Invoke-Stage -Stage $nextStage
            }
        }
        'finalize' {
            Invoke-Finalize
        }
    }
}
catch {
    Write-Error $_
    exit 1
}









