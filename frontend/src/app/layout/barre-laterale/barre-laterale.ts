import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../service/layout.service';

@Component({
  selector: 'app-barre-laterale',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './barre-laterale.html',
  styleUrls: ['./barre-laterale.css']
})
export class BarreLaterale {
  layoutService = inject(LayoutService);
}
