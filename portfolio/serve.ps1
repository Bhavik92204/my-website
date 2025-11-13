# Simple static file server for the portfolio using .NET HttpListener
# Usage: powershell -ExecutionPolicy Bypass -File serve.ps1

param(
  [int]$Port = 8088
)

Add-Type -AssemblyName System.Net.HttpListener
Add-Type -AssemblyName System.IO.Compression.FileSystem

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path  # folder of this script

function Get-ContentType([string]$path) {
  switch ([IO.Path]::GetExtension($path).ToLower()) {
    '.html' { 'text/html; charset=utf-8' ; break }
    '.css'  { 'text/css; charset=utf-8' ; break }
    '.js'   { 'application/javascript; charset=utf-8' ; break }
    '.json' { 'application/json; charset=utf-8' ; break }
    '.svg'  { 'image/svg+xml' ; break }
    '.png'  { 'image/png' ; break }
    '.jpg'  { 'image/jpeg' ; break }
    '.jpeg' { 'image/jpeg' ; break }
    '.webp' { 'image/webp' ; break }
    '.ico'  { 'image/x-icon' ; break }
    '.pdf'  { 'application/pdf' ; break }
    default { 'application/octet-stream' }
  }
}

function Normalize-Path([string]$relative) {
  if ([string]::IsNullOrWhiteSpace($relative)) { return Join-Path $root 'index.html' }
  $rel = $relative.TrimStart('/')
  if ($rel -eq '') { return Join-Path $root 'index.html' }
  $full = Join-Path $root $rel
  if ((Test-Path $full) -and (Get-Item $full).PSIsContainer) {
    $full = Join-Path $full 'index.html'
  }
  # Prevent path traversal outside root
  $fullResolved = [IO.Path]::GetFullPath($full)
  if (-not $fullResolved.StartsWith([IO.Path]::GetFullPath($root))) {
    return $null
  }
  return $fullResolved
}

try {
  $listener.Start()
  Write-Host "Serving $root at $prefix (Ctrl+C to stop)"
} catch {
  Write-Error "Failed to start listener on $prefix. Try another port with -Port 8090 or run PowerShell as Administrator. $_"
  exit 1
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $request.Url.AbsolutePath
    $localPath = Normalize-Path $path

    if (-not $localPath -or -not (Test-Path $localPath)) {
      $response.StatusCode = 404
      $bytes = [Text.Encoding]::UTF8.GetBytes("Not Found")
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
      continue
    }

    try {
      $bytes = [IO.File]::ReadAllBytes($localPath)
      $response.ContentType = Get-ContentType $localPath
      $response.ContentLength64 = $bytes.Length
      # Basic cache headers for static assets
      if ($localPath -match '\\assets\\') { $response.AddHeader('Cache-Control', 'public, max-age=3600') }
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
    } catch {
      $response.StatusCode = 500
      $err = [Text.Encoding]::UTF8.GetBytes("Server Error")
      $response.OutputStream.Write($err, 0, $err.Length)
      $response.Close()
    }
  } catch {
    # Listener might be closing; break loop on severe errors
    if (-not $listener.IsListening) { break }
  }
}

$listener.Stop()