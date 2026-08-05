$ErrorActionPreference = 'Continue'

$securePassword = Read-Host 'Mot de passe PostgreSQL pour alsa_app' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $env:DB_URL = 'jdbc:postgresql://localhost:5432/alsa_clean_fleet'
    $env:DB_USERNAME = 'alsa_app'
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)

    $backendDirectory = Split-Path -Parent $PSScriptRoot
    Push-Location $backendDirectory
    try {
        Write-Host 'Démarrage ALSA Clean Fleet sur http://localhost:8080' -ForegroundColor Cyan
        Write-Host 'Utilisez Ctrl+C pour arrêter le backend.' -ForegroundColor DarkGray
        & .\mvnw.cmd spring-boot:run
        $exitCode = $LASTEXITCODE
        if ($exitCode -ne 0) {
            Write-Host "BACKEND_START_FAILED exit=$exitCode" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
} catch {
    Write-Host $_ -ForegroundColor Red
    Write-Host 'BACKEND_START_FAILED' -ForegroundColor Red
} finally {
    $env:DB_PASSWORD = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}

Read-Host 'Appuyez sur Entrée pour fermer'
