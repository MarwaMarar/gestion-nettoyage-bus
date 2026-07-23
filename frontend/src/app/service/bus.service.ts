import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Bus, BusRequest } from './api.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BusService {
  private readonly url = `${environment.apiUrl}/bus`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<Bus[]> { return this.http.get<Bus[]>(this.url); }
  getById(id: number): Observable<Bus> { return this.http.get<Bus>(`${this.url}/${id}`); }
  create(value: BusRequest): Observable<Bus> { return this.http.post<Bus>(this.url, value); }
  update(id: number, value: BusRequest): Observable<Bus> { return this.http.put<Bus>(`${this.url}/${id}`, value); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
