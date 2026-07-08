import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-barre-laterale',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './barre-laterale.html',
  styleUrl: './barre-laterale.css',
})
export class BarreLaterale {}
