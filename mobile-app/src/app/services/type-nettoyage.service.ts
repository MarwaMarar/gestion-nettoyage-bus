import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TypeNettoyage } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class TypeNettoyageService {
  constructor(private http: HttpClient) {}

  all(): Observable<TypeNettoyage[]> {
    return this.http.get<TypeNettoyage[]>(`${environment.apiUrl}/types-nettoyage`);
  }
}
