#!/usr/bin/env bash
set -uo pipefail

log='/mnt/c/Users/HP/Desktop/alsa-clean-fleet-backups/pgloader-migration.log'
bash '/mnt/c/Users/HP/Desktop/gestion-nettoyage-bus/backend/scripts/migrate-data-with-pgloader.sh' \
    2>&1 | tee "$log"
status="${PIPESTATUS[0]}"

if [[ "$status" == '0' ]]; then
    echo 'MIGRATION_DATA_OK'
else
    echo "MIGRATION_DATA_FAILED exit=$status"
fi

read -rp 'Appuyez sur Entree pour fermer: ' _
exit "$status"
