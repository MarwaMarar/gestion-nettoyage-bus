import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  login: string = '';
  password: string = '';

  messageErreur: string = '';
  afficherMotDePasse: boolean = false;
  connexionEnCours = false;

  constructor(private router: Router, private auth: AuthService) {}


  seConnecter() {
    this.messageErreur = '';
    if (!this.login.trim() || !this.password) {
      this.messageErreur = 'Veuillez saisir votre login et votre mot de passe.';
      return;
    }

    this.connexionEnCours = true;
    this.auth.login(this.login, this.password).subscribe({
      next: user => {
        this.connexionEnCours = false;
        const destination = user.mustChangePassword
          ? '/change-password'
          : user.role === 'CONSULTANT'
          ? '/consultant/tableau-de-bord'
          : user.role === 'ADMINISTRATEUR'
          ? '/admin/tableau-de-bord'
          : user.role === 'NETTOYEUR'
            ? '/nettoyeur/tableau-de-bord'
            : '/superviseur/tableau-de-bord';
        this.router.navigateByUrl(destination);
      },
      error: error => {
        this.connexionEnCours = false;
        this.messageErreur = error.status === 0
          ? "Le serveur est inaccessible. Vérifiez que le backend est démarré sur le port 8080."
          : error?.error?.message || "Login ou mot de passe incorrect.";
      }
    });
  }

}
