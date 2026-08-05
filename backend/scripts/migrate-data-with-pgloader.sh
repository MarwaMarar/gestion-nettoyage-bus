#!/usr/bin/env bash
set -euo pipefail

read -rsp 'Mot de passe MySQL pour root: ' MYSQL_PWD
echo
read -rsp 'Mot de passe PostgreSQL pour alsa_app: ' PGPASSWORD
echo
export MYSQL_PWD PGPASSWORD

load_file="$(mktemp)"
cleanup() {
    unset MYSQL_PWD PGPASSWORD
    rm -f -- "$load_file"
}
trap cleanup EXIT

mysql_uri='mysql://root@127.0.0.1:3306/alsa_clean_fleet'
postgres_uri='postgresql://alsa_app@127.0.0.1:5432/alsa_clean_fleet'
tables=(types_bus types_nettoyage utilisateurs bus nettoyages notifications)

mysql --protocol=TCP -h 127.0.0.1 -P 3306 -u root \
    -D alsa_clean_fleet --batch --skip-column-names \
    -e 'SELECT 1' >/dev/null

psql -h 127.0.0.1 -p 5432 -U alsa_app -d alsa_clean_fleet \
    -v ON_ERROR_STOP=1 -Atqc 'SELECT 1' >/dev/null

target_rows="$({
    printf 'SELECT '
    separator=''
    for table in "${tables[@]}"; do
        printf "%s(SELECT count(*) FROM %s)" "$separator" "$table"
        separator=' + '
    done
    printf ';\n'
} | psql -h 127.0.0.1 -p 5432 -U alsa_app -d alsa_clean_fleet \
    -v ON_ERROR_STOP=1 -Atq)"

if [[ "$target_rows" != '0' ]]; then
    echo "IMPORT_REFUSED: PostgreSQL contient deja $target_rows ligne(s)." >&2
    exit 3
fi

for table in "${tables[@]}"; do
    cat >"$load_file" <<LOAD
LOAD DATABASE
     FROM ${mysql_uri}
     INTO ${postgres_uri}
 WITH data only, reset sequences, workers = 1, concurrency = 1
 INCLUDING ONLY TABLE NAMES MATCHING '${table}';
LOAD
    echo "Import de ${table}..."
    pgloader "$load_file" 2>&1 | tee /tmp/pgloader-table.log
    if grep -q ' ERROR ' /tmp/pgloader-table.log; then
        echo "PGLOADER_FAILED: ${table}" >&2
        exit 4
    fi
done

echo 'PGLOADER_IMPORT_OK'
