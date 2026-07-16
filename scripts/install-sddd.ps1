<#
.SYNOPSIS
  Installs SdDD templates into an existing, empty or non-empty project.
.EXAMPLE
  .\scripts\install-sddd.ps1 -ProjectPath C:\Projects\my-app
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectPath,
  [switch]$WithGitHub,
  [switch]$WithoutClaude,
  [switch]$Overwrite
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$templateRoot = Join-Path $repoRoot 'templates'

if (-not (Test-Path -LiteralPath $ProjectPath -PathType Container)) {
  throw "ProjectPath does not exist: $ProjectPath"
}

$projectRoot = (Resolve-Path -LiteralPath $ProjectPath).Path

function Copy-SdddItem {
  param([string]$SourceRelativePath, [string]$DestinationRelativePath)

  $source = Join-Path $templateRoot $SourceRelativePath
  $destination = Join-Path $projectRoot $DestinationRelativePath

  if (-not (Test-Path -LiteralPath $source)) {
    throw "Template not found: $source"
  }

  if (Test-Path -LiteralPath $destination) {
    if (-not $Overwrite) {
      Write-Warning "Skip existing: $DestinationRelativePath"
      return
    }
    Remove-Item -LiteralPath $destination -Recurse -Force
  }

  $parent = Split-Path -Parent $destination
  New-Item -ItemType Directory -Path $parent -Force | Out-Null
  Copy-Item -LiteralPath $source -Destination $destination -Recurse -Force
  Write-Host "Installed: $DestinationRelativePath"
}

$items = @(
  @{ Source = 'SDDD.md'; Destination = 'SDDD.md' },
  @{ Source = 'AGENTS.md'; Destination = 'AGENTS.md' },
  @{ Source = 'task.md'; Destination = 'task.md' },
  @{ Source = 'docs/SPEC.md'; Destination = 'docs/SPEC.md' },
  @{ Source = 'docs/requests.md'; Destination = 'docs/requests.md' },
  @{ Source = 'docs/requests_log.md'; Destination = 'docs/requests_log.md' },
  @{ Source = 'docs/automation.md'; Destination = 'docs/automation.md' },
  @{ Source = 'docs/collaboration.md'; Destination = 'docs/collaboration.md' },
  @{ Source = 'docs/spec'; Destination = 'docs/spec' },
  @{ Source = 'handover'; Destination = 'docs/handover' }
)

if (-not $WithoutClaude) {
  $items += @{ Source = 'CLAUDE.md'; Destination = 'CLAUDE.md' }
  $items += @{ Source = '.claude'; Destination = '.claude' }
}

if ($WithGitHub) {
  $items += @{ Source = '.github'; Destination = '.github' }
}

foreach ($item in $items) {
  Copy-SdddItem -SourceRelativePath $item.Source -DestinationRelativePath $item.Destination
}

$gitignore = Join-Path $projectRoot '.gitignore'
$ignoreEntries = @('.sddd/', '.codegraph/')
if (-not (Test-Path -LiteralPath $gitignore)) {
  Set-Content -LiteralPath $gitignore -Value '# SdDD / CodeGraph local derived data' -Encoding utf8
}
foreach ($entry in $ignoreEntries) {
  if (-not (Select-String -LiteralPath $gitignore -Pattern ('^' + [regex]::Escape($entry) + '$') -Quiet)) {
    Add-Content -LiteralPath $gitignore -Value $entry -Encoding utf8
  }
}

$metadataDir = Join-Path $projectRoot '.sddd'
New-Item -ItemType Directory -Path $metadataDir -Force | Out-Null
$metadata = @(
  '# SdDD template source (local metadata; do not commit)',
  "template_root: $repoRoot",
  "installed_at: $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')"
)
Set-Content -LiteralPath (Join-Path $metadataDir 'template-source.md') -Value $metadata -Encoding utf8

Write-Host ''
Write-Host 'SdDD installed. Ask the AI to read SDDD.md, then add a request to docs/requests.md or tell it to the AI.'
