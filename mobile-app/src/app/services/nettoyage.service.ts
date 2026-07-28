import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Nettoyage } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class NettoyageService {
  private readonly url = `${environment.apiUrl}/nettoyages`;

  constructor(private http: HttpClient) {}

  commencer(busId: number, typeNettoyageId: number): Observable<Nettoyage> {
    return this.http.post<Nettoyage>(`${this.url}/commencer`, { busId, typeNettoyageId });
  }

  terminer(id: number, remarqueNettoyeur: string): Observable<Nettoyage> {
    return this.http.put<Nettoyage>(`${this.url}/${id}/terminer`, { remarqueNettoyeur });
  }

  mesNettoyages(): Observable<Nettoyage[]> {
    return this.http.get<Nettoyage[]>(`${this.url}/mes-nettoyages`);
  }

  enAttente(): Observable<Nettoyage[]> {
    return this.http.get<Nettoyage[]>(`${this.url}/en-attente`);
  }

  getById(id: number): Observable<Nettoyage> {
    return this.http.get<Nettoyage>(`${this.url}/${id}`);
  }

  valider(id: number, remarqueSuperviseur = ''): Observable<Nettoyage> {
    return this.http.put<Nettoyage>(`${this.url}/${id}/valider`, { remarqueSuperviseur });
  }

  refuser(id: number, remarqueSuperviseur: string): Observable<Nettoyage> {
    return this.http.put<Nettoyage>(`${this.url}/${id}/refuser`, { remarqueSuperviseur });
  }
}
