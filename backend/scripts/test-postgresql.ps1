$ErrorActionPreference = 'Continue'

$securePassword = Read-Host 'Mot de passe PostgreSQL pour alsa_app' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $env:DB_URL = 'jdbc:postgresql://localhost:5432/alsa_clean_fleet'
    $env:DB_USERNAME = 'alsa_app'
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)

    $backendDirectory = Split-Path -Parent $PSScriptRoot
    $log = 'C:\Users\HP\Desktop\alsa-clean-fleet-backups\backend-tests.log'
    Push-Location $backendDirectory
    try {
        & .\mvnw.cmd test 2>&1 | Tee-Object -FilePath $log
        if ($LASTEXITCODE -eq 0) {
            Write-Host 'BACKEND_TESTS_OK' -ForegroundColor Green
        } else {
            Write-Host "BACKEND_TESTS_FAILED exit=$LASTEXITCODE" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
} catch {
    Write-Host $_ -ForegroundColor Red
    Write-Host 'BACKEND_TESTS_FAILED' -ForegroundColor Red
} finally {
    $env:DB_PASSWORD = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}

Read-Host 'Appuyez sur Entree pour fermer'
