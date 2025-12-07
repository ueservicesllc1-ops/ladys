# Script simple para generar iconos usando .NET
Add-Type -AssemblyName System.Drawing

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

try {
    # Cargar imagen original
    $originalImage = [System.Drawing.Image]::FromFile((Resolve-Path $sourceImage))
    Write-Host "`n✓ Imagen cargada: $($originalImage.Width)x$($originalImage.Height)" -ForegroundColor Green
    
    foreach ($folder in $sizes.Keys) {
        $size = $sizes[$folder]
        $outputPath = Join-Path $outputDir $folder
        $iconPath = Join-Path $outputPath "ic_launcher.png"
        $roundIconPath = Join-Path $outputPath "ic_launcher_round.png"
        $foregroundPath = Join-Path $outputPath "ic_launcher_foreground.png"
        
        if (-not (Test-Path $outputPath)) {
            New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
        }
        
        $sizeText = "${size}x${size}"
        Write-Host "  Generando $folder ($sizeText)..." -ForegroundColor Gray
        
        # Crear bitmap redimensionado
        $bitmap = New-Object System.Drawing.Bitmap($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        
        # Dibujar imagen redimensionada
        $graphics.DrawImage($originalImage, 0, 0, $size, $size)
        
        # Guardar icono normal
        $bitmap.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Guardar foreground (mismo que el normal)
        $bitmap.Save($foregroundPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Crear icono redondo (con fondo blanco y esquinas redondeadas)
        $roundBitmap = New-Object System.Drawing.Bitmap($size, $size)
        $roundGraphics = [System.Drawing.Graphics]::FromImage($roundBitmap)
        $roundGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $roundGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        
        # Fondo blanco
        $roundGraphics.FillEllipse([System.Drawing.Brushes]::White, 0, 0, $size, $size)
        
        # Dibujar imagen en círculo
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $size, $size)
        $roundGraphics.SetClip($path)
        $roundGraphics.DrawImage($originalImage, 0, 0, $size, $size)
        $roundGraphics.ResetClip()
        
        # Guardar icono redondo
        $roundBitmap.Save($roundIconPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Liberar recursos
        $graphics.Dispose()
        $roundGraphics.Dispose()
        $bitmap.Dispose()
        $roundBitmap.Dispose()
    }
    
    $originalImage.Dispose()
    
    Write-Host "`n✓ Iconos generados exitosamente!" -ForegroundColor Green
    Write-Host "`nIconos creados en:" -ForegroundColor Cyan
    foreach ($folder in $sizes.Keys) {
        Write-Host "  - $outputDir\$folder\" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "`n✗ Error: $_" -ForegroundColor Red
    Write-Host "`nStack trace: $($_.ScriptStackTrace)" -ForegroundColor Gray
}

