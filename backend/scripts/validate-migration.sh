#!/usr/bin/env bash
set -euo pipefail

read -rsp 'Mot de passe MySQL pour root: ' MYSQL_PWD
echo
read -rsp 'Mot de passe PostgreSQL pour alsa_app: ' PGPASSWORD
echo
export MYSQL_PWD PGPASSWORD
trap 'unset MYSQL_PWD PGPASSWORD' EXIT

report_dir='/mnt/c/Users/HP/Desktop/alsa-clean-fleet-backups/validation'
mkdir -p "$report_dir"

mysql_query() {
    mysql --protocol=TCP -h 127.0.0.1 -P 3306 -u root \
        -D alsa_clean_fleet --batch --raw --skip-column-names -e "$1"
}

postgres_query() {
    psql -h 127.0.0.1 -p 5432 -U alsa_app -d alsa_clean_fleet \
        -v ON_ERROR_STOP=1 -At -F $'\t' -c "$1"
}

mysql_query "
SELECT 'bus',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM bus
UNION ALL SELECT 'nettoyages',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM nettoyages
UNION ALL SELECT 'notifications',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM notifications
UNION ALL SELECT 'types_bus',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM types_bus
UNION ALL SELECT 'types_nettoyage',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM types_nettoyage
UNION ALL SELECT 'utilisateurs',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM utilisateurs
ORDER BY 1;" >"$report_dir/mysql_counts.tsv"

postgres_query "
SELECT 'bus',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM bus
UNION ALL SELECT 'nettoyages',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM nettoyages
UNION ALL SELECT 'notifications',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM notifications
UNION ALL SELECT 'types_bus',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM types_bus
UNION ALL SELECT 'types_nettoyage',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM types_nettoyage
UNION ALL SELECT 'utilisateurs',COUNT(*),COALESCE(MIN(id),0),COALESCE(MAX(id),0) FROM utilisateurs
ORDER BY 1;" >"$report_dir/postgresql_counts.tsv"

mysql_query "SELECT id,libelle FROM types_bus ORDER BY id" >"$report_dir/mysql_types_bus.tsv"
postgres_query "SELECT id,libelle FROM types_bus ORDER BY id" >"$report_dir/postgresql_types_bus.tsv"

mysql_query "SELECT id,libelle,COALESCE(description,'<NULL>') FROM types_nettoyage ORDER BY id" >"$report_dir/mysql_types_nettoyage.tsv"
postgres_query "SELECT id,libelle,COALESCE(description,'<NULL>') FROM types_nettoyage ORDER BY id" >"$report_dir/postgresql_types_nettoyage.tsv"

mysql_query "SELECT id,nom,prenom,matricule,COALESCE(telephone,'<NULL>'),email,login,COALESCE(MD5(mot_de_passe),'<NULL>'),role,CASE WHEN actif=1 THEN 'true' WHEN actif=0 THEN 'false' ELSE '<NULL>' END,CASE WHEN doit_changer_mot_de_passe=1 THEN 'true' ELSE 'false' END FROM utilisateurs ORDER BY id" >"$report_dir/mysql_utilisateurs.tsv"
postgres_query "SELECT id,nom,prenom,matricule,COALESCE(telephone,'<NULL>'),email,login,COALESCE(md5(mot_de_passe),'<NULL>'),role,COALESCE(actif::text,'<NULL>'),doit_changer_mot_de_passe::text FROM utilisateurs ORDER BY id" >"$report_dir/postgresql_utilisateurs.tsv"

mysql_query "SELECT id,numero_bus,CASE WHEN actif=1 THEN 'true' WHEN actif=0 THEN 'false' ELSE '<NULL>' END,COALESCE(type_bus_id,'<NULL>'),COALESCE(immatriculation,'<NULL>') FROM bus ORDER BY id" >"$report_dir/mysql_bus.tsv"
postgres_query "SELECT id,numero_bus,COALESCE(actif::text,'<NULL>'),COALESCE(type_bus_id::text,'<NULL>'),COALESCE(immatriculation,'<NULL>') FROM bus ORDER BY id" >"$report_dir/postgresql_bus.tsv"

mysql_query "SELECT id,COALESCE(bus_id,'<NULL>'),COALESCE(type_nettoyage_id,'<NULL>'),COALESCE(nettoyeur_id,'<NULL>'),COALESCE(superviseur_id,'<NULL>'),COALESCE(DATE_FORMAT(date,'%Y-%m-%d'),'<NULL>'),COALESCE(DATE_FORMAT(heure_debut,'%Y-%m-%d %H:%i:%s'),'<NULL>'),COALESCE(DATE_FORMAT(heure_fin,'%Y-%m-%d %H:%i:%s'),'<NULL>'),COALESCE(duree,'<NULL>'),COALESCE(remarque_nettoyeur,'<NULL>'),COALESCE(remarque_superviseur,'<NULL>'),statut,COALESCE(DATE_FORMAT(date_validation,'%Y-%m-%d %H:%i:%s'),'<NULL>'),DATE_FORMAT(date_nettoyage,'%Y-%m-%d') FROM nettoyages ORDER BY id" >"$report_dir/mysql_nettoyages.tsv"
postgres_query "SELECT id,COALESCE(bus_id::text,'<NULL>'),COALESCE(type_nettoyage_id::text,'<NULL>'),COALESCE(nettoyeur_id::text,'<NULL>'),COALESCE(superviseur_id::text,'<NULL>'),COALESCE(to_char(date,'YYYY-MM-DD'),'<NULL>'),COALESCE(to_char(heure_debut,'YYYY-MM-DD HH24:MI:SS'),'<NULL>'),COALESCE(to_char(heure_fin,'YYYY-MM-DD HH24:MI:SS'),'<NULL>'),COALESCE(duree::text,'<NULL>'),COALESCE(remarque_nettoyeur,'<NULL>'),COALESCE(remarque_superviseur,'<NULL>'),statut,COALESCE(to_char(date_validation,'YYYY-MM-DD HH24:MI:SS'),'<NULL>'),to_char(date_nettoyage,'YYYY-MM-DD') FROM nettoyages ORDER BY id" >"$report_dir/postgresql_nettoyages.tsv"

mysql_query "SELECT id,destinataire_id,COALESCE(nettoyage_id,'<NULL>'),message,CASE WHEN lue=1 THEN 'true' ELSE 'false' END,DATE_FORMAT(date_creation,'%Y-%m-%d %H:%i:%s') FROM notifications ORDER BY id" >"$report_dir/mysql_notifications.tsv"
postgres_query "SELECT id,destinataire_id,COALESCE(nettoyage_id::text,'<NULL>'),message,lue::text,to_char(date_creation,'YYYY-MM-DD HH24:MI:SS') FROM notifications ORDER BY id" >"$report_dir/postgresql_notifications.tsv"

for table in types_bus types_nettoyage utilisateurs bus nettoyages notifications; do
    diff -u "$report_dir/mysql_${table}.tsv" "$report_dir/postgresql_${table}.tsv" >"$report_dir/${table}.diff"
done
diff -u "$report_dir/mysql_counts.tsv" "$report_dir/postgresql_counts.tsv" >"$report_dir/counts.diff"

postgres_query "
SELECT 'bus_type',COUNT(*) FROM bus b LEFT JOIN types_bus t ON t.id=b.type_bus_id WHERE b.type_bus_id IS NOT NULL AND t.id IS NULL
UNION ALL SELECT 'nettoyage_bus',COUNT(*) FROM nettoyages n LEFT JOIN bus b ON b.id=n.bus_id WHERE n.bus_id IS NOT NULL AND b.id IS NULL
UNION ALL SELECT 'nettoyage_type',COUNT(*) FROM nettoyages n LEFT JOIN types_nettoyage t ON t.id=n.type_nettoyage_id WHERE n.type_nettoyage_id IS NOT NULL AND t.id IS NULL
UNION ALL SELECT 'nettoyage_nettoyeur',COUNT(*) FROM nettoyages n LEFT JOIN utilisateurs u ON u.id=n.nettoyeur_id WHERE n.nettoyeur_id IS NOT NULL AND u.id IS NULL
UNION ALL SELECT 'nettoyage_superviseur',COUNT(*) FROM nettoyages n LEFT JOIN utilisateurs u ON u.id=n.superviseur_id WHERE n.superviseur_id IS NOT NULL AND u.id IS NULL;" >"$report_dir/postgresql_orphans.tsv"

postgres_query "
SELECT 'utilisateurs.email',COUNT(*) FROM (SELECT email FROM utilisateurs GROUP BY email HAVING COUNT(*)>1) d
UNION ALL SELECT 'utilisateurs.login',COUNT(*) FROM (SELECT login FROM utilisateurs GROUP BY login HAVING COUNT(*)>1) d
UNION ALL SELECT 'utilisateurs.matricule',COUNT(*) FROM (SELECT matricule FROM utilisateurs GROUP BY matricule HAVING COUNT(*)>1) d
UNION ALL SELECT 'types_nettoyage.libelle',COUNT(*) FROM (SELECT libelle FROM types_nettoyage GROUP BY libelle HAVING COUNT(*)>1) d
UNION ALL SELECT 'bus.immatriculation',COUNT(*) FROM (SELECT immatriculation FROM bus WHERE immatriculation IS NOT NULL GROUP BY immatriculation HAVING COUNT(*)>1) d;" >"$report_dir/postgresql_duplicates.tsv"

postgres_query "
SELECT 'types_bus',last_value,(SELECT MAX(id) FROM types_bus) FROM types_bus_id_seq
UNION ALL SELECT 'types_nettoyage',last_value,(SELECT MAX(id) FROM types_nettoyage) FROM types_nettoyage_id_seq
UNION ALL SELECT 'utilisateurs',last_value,(SELECT MAX(id) FROM utilisateurs) FROM utilisateurs_id_seq
UNION ALL SELECT 'bus',last_value,(SELECT MAX(id) FROM bus) FROM bus_id_seq
UNION ALL SELECT 'nettoyages',last_value,(SELECT MAX(id) FROM nettoyages) FROM nettoyages_id_seq
UNION ALL SELECT 'notifications',last_value,(SELECT MAX(id) FROM notifications) FROM notifications_id_seq
ORDER BY 1;" >"$report_dir/postgresql_sequences.tsv"

echo 'VALIDATION_OK'
