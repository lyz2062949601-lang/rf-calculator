#Requires -Version 5.1
<#
  创建 GitHub Release v1.0.0 并上传三个附件（文件名不含中文，避免终端编码问题）：
  - RF-Calculator-PA-v1.0.0-Windows-x64-portable.exe
  - RF-Calculator-PA-v1.0.0-Android-arm64-debug.apk
  - RF-Calculator-PA-v1.0.0-web-offline.zip

  用法（仓库根目录）：
    $env:GITHUB_TOKEN = "ghp_xxxxxxxx"   # 需含 repo 权限
    powershell -ExecutionPolicy Bypass -File scripts\publish-github-release.ps1

  若无 TOKEN：在 GitHub 网页 Releases → Draft new release → Tag v1.0.0，
  将上述三个文件拖入附件区（可先本地生成 zip，或手动打包 docs）；详见根目录 BUILDING.md。
#>
$ErrorActionPreference = "Stop"
$Owner = "lyz2062949601-lang"
$Repo = "rf-calculator"
$Tag = "v1.0.0"
$ReleaseTitle = "射频计算器（目前仅 PA）v1.0.0"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$Docs = Join-Path $Root "docs"
$ExeSrc = Join-Path $Root "artifacts\RF-Calculator-PA-1.0.0-x64-portable.exe"
$ApkSrc = Join-Path $Root "artifacts\RF-Calculator-PA-v1.0.0-arm64-debug.apk"
if (-not (Test-Path $ExeSrc)) { $ExeSrc = Join-Path $Root "dist\RF-Calculator-PA-1.0.0-x64-portable.exe" }
if (-not (Test-Path $ApkSrc)) { $ApkSrc = Join-Path $Root "dist\RF-Calculator-PA-v1.0.0-arm64-debug.apk" }

$Staging = Join-Path $Root "dist\release-upload-staging"
if (Test-Path $Staging) { Remove-Item $Staging -Recurse -Force }
New-Item -ItemType Directory -Path $Staging | Out-Null

$WebZip = Join-Path $Staging "RF-Calculator-PA-v1.0.0-web-offline.zip"
if (-not (Test-Path $Docs)) { throw "缺少 docs 目录，请先运行 scripts\sync-github-pages.cmd" }
Compress-Archive -Path (Join-Path $Docs "*") -DestinationPath $WebZip -Force

$ExeOut = Join-Path $Staging "RF-Calculator-PA-v1.0.0-Windows-x64-portable.exe"
$ApkOut = Join-Path $Staging "RF-Calculator-PA-v1.0.0-Android-arm64-debug.apk"
Copy-Item $ExeSrc $ExeOut -Force
Copy-Item $ApkSrc $ApkOut -Force

$Token = $env:GITHUB_TOKEN
if (-not $Token) { throw "请设置环境变量 GITHUB_TOKEN 后再运行本脚本。" }

$Headers = @{
  Authorization          = "Bearer $Token"
  Accept                 = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}

$ReleaseBody = @"
## 这一版里有什么？

| 文件名 | 适合谁 |
|--------|--------|
| **RF-Calculator-PA-v1.0.0-Windows-x64-portable.exe** | 使用 **Windows 10/11（64 位）** 的用户，双击即可运行，无需安装。 |
| **RF-Calculator-PA-v1.0.0-Android-arm64-debug.apk** | 使用 **安卓手机/平板（ARM64 处理器）** 的用户。安装前请在系统设置里允许「安装未知来源应用」。 |
| **RF-Calculator-PA-v1.0.0-web-offline.zip** | 想在电脑浏览器里用、或需要 **离线网页** 的用户：解压后双击里面的 **index.html** 即可。 |

**功能简介：** 记录频率与功率，计算增益 (dB)、漏极效率 DE、功率附加效率 PAE，并支持双纵轴图表与记录导出。

**隐私：** 数据保存在本机，不会上传到服务器。

**作者署名：** 丨江月
"@

$CreateUrl = "https://api.github.com/repos/$Owner/$Repo/releases"
$Payload = @{
  tag_name                 = $Tag
  name                     = $ReleaseTitle
  body                     = $ReleaseBody
  draft                    = $false
  prerelease               = $false
  generate_release_notes   = $false
} | ConvertTo-Json

$ReleaseId = $null
try {
  $existing = Invoke-RestMethod -Uri "$CreateUrl/tags/$Tag" -Headers $Headers -Method Get
  $ReleaseId = $existing.id
  Write-Host "已存在 Release id=$ReleaseId（tag $Tag），继续上传附件（若同名已存在需先在网页删除旧附件）。"
}
catch {
  $created = Invoke-RestMethod -Uri $CreateUrl -Headers $Headers -Method Post -Body $Payload -ContentType "application/json; charset=utf-8"
  $ReleaseId = $created.id
  Write-Host "已创建 Release id=$ReleaseId"
}

function Upload-ReleaseAsset {
  param([string]$FilePath)
  $name = [System.IO.Path]::GetFileName($FilePath)
  $enc = [System.Uri]::EscapeDataString($name)
  $uploadUrl = "https://uploads.github.com/repos/$Owner/$Repo/releases/$ReleaseId/assets?name=$enc"
  $bytes = [System.IO.File]::ReadAllBytes($FilePath)
  $uh = $Headers + @{ "Content-Type" = "application/octet-stream" }
  Invoke-RestMethod -Uri $uploadUrl -Headers $uh -Method Post -Body $bytes | Out-Null
  Write-Host "已上传: $name"
}

Upload-ReleaseAsset $ExeOut
Upload-ReleaseAsset $ApkOut
Upload-ReleaseAsset $WebZip

Write-Host "完成: https://github.com/$Owner/$Repo/releases/tag/$Tag"
