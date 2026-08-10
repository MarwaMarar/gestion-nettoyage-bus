import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BusExclusion, BusExclusionRequest } from './api.models';

@Injectable({ providedIn: 'root' })
export class BusExclusionService {
  private readonly url = `${environment.apiUrl}/bus-exclusions`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<BusExclusion[]> { return this.http.get<BusExclusion[]>(this.url); }
  create(value: BusExclusionRequest): Observable<BusExclusion> { return this.http.post<BusExclusion>(this.url, value); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
