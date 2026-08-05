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
  role: 'ADMINISTRATEUR' | 'SUPERVISEUR' | 'NETTOYEUR' | 'CONSULTANT';
  actif: boolean;
  mustChangePassword: boolean;
}

interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  utilisateur: AuthenticatedUser;
  mustChangePassword: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionKey = 'alsa_authenticated_user';
  private readonly tokenKey = 'alsa_access_token';
  private readonly storedUser = this.readStoredUser();
  private readonly authenticated = signal(Boolean(this.storedUser?.actif && this.isTokenUsable()));
  readonly currentUser = signal<AuthenticatedUser | null>(this.storedUser);

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

  changePassword(newPassword: string, confirmPassword: string): Observable<AuthenticatedUser> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/change-password`, { newPassword, confirmPassword }).pipe(
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
    if (!this.isTokenUsable()) {
      this.logout();
      return of(false);
    }
    return this.http.get<AuthenticatedUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap(user => {
        sessionStorage.setItem(this.sessionKey, JSON.stringify(user));
        this.currentUser.set(user);
        this.authenticated.set(Boolean(user.actif));
      }),
      map(user => Boolean(user.actif)),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  validateRoles(roles: AuthenticatedUser['role'][]): Observable<boolean> {
    return this.validateSession().pipe(
      map(valid => {
        const user = this.currentUser();
        return Boolean(valid && user && !user.mustChangePassword && roles.includes(user.role));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.sessionKey);
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

  isTokenUsable(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const encodedPayload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
      const payload = JSON.parse(atob(paddedPayload));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

}
