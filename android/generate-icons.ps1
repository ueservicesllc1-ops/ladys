# Script para generar iconos de la app desde ico.jpg
# Requiere ImageMagick o usa PowerShell para redimensionar

$sourceImage = "..\public\ico.jpg"
$outputDir = "app\src\main\res"

# Tamaños necesarios para Android
$sizes = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

Write-Host "`n=== GENERANDO ICONOS DE LA APP ===" -ForegroundColor Cyan

if (-not (Test-Path $sourceImage)) {
    Write-Host "`n✗ Error: No se encontró $sourceImage" -ForegroundColor Red
    exit 1
}

# Verificar si ImageMagick está disponible
$magick = Get-Command magick -ErrorAction SilentlyContinue

if ($magick) {
    Write-Host "`nUsando ImageMagick para generar iconos..." -ForegroundColor Yellow
    
    foreach ($folder in $sizes.Keys) {
        $size = $sizes[$folder]
        $outputPath = Join-Path $outputDir $folder
        $iconPath = Join-Path $outputPath "ic_launcher.png"
        $roundIconPath = Join-Path $outputPath "ic_launcher_round.png"
        $foregroundPath = Join-Path $outputPath "ic_launcher_foreground.png"
        
        if (-not (Test-Path $outputPath)) {
            New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
        }
        
        Write-Host "  Generando $folder ($size x $size)..." -ForegroundColor Gray
        
        # Generar icono normal
        & magick $sourceImage -resize "${size}x${size}" -background white -gravity center -extent "${size}x${size}" $iconPath
        
        # Generar icono redondo
        & magick $sourceImage -resize "${size}x${size}" -background white -gravity center -extent "${size}x${size}" -alpha set -channel A -evaluate multiply 0.0 +channel -draw "circle $($size/2),$($size/2) $($size/2),0" $roundIconPath
        
        # Generar foreground (solo la imagen sin fondo)
        & magick $sourceImage -resize "${size}x${size}" $foregroundPath
    }
    
    Write-Host "`n✓ Iconos generados exitosamente!" -ForegroundColor Green
} else {
    Write-Host "`n⚠ ImageMagick no está instalado" -ForegroundColor Yellow
    Write-Host "`nOpciones:" -ForegroundColor Cyan
    Write-Host "1. Instalar ImageMagick desde: https://imagemagick.org/script/download.php" -ForegroundColor White
    Write-Host "2. Usar una herramienta online como: https://icon.kitchen/" -ForegroundColor White
    Write-Host "3. Copiar manualmente el archivo ico.jpg y redimensionarlo" -ForegroundColor White
    Write-Host "`nTamaños necesarios:" -ForegroundColor Cyan
    foreach ($folder in $sizes.Keys) {
        $size = $sizes[$folder]
        Write-Host "  $folder : ${size}x${size} px" -ForegroundColor White
    }
}

