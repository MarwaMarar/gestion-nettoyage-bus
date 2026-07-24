import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(false);
  constructor(private http: HttpClient) {}
  isAuthenticated(): boolean { return this.authenticated(); }
  login(email: string, password: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/auth/login`, {
      email,
      motDePasse: password
    }).pipe(tap(() => this.authenticated.set(true)));
  }
  logout(): void { this.authenticated.set(false); }
}
