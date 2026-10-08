# 建置網頁與 AutoCAD 外掛，並安裝成 AutoCAD 自動載入的 bundle
# 用法（在 autocad-addin 資料夾下）：powershell -ExecutionPolicy Bypass -File .\install.ps1
$ErrorActionPreference = 'Stop'
$repo   = Split-Path $PSScriptRoot -Parent
$bundle = Join-Path $env:APPDATA 'Autodesk\ApplicationPlugins\LawCheckingList.bundle'

Push-Location $repo
npm install
if ($LASTEXITCODE -ne 0) { throw 'npm install 失敗' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'npm run build 失敗' }
Pop-Location

dotnet build "$PSScriptRoot\LawCheckingList.AutoCAD.csproj" -c Release
if ($LASTEXITCODE -ne 0) { throw 'dotnet build 失敗' }

if (Test-Path $bundle) { Remove-Item $bundle -Recurse -Force }
$contents = Join-Path $bundle 'Contents'
New-Item $contents -ItemType Directory -Force | Out-Null
Copy-Item "$PSScriptRoot\PackageContents.xml" $bundle
Copy-Item "$PSScriptRoot\bin\Release\*" $contents -Recurse
Copy-Item "$repo\dist" (Join-Path $contents 'web') -Recurse

Write-Host "已安裝到 $bundle"
Write-Host '請重新啟動 AutoCAD 2021，在命令列輸入 LAWCHECK'
