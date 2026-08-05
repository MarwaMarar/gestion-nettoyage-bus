#!/usr/bin/env bash
set -euo pipefail

read -rsp 'Mot de passe MySQL pour root: ' MYSQL_PWD
echo
read -rsp 'Mot de passe PostgreSQL pour alsa_app: ' PGPASSWORD
echo
export MYSQL_PWD PGPASSWORD

transfer_dir="$(mktemp -d)"
cleanup() {
    unset MYSQL_PWD PGPASSWORD
    rm -rf -- "$transfer_dir"
}
trap cleanup EXIT

mysql_query() {
    mysql --protocol=TCP -h 127.0.0.1 -P 3306 -u root \
        -D alsa_clean_fleet --batch --raw --skip-column-names -e "$1"
}

psql_base=(psql -h 127.0.0.1 -p 5432 -U alsa_app -d alsa_clean_fleet -v ON_ERROR_STOP=1)

mysql_query 'SELECT 1' >/dev/null
"${psql_base[@]}" -Atqc 'SELECT 1' >/dev/null

target_rows="$("${psql_base[@]}" -Atqc '
SELECT (SELECT count(*) FROM types_bus)
     + (SELECT count(*) FROM types_nettoyage)
     + (SELECT count(*) FROM utilisateurs)
     + (SELECT count(*) FROM bus)
     + (SELECT count(*) FROM nettoyages)
     + (SELECT count(*) FROM notifications);')"

if [[ "$target_rows" != '0' ]]; then
    echo "IMPORT_REFUSED: PostgreSQL contient deja $target_rows ligne(s)." >&2
    exit 3
fi

mysql_query "SELECT id,HEX(libelle) FROM types_bus ORDER BY id" >"$transfer_dir/types_bus.tsv"
mysql_query "SELECT id,HEX(libelle),IFNULL(HEX(description),CONCAT(CHAR(92),'N')) FROM types_nettoyage ORDER BY id" >"$transfer_dir/types_nettoyage.tsv"
mysql_query "SELECT id,HEX(nom),HEX(prenom),HEX(matricule),IFNULL(HEX(telephone),CONCAT(CHAR(92),'N')),HEX(email),HEX(login),IFNULL(HEX(mot_de_passe),CONCAT(CHAR(92),'N')),HEX(role),IFNULL(actif,CONCAT(CHAR(92),'N')),doit_changer_mot_de_passe FROM utilisateurs ORDER BY id" >"$transfer_dir/utilisateurs.tsv"
mysql_query "SELECT id,HEX(numero_bus),IFNULL(actif,CONCAT(CHAR(92),'N')),IFNULL(type_bus_id,CONCAT(CHAR(92),'N')),IFNULL(HEX(immatriculation),CONCAT(CHAR(92),'N')) FROM bus ORDER BY id" >"$transfer_dir/bus.tsv"
mysql_query "SELECT id,IFNULL(bus_id,CONCAT(CHAR(92),'N')),IFNULL(type_nettoyage_id,CONCAT(CHAR(92),'N')),IFNULL(nettoyeur_id,CONCAT(CHAR(92),'N')),IFNULL(superviseur_id,CONCAT(CHAR(92),'N')),IFNULL(DATE_FORMAT(date,'%Y-%m-%d'),CONCAT(CHAR(92),'N')),IFNULL(DATE_FORMAT(heure_debut,'%Y-%m-%d %H:%i:%s'),CONCAT(CHAR(92),'N')),IFNULL(DATE_FORMAT(heure_fin,'%Y-%m-%d %H:%i:%s'),CONCAT(CHAR(92),'N')),IFNULL(duree,CONCAT(CHAR(92),'N')),IFNULL(HEX(remarque_nettoyeur),CONCAT(CHAR(92),'N')),IFNULL(HEX(remarque_superviseur),CONCAT(CHAR(92),'N')),HEX(statut),IFNULL(DATE_FORMAT(date_validation,'%Y-%m-%d %H:%i:%s'),CONCAT(CHAR(92),'N')),DATE_FORMAT(date_nettoyage,'%Y-%m-%d') FROM nettoyages ORDER BY id" >"$transfer_dir/nettoyages.tsv"
mysql_query "SELECT id,destinataire_id,IFNULL(nettoyage_id,CONCAT(CHAR(92),'N')),HEX(message),lue,DATE_FORMAT(date_creation,'%Y-%m-%d %H:%i:%s') FROM notifications ORDER BY id" >"$transfer_dir/notifications.tsv"

"${psql_base[@]}" <<SQL
BEGIN;

CREATE TEMP TABLE s_types_bus (id bigint, libelle text);
\copy s_types_bus FROM '$transfer_dir/types_bus.tsv'
INSERT INTO types_bus (id,libelle)
SELECT id,convert_from(decode(libelle,'hex'),'UTF8') FROM s_types_bus;

CREATE TEMP TABLE s_types_nettoyage (id bigint, libelle text, description text);
\copy s_types_nettoyage FROM '$transfer_dir/types_nettoyage.tsv'
INSERT INTO types_nettoyage (id,libelle,description)
SELECT id,convert_from(decode(libelle,'hex'),'UTF8'),
       CASE WHEN description IS NULL THEN NULL ELSE convert_from(decode(description,'hex'),'UTF8') END
FROM s_types_nettoyage;

CREATE TEMP TABLE s_utilisateurs (id bigint, nom text, prenom text, matricule text, telephone text, email text, login text, mot_de_passe text, role text, actif text, doit_changer text);
\copy s_utilisateurs FROM '$transfer_dir/utilisateurs.tsv'
INSERT INTO utilisateurs (id,nom,prenom,matricule,telephone,email,login,mot_de_passe,role,actif,doit_changer_mot_de_passe)
SELECT id,convert_from(decode(nom,'hex'),'UTF8'),convert_from(decode(prenom,'hex'),'UTF8'),
       convert_from(decode(matricule,'hex'),'UTF8'),
       CASE WHEN telephone IS NULL THEN NULL ELSE convert_from(decode(telephone,'hex'),'UTF8') END,
       convert_from(decode(email,'hex'),'UTF8'),convert_from(decode(login,'hex'),'UTF8'),
       CASE WHEN mot_de_passe IS NULL THEN NULL ELSE convert_from(decode(mot_de_passe,'hex'),'UTF8') END,
       convert_from(decode(role,'hex'),'UTF8'),
       CASE WHEN actif IS NULL THEN NULL ELSE actif='1' END,doit_changer='1'
FROM s_utilisateurs;

CREATE TEMP TABLE s_bus (id bigint, numero_bus text, actif text, type_bus_id bigint, immatriculation text);
\copy s_bus FROM '$transfer_dir/bus.tsv'
INSERT INTO bus (id,numero_bus,actif,type_bus_id,immatriculation)
SELECT id,convert_from(decode(numero_bus,'hex'),'UTF8'),
       CASE WHEN actif IS NULL THEN NULL ELSE actif='1' END,type_bus_id,
       CASE WHEN immatriculation IS NULL THEN NULL ELSE convert_from(decode(immatriculation,'hex'),'UTF8') END
FROM s_bus;

CREATE TEMP TABLE s_nettoyages (id bigint,bus_id bigint,type_nettoyage_id bigint,nettoyeur_id bigint,superviseur_id bigint,date date,heure_debut timestamp,heure_fin timestamp,duree integer,remarque_nettoyeur text,remarque_superviseur text,statut text,date_validation timestamp,date_nettoyage date);
\copy s_nettoyages FROM '$transfer_dir/nettoyages.tsv'
INSERT INTO nettoyages (id,bus_id,type_nettoyage_id,nettoyeur_id,superviseur_id,date,heure_debut,heure_fin,duree,remarque_nettoyeur,remarque_superviseur,statut,date_validation,date_nettoyage)
SELECT id,bus_id,type_nettoyage_id,nettoyeur_id,superviseur_id,date,heure_debut,heure_fin,duree,
       CASE WHEN remarque_nettoyeur IS NULL THEN NULL ELSE convert_from(decode(remarque_nettoyeur,'hex'),'UTF8') END,
       CASE WHEN remarque_superviseur IS NULL THEN NULL ELSE convert_from(decode(remarque_superviseur,'hex'),'UTF8') END,
       convert_from(decode(statut,'hex'),'UTF8'),date_validation,date_nettoyage
FROM s_nettoyages;

CREATE TEMP TABLE s_notifications (id bigint,destinataire_id bigint,nettoyage_id bigint,message text,lue text,date_creation timestamp);
\copy s_notifications FROM '$transfer_dir/notifications.tsv'
INSERT INTO notifications (id,destinataire_id,nettoyage_id,message,lue,date_creation)
SELECT id,destinataire_id,nettoyage_id,convert_from(decode(message,'hex'),'UTF8'),lue='1',date_creation
FROM s_notifications;

SELECT setval(pg_get_serial_sequence('types_bus','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM types_bus;
SELECT setval(pg_get_serial_sequence('types_nettoyage','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM types_nettoyage;
SELECT setval(pg_get_serial_sequence('utilisateurs','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM utilisateurs;
SELECT setval(pg_get_serial_sequence('bus','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM bus;
SELECT setval(pg_get_serial_sequence('nettoyages','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM nettoyages;
SELECT setval(pg_get_serial_sequence('notifications','id'),COALESCE(MAX(id),1),MAX(id) IS NOT NULL) FROM notifications;

COMMIT;
SQL

echo 'CONTROLLED_IMPORT_OK'
