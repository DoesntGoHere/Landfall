Add-Type -AssemblyName System.Drawing

$sourcePath = Join-Path $PSScriptRoot '..\a40e935f-bed4-4ad9-8d63-e8ada2a6fff1.png'
$outputDir = Join-Path $PSScriptRoot '..\public\images\scenarios'

$bitmap = [System.Drawing.Bitmap]::new((Resolve-Path $sourcePath).Path)
$cellWidth = 256
$cellHeight = 384
$insetX = 6
$insetY = 6
$cropWidth = $cellWidth - ($insetX * 2)
$cropHeight = $cellHeight - ($insetY * 2)

$cards = @(
  @{ Name = 'flamingo-wetland.png'; Column = 0; Row = 0 },
  @{ Name = 'forest-town-factory.png'; Column = 1; Row = 0 },
  @{ Name = 'drought-river-valley.png'; Column = 2; Row = 0 },
  @{ Name = 'storm-ravaged-coast.png'; Column = 3; Row = 0 },
  @{ Name = 'algal-bloom-estuary.png'; Column = 0; Row = 1 },
  @{ Name = 'burned-forest-salvage.png'; Column = 1; Row = 1 },
  @{ Name = 'marsh-rail-endangered-hare.png'; Column = 2; Row = 1 },
  @{ Name = 'dune-reserve-tourism.png'; Column = 3; Row = 1 },
  @{ Name = 'incinerator-town.png'; Column = 0; Row = 2 },
  @{ Name = 'chemical-spill-groundwater.png'; Column = 1; Row = 2 },
  @{ Name = 'desalination-coast.png'; Column = 2; Row = 2 },
  @{ Name = 'highway-migration-corridor.png'; Column = 3; Row = 2 },
  @{ Name = 'offshore-wind-fishing-routes.png'; Column = 2; Row = 3 },
  @{ Name = 'floodplain-wetland-restoration.png'; Column = 3; Row = 3 }
)

foreach ($card in $cards) {
  $x = ($card.Column * $cellWidth) + $insetX
  $y = ($card.Row * $cellHeight) + $insetY
  $rect = [System.Drawing.Rectangle]::new($x, $y, $cropWidth, $cropHeight)
  $cropped = $bitmap.Clone($rect, $bitmap.PixelFormat)
  $destination = Join-Path $outputDir $card.Name
  $cropped.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
  $cropped.Dispose()
}

$bitmap.Dispose()

