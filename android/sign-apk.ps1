# Script para firmar y alinear el APK correctamente
# Uso: .\sign-apk.ps1

$unsignedPath = "app\build\outputs\apk\release\app-release-unsigned.apk"
$alignedPath = "app\build\outputs\apk\release\app-release-aligned.apk"
$finalPath = "app\build\outputs\apk\release\app-release.apk"
$keystorePath = "app\infieles-release-key.jks"

Write-Host "`n=== FIRMANDO Y ALINEANDO APK ===" -ForegroundColor Cyan

# Verificar que existe el APK sin firmar
if (-not (Test-Path $unsignedPath)) {
    Write-Host "`n✗ Error: No se encontró $unsignedPath" -ForegroundColor Red
    Write-Host "Primero genera el APK con: npm run cap:build:android:release" -ForegroundColor Yellow
    exit 1
}

# Buscar zipalign
$zipalign = Get-ChildItem -Path "$env:LOCALAPPDATA\Android\Sdk\build-tools\*\zipalign.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $zipalign) {
    Write-Host "`n✗ Error: zipalign no encontrado" -ForegroundColor Red
    Write-Host "Asegúrate de tener Android SDK instalado" -ForegroundColor Yellow
    exit 1
}

# Paso 1: Alinear el APK
Write-Host "`n1. Alineando APK..." -ForegroundColor Yellow
Remove-Item $alignedPath -ErrorAction SilentlyContinue
& $zipalign.FullName -v -f 4 $unsignedPath $alignedPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ Error al alinear el APK" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ APK alineado" -ForegroundColor Green

# Paso 2: Firmar el APK alineado con apksigner (herramienta moderna)
Write-Host "`n2. Firmando APK con apksigner..." -ForegroundColor Yellow
if (-not (Test-Path $keystorePath)) {
    Write-Host "`n✗ Error: Keystore no encontrado en $keystorePath" -ForegroundColor Red
    exit 1
}

# Buscar apksigner
$apksigner = Get-ChildItem -Path "$env:LOCALAPPDATA\Android\Sdk\build-tools\*\apksigner.bat" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $apksigner) {
    Write-Host "`n✗ Error: apksigner no encontrado" -ForegroundColor Red
    Write-Host "Asegúrate de tener Android SDK instalado" -ForegroundColor Yellow
    exit 1
}

# Firmar con apksigner
& $apksigner.FullName sign --ks $keystorePath --ks-pass pass:infieles2024 --key-pass pass:infieles2024 --ks-key-alias infieles --out $finalPath $alignedPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✗ Error al firmar el APK" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ APK firmado" -ForegroundColor Green

# Paso 3: Verificar firma
Write-Host "`n3. Verificando firma..." -ForegroundColor Yellow
& $apksigner.FullName verify --verbose $finalPath 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Firma verificada correctamente" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Advertencia al verificar firma" -ForegroundColor Yellow
}

Write-Host "`n✓ APK listo: $finalPath" -ForegroundColor Green
$fileInfo = Get-Item $finalPath
Write-Host "   Tamaño: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray

