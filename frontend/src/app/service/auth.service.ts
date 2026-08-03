import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthenticatedUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  login: string;
  role: 'ADMINISTRATEUR' | 'SUPERVISEUR' | 'NETTOYEUR';
  actif: boolean;
}

interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  utilisateur: AuthenticatedUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionKey = 'alsa_authenticated_user';
  private readonly tokenKey = 'alsa_access_token';
  private readonly authenticated = signal(this.readStoredUser() !== null);
  readonly currentUser = signal<AuthenticatedUser | null>(this.readStoredUser());

  constructor(private http: HttpClient) {}

  isAuthenticated(): boolean { return this.authenticated(); }
  getToken(): string | null { return sessionStorage.getItem(this.tokenKey); }

  login(login: string, password: string): Observable<AuthenticatedUser> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
      login: login.trim(),
      motDePasse: password
    }).pipe(
      tap(response => {
      sessionStorage.setItem(this.tokenKey, response.accessToken);
      sessionStorage.setItem(this.sessionKey, JSON.stringify(response.utilisateur));
      this.currentUser.set(response.utilisateur);
      this.authenticated.set(true);
      }),
      map(response => response.utilisateur)
    );
  }

  validateSession(): Observable<boolean> {
    if (!this.getToken()) return of(false);
    return this.http.get<AuthenticatedUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        sessionStorage.setItem(this.sessionKey, JSON.stringify(user));
        this.currentUser.set(user);
        this.authenticated.set(true);
      }),
      map(user => user.role === 'ADMINISTRATEUR' && user.actif),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  validateRoles(roles: AuthenticatedUser['role'][]): Observable<boolean> {
    if (!this.getToken()) return of(false);
    return this.http.get<AuthenticatedUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        sessionStorage.setItem(this.sessionKey, JSON.stringify(user));
        this.currentUser.set(user);
        this.authenticated.set(true);
      }),
      map(user => user.actif && roles.includes(user.role)),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.sessionKey);
    this.currentUser.set(null);
    this.authenticated.set(false);
  }

  private readStoredUser(): AuthenticatedUser | null {
    try {
      const stored = sessionStorage.getItem(this.sessionKey);
      return stored ? JSON.parse(stored) as AuthenticatedUser : null;
    } catch {
      return null;
    }
  }
}
