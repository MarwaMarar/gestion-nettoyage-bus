#!/usr/bin/env bash
set -uo pipefail

log='/mnt/c/Users/HP/Desktop/alsa-clean-fleet-backups/validation.log'
bash '/mnt/c/Users/HP/Desktop/gestion-nettoyage-bus/backend/scripts/validate-migration.sh' \
    2>&1 | tee "$log"
status="${PIPESTATUS[0]}"

if [[ "$status" == '0' ]]; then
    echo 'MIGRATION_VALIDATION_OK'
else
    echo "MIGRATION_VALIDATION_FAILED exit=$status"
fi

read -rp 'Appuyez sur Entree pour fermer: ' _
exit "$status"
