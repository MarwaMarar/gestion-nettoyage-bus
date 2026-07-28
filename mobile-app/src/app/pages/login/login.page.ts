import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon
  ]
})
export class LoginPage {

  login = '';
  password = '';

  showPassword = false;
  loading = false;

  constructor(private router: Router, private auth: AuthService) {
  addIcons({
    eyeOutline,
    eyeOffOutline
    });
  }

  seConnecter() {
    if (!this.login.trim() || !this.password) {
      alert('Veuillez saisir votre email ou login et votre mot de passe.');
      return;
    }
    this.loading = true;
    this.auth.login(this.login, this.password).subscribe({
      next: user => {
        this.loading = false;
        if (user.role === 'NETTOYEUR') {
          this.router.navigateByUrl('/dashboard');
        } else if (user.role === 'SUPERVISEUR') {
          this.router.navigateByUrl('/superviseur-dashboard');
        } else {
          this.auth.logout();
          alert("Le compte administrateur doit utiliser l'application web.");
        }
      },
      error: error => {
        this.loading = false;
        alert(error?.error?.message || 'Login ou mot de passe incorrect.');
      }
    });
  }

}
