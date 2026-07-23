export interface TypeBus { id: number; libelle: string; }
export interface TypeNettoyage { id: number; libelle: string; description: string | null; }
export interface Bus { id: number; numeroBus: string; typeBusId: number; typeBusLibelle: string; actif: boolean; }
export interface BusRequest { numeroBus: string; typeBusId: number; actif: boolean; }
export type Role = 'ADMINISTRATEUR' | 'NETTOYEUR' | 'SUPERVISEUR';
export interface Utilisateur { id: number; nom: string; prenom: string; matricule: string; telephone: string | null; email: string; login: string; role: Role; actif: boolean; }
export interface UtilisateurRequest { nom:string; prenom:string; matricule:string; telephone:string|null; email:string; login:string; motDePasse?:string; role:Role; actif:boolean; }
export type StatutNettoyage = 'EN_ATTENTE' | 'VALIDE' | 'REFUSE';
export interface Nettoyage {
  id: number; busId: number; numeroBus: string; typeNettoyageId: number; typeNettoyageLibelle: string;
  nettoyeurId: number; nettoyeurNom: string; superviseurId?: number; superviseurNom?: string; dateNettoyage: string; heureDebut?: string; heureFin?: string;
  duree?: number; remarqueNettoyeur?: string; remarqueSuperviseur?: string;
  statut: StatutNettoyage; dateValidation?: string;
}
export interface NettoyageRequest { busId: number; typeNettoyageId: number; nettoyeurId: number; superviseurId?: number; dateNettoyage: string; heureDebut?: string; heureFin?: string; duree?: number; remarqueNettoyeur?: string; remarqueSuperviseur?: string; statut: StatutNettoyage; dateValidation?: string; }
export interface NettoyageStats { total: number; enAttente: number; valides: number; refuses: number; aujourdHui: number; }
export type TypeBusDto=TypeBus; export type TypeNettoyageDto=TypeNettoyage; export type BusDto=Bus; export type UtilisateurDto=Utilisateur; export type NettoyageDto=Nettoyage;
