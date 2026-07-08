import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-barre-laterale',
  standalone: true,
  imports: [RouterLink,],
  templateUrl: './barre-laterale.html',
  styleUrl: './barre-laterale.css'
})
export class BarreLaterale {}
