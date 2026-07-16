import { Component } from '@angular/core';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [],
  templateUrl: './parametres.html',
  styleUrl: './parametres.css',
})
export class Parametres {

  modeSombre = false;


  changerTheme(){

    this.modeSombre = !this.modeSombre;


    if(this.modeSombre){

      document.documentElement.setAttribute(
        'data-theme',
        'dark'
      );

    } else {

      document.documentElement.removeAttribute(
        'data-theme'
      );

    }

  }

}
