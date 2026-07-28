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

  email: string = '';
  password: string = '';

  messageErreur: string = '';
  afficherMotDePasse: boolean = false;
  connexionEnCours = false;

  constructor(private router: Router, private auth: AuthService) {}


  seConnecter() {
    this.messageErreur = '';
    if (!this.email.trim() || !this.password) {
      this.messageErreur = 'Veuillez saisir votre email et votre mot de passe.';
      return;
    }

    this.connexionEnCours = true;
    this.auth.login(this.email, this.password).subscribe({
      next: user => {
        this.connexionEnCours = false;
        if (user.role !== 'ADMINISTRATEUR') {
          this.auth.logout();
          this.messageErreur = "Ce compte doit utiliser l'application mobile.";
          return;
        }
        this.router.navigateByUrl('/admin/tableau-de-bord');
      },
      error: error => {
        this.connexionEnCours = false;
        this.messageErreur = error.status === 0
          ? "Le serveur est inaccessible. Vérifiez que le backend est démarré sur le port 8080."
          : error?.error?.message || "Email ou mot de passe incorrect.";
      }
    });
  }

}
