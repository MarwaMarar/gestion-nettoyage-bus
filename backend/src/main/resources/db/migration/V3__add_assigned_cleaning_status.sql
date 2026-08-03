ALTER TABLE nettoyages
    MODIFY COLUMN statut ENUM('ASSIGNE','EN_COURS','EN_ATTENTE','VALIDE','REFUSE') NOT NULL;

UPDATE nettoyages
SET statut = 'ASSIGNE'
WHERE statut = 'EN_ATTENTE'
  AND heure_debut IS NULL
  AND heure_fin IS NULL
  AND date_validation IS NULL;
