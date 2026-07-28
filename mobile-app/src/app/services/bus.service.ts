import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bus } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class BusService {
  constructor(private http: HttpClient) {}

  active(): Observable<Bus[]> {
    return this.http.get<Bus[]>(`${environment.apiUrl}/bus/actifs`);
  }
}
