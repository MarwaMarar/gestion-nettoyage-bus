export type Role = 'ADMINISTRATEUR' | 'NETTOYEUR' | 'SUPERVISEUR';
export type StatutNettoyage = 'EN_COURS' | 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';

export interface AuthenticatedUser {
  id: number;
  nom: string;
  prenom: string;
  matricule: string;
  email: string;
  login: string;
  role: Role;
  actif: boolean;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  utilisateur: AuthenticatedUser;
}

export interface Bus {
  id: number;
  numeroBus: string;
  typeBusId: number;
  typeBusLibelle: string;
  actif: boolean;
}

export interface TypeNettoyage {
  id: number;
  libelle: string;
  description: string | null;
}

export interface Nettoyage {
  id: number;
  busId: number;
  numeroBus: string;
  typeNettoyageId: number;
  typeNettoyageLibelle: string;
  nettoyeurId: number;
  nettoyeurNom: string;
  superviseurId: number | null;
  superviseurNom: string | null;
  dateNettoyage: string;
  heureDebut: string | null;
  heureFin: string | null;
  duree: number | null;
  remarqueNettoyeur: string | null;
  remarqueSuperviseur: string | null;
  statut: StatutNettoyage;
  dateValidation: string | null;
}
