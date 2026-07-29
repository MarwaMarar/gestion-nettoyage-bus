import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthenticatedUser, LoginResponse, Role } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'alsa_mobile_access_token';
  private readonly userKey = 'alsa_mobile_user';

  readonly currentUser = signal<AuthenticatedUser | null>(this.readUser());

  constructor(private http: HttpClient) {}

  login(email: string, motDePasse: string): Observable<AuthenticatedUser> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      email: email.trim(),
      motDePasse
    }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.accessToken);
        localStorage.setItem(this.userKey, JSON.stringify(response.utilisateur));
        this.currentUser.set(response.utilisateur);
      }),
      map(response => response.utilisateur)
    );
  }

  validateRole(roles: Role[]): Observable<boolean> {
    if (!this.token()) return of(false);
    return this.http.get<AuthenticatedUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        localStorage.setItem(this.userKey, JSON.stringify(user));
        this.currentUser.set(user);
      }),
      map(user => user.actif && roles.includes(user.role)),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  acceptTransferredSession(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser.set(null);
  }

  private readUser(): AuthenticatedUser | null {
    try {
      const value = localStorage.getItem(this.userKey);
      return value ? JSON.parse(value) as AuthenticatedUser : null;
    } catch {
      return null;
    }
  }
}
