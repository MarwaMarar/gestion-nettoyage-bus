UPDATE types_nettoyage
SET frequence = 'Chaque jour'
WHERE LOWER(BTRIM(frequence)) = '7 fois par semaine';
