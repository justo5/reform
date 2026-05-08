import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppItem } from '../../models/app-item.model';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './app-card.component.html',
  styleUrl: './app-card.component.css',
})
export class AppCardComponent {
  app = input.required<AppItem>();
}
