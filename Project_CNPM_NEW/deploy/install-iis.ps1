[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
  [Parameter(Mandatory = $false)]
  [string]$ConfigPath = ".\\deploy\\iis.config.example.json"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Step {
  param([string]$Message)
  Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Info {
  param([string]$Message)
  Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Fail-Deployment {
  param(
    [string]$Message,
    [int]$Code = 1
  )
  Write-Error "[ERROR] $Message"
  exit $Code
}

function Assert-Command {
  param(
    [string]$Name,
    [string]$Hint
  )
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    Fail-Deployment "Thiếu command '$Name'. $Hint"
  }
  return $cmd.Source
}

function Ensure-Directory {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    if ($PSCmdlet.ShouldProcess($Path, 'Create directory')) {
      New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
  }
}

function Invoke-Npm {
  param(
    [string]$WorkingDirectory,
    [string[]]$Arguments,
    [string]$StepName
  )

  Write-Step $StepName
  if ($PSCmdlet.ShouldProcess($WorkingDirectory, "npm $($Arguments -join ' ')")) {
    Push-Location $WorkingDirectory
    try {
      & npm @Arguments
      if ($LASTEXITCODE -ne 0) {
        Fail-Deployment "Lệnh npm thất bại tại '$WorkingDirectory' với mã lỗi $LASTEXITCODE" 20
      }
    }
    finally {
      Pop-Location
    }
  }
}

function Sync-Directory {
  param(
    [string]$Source,
    [string]$Target
  )

  Write-Step "Đồng bộ '$Source' -> '$Target'"
  if (-not (Test-Path -LiteralPath $Source)) {
    Fail-Deployment "Không tìm thấy thư mục nguồn: $Source" 30
  }

  if ($PSCmdlet.ShouldProcess($Target, "Mirror copy from $Source")) {
    Ensure-Directory -Path $Target
    $null = robocopy $Source $Target /MIR /NFL /NDL /NJH /NJS /NP /R:2 /W:2
    $code = $LASTEXITCODE
    if ($code -ge 8) {
      Fail-Deployment "Robocopy thất bại khi đồng bộ '$Source' -> '$Target' (code $code)" 31
    }
  }
}

function Ensure-IisSite {
  param(
    [string]$SiteName,
    [string]$AppPool,
    [string]$PhysicalPath,
    [pscustomobject]$Binding
  )

  Import-Module WebAdministration

  if (-not (Test-Path "IIS:\\AppPools\\$AppPool")) {
    Write-Step "Tạo IIS AppPool '$AppPool'"
    if ($PSCmdlet.ShouldProcess($AppPool, 'Create IIS app pool')) {
      New-WebAppPool -Name $AppPool | Out-Null
    }
  }

  if ($PSCmdlet.ShouldProcess($AppPool, 'Set app pool managed pipeline mode')) {
    Set-ItemProperty "IIS:\\AppPools\\$AppPool" managedPipelineMode Integrated
    Set-ItemProperty "IIS:\\AppPools\\$AppPool" managedRuntimeVersion ""
  }

  $bindingInfo = "{0}:{1}:{2}" -f $Binding.ipAddress, $Binding.port, $Binding.hostName

  if (-not (Test-Path "IIS:\\Sites\\$SiteName")) {
    Write-Step "Tạo IIS Site '$SiteName'"
    if ($PSCmdlet.ShouldProcess($SiteName, 'Create IIS website')) {
      New-Website -Name $SiteName -PhysicalPath $PhysicalPath -Port ([int]$Binding.port) -HostHeader $Binding.hostName -ApplicationPool $AppPool | Out-Null
    }
  }
  else {
    Write-Step "Cập nhật IIS Site '$SiteName'"
    if ($PSCmdlet.ShouldProcess($SiteName, 'Update IIS site path and app pool')) {
      Set-ItemProperty "IIS:\\Sites\\$SiteName" -Name physicalPath -Value $PhysicalPath
      Set-ItemProperty "IIS:\\Sites\\$SiteName" -Name applicationPool -Value $AppPool
    }

    $existingBinding = Get-WebBinding -Name $SiteName -Protocol $Binding.protocol -ErrorAction SilentlyContinue |
      Where-Object { $_.bindingInformation -eq $bindingInfo }

    if (-not $existingBinding) {
      Write-Step "Thêm binding '$bindingInfo' cho site '$SiteName'"
      if ($PSCmdlet.ShouldProcess($SiteName, "Add binding $bindingInfo")) {
        New-WebBinding -Name $SiteName -Protocol $Binding.protocol -IPAddress $Binding.ipAddress -Port ([int]$Binding.port) -HostHeader $Binding.hostName | Out-Null
      }
    }
  }
}

function Ensure-BackendService {
  param(
    [string]$ServiceName,
    [string]$ServiceDisplayName,
    [string]$NssmPath,
    [string]$NodeExe,
    [string]$BackendPath,
    [string]$Entrypoint,
    [string]$EnvFilePath
  )

  if (-not (Test-Path -LiteralPath $NssmPath)) {
    Fail-Deployment "Không tìm thấy NSSM tại '$NssmPath'. Cần NSSM để chạy backend như Windows Service." 40
  }
  if (-not (Test-Path -LiteralPath $NodeExe)) {
    Fail-Deployment "Không tìm thấy Node.js executable tại '$NodeExe'." 41
  }

  $entryFullPath = Join-Path $BackendPath $Entrypoint
  if (-not (Test-Path -LiteralPath $entryFullPath)) {
    Fail-Deployment "Không tìm thấy file backend entrypoint: $entryFullPath" 42
  }

  $envLines = Get-Content -LiteralPath $EnvFilePath
  $envInline = ($envLines -join "`0")
  $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

  if (-not $service) {
    Write-Step "Tạo Windows Service '$ServiceName' bằng NSSM"
    if ($PSCmdlet.ShouldProcess($ServiceName, 'Install NSSM service')) {
      & $NssmPath install $ServiceName $NodeExe $entryFullPath
      if ($LASTEXITCODE -ne 0) {
        Fail-Deployment "Không thể tạo service '$ServiceName' (NSSM code $LASTEXITCODE)." 43
      }
    }
  }

  Write-Step "Cập nhật cấu hình service '$ServiceName'"
  if ($PSCmdlet.ShouldProcess($ServiceName, 'Configure NSSM service')) {
    & $NssmPath set $ServiceName DisplayName $ServiceDisplayName | Out-Null
    & $NssmPath set $ServiceName AppDirectory $BackendPath | Out-Null
    & $NssmPath set $ServiceName AppStdout (Join-Path $BackendPath 'service-out.log') | Out-Null
    & $NssmPath set $ServiceName AppStderr (Join-Path $BackendPath 'service-err.log') | Out-Null
    & $NssmPath set $ServiceName AppRotateFiles 1 | Out-Null
    & $NssmPath set $ServiceName AppRotateOnline 1 | Out-Null
    & $NssmPath set $ServiceName AppEnvironmentExtra $envInline | Out-Null
  }

  Write-Step "Đặt service '$ServiceName' chạy tự động"
  if ($PSCmdlet.ShouldProcess($ServiceName, 'Set service startup type')) {
    Set-Service -Name $ServiceName -StartupType Automatic
  }

  Write-Step "Khởi động (hoặc khởi động lại) service '$ServiceName'"
  if ($PSCmdlet.ShouldProcess($ServiceName, 'Restart service')) {
    if ((Get-Service -Name $ServiceName).Status -eq 'Running') {
      Restart-Service -Name $ServiceName -Force
    }
    else {
      Start-Service -Name $ServiceName
    }
  }
}

if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Fail-Deployment 'Script cần chạy bằng quyền Administrator.' 2
}

if (-not (Test-Path -LiteralPath $ConfigPath)) {
  Fail-Deployment "Không tìm thấy file config: $ConfigPath" 3
}

Write-Step "Đọc cấu hình từ '$ConfigPath'"
$config = Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendSource = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $config.paths.frontendSource))
$backendSource = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $config.paths.backendSource))
$frontendDeployPath = $config.paths.frontendDeployPath
$backendDeployPath = $config.paths.backendDeployPath

Write-Step 'Kiểm tra prerequisite bắt buộc'
if (-not (Get-WindowsFeature -Name Web-Server -ErrorAction SilentlyContinue).Installed) {
  Fail-Deployment 'Thiếu IIS (Web-Server). Hãy cài role IIS trước khi chạy script.' 10
}

Assert-Command -Name npm -Hint 'Cần cài Node.js để có npm.' | Out-Null
Assert-Command -Name $config.mysql.clientCommand -Hint 'Cần cài MySQL client và thêm vào PATH.' | Out-Null

Import-Module WebAdministration
if (-not (Get-WebGlobalModule -Name RewriteModule -ErrorAction SilentlyContinue)) {
  Fail-Deployment 'Thiếu IIS URL Rewrite Module. Cài URL Rewrite + ARR (reverse proxy) trước khi deploy.' 11
}
$proxyEnabled = Get-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' -Filter 'system.webServer/proxy' -Name 'enabled' -ErrorAction SilentlyContinue
if ($null -eq $proxyEnabled) {
  Fail-Deployment 'Thiếu IIS ARR Proxy module. Cài Application Request Routing trước khi deploy.' 13
}
if (-not [bool]$proxyEnabled.Value) {
  if ($PSCmdlet.ShouldProcess('IIS ARR Proxy', 'Enable proxy')) {
    Set-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' -Filter 'system.webServer/proxy' -Name 'enabled' -Value 'True'
  }
}

Write-Step 'Kiểm tra và tạo thư mục deploy'
Ensure-Directory -Path $frontendDeployPath
Ensure-Directory -Path $backendDeployPath

Invoke-Npm -WorkingDirectory $frontendSource -Arguments @('install') -StepName 'Cài dependencies frontend bằng npm install'
Invoke-Npm -WorkingDirectory $frontendSource -Arguments @('run', 'build') -StepName 'Build frontend production'

Sync-Directory -Source (Join-Path $frontendSource 'build') -Target $frontendDeployPath

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot 'deploy\\web.config'))) {
  Fail-Deployment 'Thiếu deploy/web.config để cấu hình IIS rewrite cho SPA.' 12
}
if ($PSCmdlet.ShouldProcess($frontendDeployPath, 'Copy deploy/web.config')) {
  Copy-Item -LiteralPath (Join-Path $repoRoot 'deploy\\web.config') -Destination (Join-Path $frontendDeployPath 'web.config') -Force
  $frontendWebConfigPath = Join-Path $frontendDeployPath 'web.config'
  $webConfigRaw = Get-Content -LiteralPath $frontendWebConfigPath -Raw
  $webConfigRaw = $webConfigRaw -replace '__BACKEND_PORT__', [string]$config.backend.port
  Set-Content -LiteralPath $frontendWebConfigPath -Value $webConfigRaw -Encoding UTF8
}

Sync-Directory -Source $backendSource -Target $backendDeployPath

Invoke-Npm -WorkingDirectory $backendDeployPath -Arguments @('ci', '--omit=dev') -StepName 'Cài dependencies backend bằng npm ci'

$envFilePath = Join-Path $backendDeployPath $config.backend.envFile
Write-Step "Tạo file env tại '$envFilePath'"
$envContent = @(
  "DB_HOST=$($config.database.host)",
  "DB_USER=$($config.database.user)",
  "DB_PASSWORD=$($config.database.password)",
  "DB_NAME=$($config.database.name)",
  "DB_PORT=$($config.database.port)",
  "PORT=$($config.backend.port)",
  "CORS_ORIGIN=$($config.backend.corsOrigin)"
)
if ($PSCmdlet.ShouldProcess($envFilePath, 'Write backend .env')) {
  Set-Content -LiteralPath $envFilePath -Value $envContent -Encoding ASCII
}
Write-Info 'Đã tạo .env backend (password được ghi file, không in ra màn hình).'

Ensure-IisSite -SiteName $config.iis.siteName -AppPool $config.iis.appPoolName -PhysicalPath $frontendDeployPath -Binding $config.iis.binding

Ensure-BackendService `
  -ServiceName $config.backend.serviceName `
  -ServiceDisplayName $config.backend.serviceDisplayName `
  -NssmPath $config.backend.nssmPath `
  -NodeExe $config.backend.nodeExe `
  -BackendPath $backendDeployPath `
  -Entrypoint $config.backend.entrypoint `
  -EnvFilePath $envFilePath

Write-Step 'Kiểm tra nhanh kết quả'
Write-Info "Frontend: $frontendDeployPath"
Write-Info "Backend service: $($config.backend.serviceName)"
Write-Info "IIS site: $($config.iis.siteName)"
Write-Info "Lưu ý: backend chạy process riêng (Windows Service qua NSSM), IIS chỉ reverse proxy /api."
Write-Host '[DONE] Triển khai hoàn tất.' -ForegroundColor Yellow
