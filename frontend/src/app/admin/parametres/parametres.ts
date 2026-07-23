import {Component} from '@angular/core';
import {AppLanguage,LanguageService} from '../../service/language.service';

@Component({selector:'app-parametres',standalone:true,imports:[],templateUrl:'./parametres.html',styleUrl:'./parametres.css'})
export class Parametres {
  modeSombre=false;

  constructor(readonly languageService:LanguageService){}

  get languageIndex():number {
    return ({fr:0,ar:1,en:2,es:3} as const)[this.languageService.currentLanguage];
  }

  changerLangue(event:Event):void {
    const languages:AppLanguage[]=['fr','ar','en','es'];
    this.languageService.setLanguage(languages[(event.target as HTMLSelectElement).selectedIndex]??'fr');
  }

  changerTheme():void {
    this.modeSombre=!this.modeSombre;
    if(this.modeSombre)document.documentElement.setAttribute('data-theme','dark');
    else document.documentElement.removeAttribute('data-theme');
  }
}
