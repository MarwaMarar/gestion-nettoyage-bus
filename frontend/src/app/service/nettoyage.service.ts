import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nettoyage, NettoyageRequest, NettoyageStats, PageResponse } from './api.models';
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
<<<<<<< HEAD
  adminCleanerPage(userId: number, page = 0, size = 10, dateDebut?: string, dateFin?: string, busId?: number): Observable<PageResponse<Nettoyage>> {
    return this.http.get<PageResponse<Nettoyage>>(`${this.url}/admin/nettoyeur/page`, { params: this.pageParams(page,size,dateDebut,dateFin,busId).set('userId',userId) });
  }
  adminSupervisorPage(userId: number, page = 0, size = 10, dateDebut?: string, dateFin?: string, busId?: number): Observable<PageResponse<Nettoyage>> {
    return this.http.get<PageResponse<Nettoyage>>(`${this.url}/admin/superviseur/page`, { params: this.pageParams(page,size,dateDebut,dateFin,busId).set('userId',userId) });
  }
=======
>>>>>>> e35a0c0 (fully works)
  valider(id: number, remarqueSuperviseur = ''): Observable<Nettoyage> {
    return this.http.put<Nettoyage>(`${this.url}/${id}/valider`, { remarqueSuperviseur });
  }
  refuser(id: number, remarqueSuperviseur: string): Observable<Nettoyage> {
    return this.http.put<Nettoyage>(`${this.url}/${id}/refuser`, { remarqueSuperviseur });
  }
<<<<<<< HEAD
  private pageParams(page: number, size: number, dateDebut?: string, dateFin?: string, busId?: number): HttpParams {
    let params = new HttpParams().set('page', page).set('size', size);
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    if (busId != null) params = params.set('busId', busId);
    return params;
  }
=======
>>>>>>> e35a0c0 (fully works)
}
