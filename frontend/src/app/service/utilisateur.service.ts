import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {


  private apiUrl = 'http://localhost:8080/api/utilisateurs';


  constructor(private http: HttpClient) {}


  getUtilisateurs(): Observable<any[]> {

    return this.http.get<any[]>(this.apiUrl);

  }


  ajouterUtilisateur(utilisateur:any): Observable<any>{

    return this.http.post<any>(
      this.apiUrl,
      utilisateur
    );

  }


  modifierUtilisateur(id:number, utilisateur:any): Observable<any>{

    return this.http.put<any>(
      `${this.apiUrl}/${id}`,
      utilisateur
    );

  }


  supprimerUtilisateur(id:number): Observable<any>{

    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );

  }

}
