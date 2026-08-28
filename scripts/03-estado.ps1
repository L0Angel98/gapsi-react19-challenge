param([string]$TargetPath = '')
$runner = Join-Path $PSScriptRoot 'challenge-runner.ps1'
& $runner -Action status -TargetPath $TargetPath

