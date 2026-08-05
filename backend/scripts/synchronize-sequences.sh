#!/usr/bin/env bash
set -euo pipefail

read -rsp 'Mot de passe PostgreSQL pour alsa_app: ' PGPASSWORD
echo
export PGPASSWORD
trap 'unset PGPASSWORD' EXIT

psql -h 127.0.0.1 -p 5432 -U alsa_app -d alsa_clean_fleet -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
SELECT setval(pg_get_serial_sequence('types_bus','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM types_bus;
SELECT setval(pg_get_serial_sequence('types_nettoyage','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM types_nettoyage;
SELECT setval(pg_get_serial_sequence('utilisateurs','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM utilisateurs;
SELECT setval(pg_get_serial_sequence('bus','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM bus;
SELECT setval(pg_get_serial_sequence('nettoyages','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM nettoyages;
SELECT setval(pg_get_serial_sequence('notifications','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM notifications;
COMMIT;
SQL

echo 'SEQUENCES_SYNC_OK'
read -rp 'Appuyez sur Entree pour fermer: ' _
