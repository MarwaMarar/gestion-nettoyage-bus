UPDATE types_nettoyage
SET frequence = CASE
    WHEN LOWER(libelle) IN ('intérieur', 'nettoyage intérieur')
        THEN '7 fois par semaine'
    WHEN LOWER(libelle) IN ('extérieur', 'nettoyage extérieur')
        THEN '7 fois par semaine'
    WHEN LOWER(libelle) IN ('complet', 'nettoyage complet')
        THEN '7 fois par semaine'
    WHEN LOWER(libelle) = 'lavage rapide'
        THEN '2 fois par semaine'
    WHEN LOWER(libelle) = 'nettoyage avant mise en service'
        THEN 'Chaque 2 mois'
    WHEN LOWER(libelle) = 'désinfection'
        THEN 'Selon besoin'
    ELSE 'Selon besoin'
END
WHERE frequence IS NULL OR BTRIM(frequence) = '';
