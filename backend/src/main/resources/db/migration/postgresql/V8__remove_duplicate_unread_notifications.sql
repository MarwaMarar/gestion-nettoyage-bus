DELETE FROM notifications duplicate
USING notifications newest
WHERE duplicate.id < newest.id
  AND duplicate.destinataire_id = newest.destinataire_id
  AND duplicate.nettoyage_id IS NOT DISTINCT FROM newest.nettoyage_id
  AND duplicate.message = newest.message
  AND duplicate.lue = FALSE
  AND newest.lue = FALSE;
