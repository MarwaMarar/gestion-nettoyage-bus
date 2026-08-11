UPDATE nettoyages n
SET statut = 'REFUSE'
WHERE n.statut = 'EN_ATTENTE'
  AND n.heure_debut IS NULL
  AND n.heure_fin IS NULL
  AND n.date_validation IS NULL
  AND n.remarque_superviseur IS NOT NULL
  AND BTRIM(n.remarque_superviseur) <> ''
  AND EXISTS (
      SELECT 1
      FROM notifications notification
      WHERE notification.nettoyage_id = n.id
        AND LOWER(notification.message) LIKE '%refus%'
  );
