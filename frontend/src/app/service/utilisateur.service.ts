import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur, UtilisateurRequest } from './api.models';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {


  private apiUrl = `${environment.apiUrl}/utilisateurs`;


  constructor(private http: HttpClient) {}


  getUtilisateurs(): Observable<Utilisateur[]> {

    return this.http.get<Utilisateur[]>(this.apiUrl);

  }
  getById(id: number): Observable<Utilisateur> { return this.http.get<Utilisateur>(`${this.apiUrl}/${id}`); }


  ajouterUtilisateur(utilisateur: UtilisateurRequest): Observable<Utilisateur>{

    return this.http.post<any>(
      this.apiUrl,
      utilisateur
    );

  }


  modifierUtilisateur(id:number, utilisateur: UtilisateurRequest): Observable<Utilisateur>{

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      utilisateur
    );

  }


  supprimerUtilisateur(id:number): Observable<void>{

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );

  }

}
