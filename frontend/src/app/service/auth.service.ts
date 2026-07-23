import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authenticated = signal(false);
  isAuthenticated(): boolean { return this.authenticated(); }
  login(email: string, password: string): boolean {
    const valid = email === 'admin@alsa.ma' && password === '123456';
    this.authenticated.set(valid);
    return valid;
  }
  logout(): void { this.authenticated.set(false); }
}
