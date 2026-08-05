$ErrorActionPreference = 'Stop'

$securePassword = Read-Host 'Mot de passe PostgreSQL pour alsa_app' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)

try {
    $env:DB_URL = 'jdbc:postgresql://localhost:5432/alsa_clean_fleet'
    $env:DB_USERNAME = 'alsa_app'
    $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)

    $backendDirectory = Split-Path -Parent $PSScriptRoot
    $jar = Join-Path $backendDirectory 'target\alsa-clean-fleet-0.0.1-SNAPSHOT.jar'
    $log = 'C:\Users\HP\Desktop\alsa-clean-fleet-backups\postgresql_schema_init.log'

    Push-Location $backendDirectory
    try {
        & java -jar $jar --spring.main.web-application-type=none 2>&1 |
            Tee-Object -FilePath $log

        if ($LASTEXITCODE -eq 0) {
            Write-Host 'SCHEMA_INIT_OK' -ForegroundColor Green
        } else {
            Write-Host "SCHEMA_INIT_FAILED exit=$LASTEXITCODE" -ForegroundColor Red
        }
    } finally {
        Pop-Location
    }
} finally {
    $env:DB_PASSWORD = $null
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
}

Read-Host 'Appuyez sur Entree pour fermer'
