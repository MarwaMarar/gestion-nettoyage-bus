import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthenticatedUser } from '../service/auth.service';

@Component({
  selector: 'app-change-password', standalone: true, imports: [FormsModule],
  templateUrl: './change-password.html', styleUrls: ['./login.css', './change-password.css']
})
export class ChangePassword {
  password=''; confirmation=''; loading=false; error=''; showPassword=false; showConfirmation=false;
  constructor(private auth:AuthService,private router:Router){}
  get uppercase(){return /[A-Z]/.test(this.password)}get digit(){return /[0-9]/.test(this.password)}get symbol(){return /[^A-Za-z0-9\s]/.test(this.password)}
  get score(){return Number(this.uppercase)+Number(this.digit)+Number(this.symbol)}
  get strength(){return this.score<=1?'Faible':this.score===2?'Moyen':'Fort'}
  get mismatch(){return !!this.confirmation&&this.password!==this.confirmation}
  get valid(){return this.uppercase&&this.digit&&this.symbol&&!!this.confirmation&&!this.mismatch&&!this.loading}
  submit():void{if(!this.valid)return;this.loading=true;this.error='';this.auth.changePassword(this.password,this.confirmation).subscribe({next:user=>this.router.navigateByUrl(this.destination(user)),error:e=>{this.loading=false;this.error=e?.error?.message||'Impossible de changer le mot de passe.';}})}
  private destination(user:AuthenticatedUser){return user.role==='CONSULTANT'?'/consultant/tableau-de-bord':user.role==='NETTOYEUR'?'/nettoyeur/tableau-de-bord':'/superviseur/tableau-de-bord'}
}
