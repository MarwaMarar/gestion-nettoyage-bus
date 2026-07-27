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

  constructor(private router: Router) {
  addIcons({
    eyeOutline,
    eyeOffOutline
    });
  }

  seConnecter() {

  if (this.login === 'nettoyeur' && this.password === '1234') {

    this.router.navigate(['/dashboard']);

  } else {

    alert('Login ou mot de passe incorrect.');

  }

}

}
