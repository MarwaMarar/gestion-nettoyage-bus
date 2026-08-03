import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nettoyage, NettoyageRequest, NettoyageStats } from './api.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NettoyageService {
  private readonly url = `${environment.apiUrl}/nettoyages`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<Nettoyage[]> { return this.http.get<Nettoyage[]>(this.url); }
  getById(id: number): Observable<Nettoyage> { return this.http.get<Nettoyage>(`${this.url}/${id}`); }
  getStatistics(): Observable<NettoyageStats> { return this.http.get<NettoyageStats>(`${this.url}/statistiques`); }
  create(value: NettoyageRequest): Observable<Nettoyage> { return this.http.post<Nettoyage>(this.url, value); }
  update(id: number, value: NettoyageRequest): Observable<Nettoyage> { return this.http.put<Nettoyage>(`${this.url}/${id}`, value); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  commencer(nettoyageId: number): Observable<Nettoyage> {
    return this.http.post<Nettoyage>(`${this.url}/commencer`, { nettoyageId });
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
  valider(id: number, remarqueSuperviseur = ''): Observable<Nettoyage> {
    return this.http.put<Nettoyage>(`${this.url}/${id}/valider`, { remarqueSuperviseur });
  }
  refuser(id: number, remarqueSuperviseur: string): Observable<Nettoyage> {
    return this.http.put<Nettoyage>(`${this.url}/${id}/refuser`, { remarqueSuperviseur });
  }
}
