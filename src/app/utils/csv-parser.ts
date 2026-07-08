/**
 * Parse un contenu de texte au format CSV en un tableau d'objets.
 * Détecte automatiquement les séparateurs (virgule ou point-virgule).
 */
export function parseCSV(content: string): any[] {
  if (!content || !content.trim()) {
    return [];
  }

  // Diviser le contenu en lignes et nettoyer
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) {
    return [];
  }

  // Trouver la première ligne non vide pour les en-têtes
  let headerIndex = 0;
  while (headerIndex < lines.length && !lines[headerIndex].trim()) {
    headerIndex++;
  }

  if (headerIndex >= lines.length) {
    return [];
  }

  const headerLine = lines[headerIndex];
  
  // Détecter le séparateur
  const delimiter = headerLine.includes(';') ? ';' : ',';
  
  // Extraire les en-têtes et nettoyer les guillemets et espaces
  const headers = headerLine.split(delimiter).map(h => cleanValue(h));

  const result: any[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue; // Ignorer les lignes vides
    }

    const values = splitCSVLine(line, delimiter).map(v => cleanValue(v));
    const obj: any = {};
    
    headers.forEach((header, index) => {
      if (header) {
        obj[header] = index < values.length ? values[index] : '';
      }
    });

    result.push(obj);
  }

  return result;
}

/**
 * Nettoie une valeur en enlevant les guillemets superflus et les espaces.
 */
function cleanValue(val: string): string {
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  return cleaned.trim();
}

/**
 * Sépare une ligne CSV en tenant compte des guillemets (pour supporter les virgules dans les cellules).
 */
function splitCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
