import { Component, inject } from '@angular/core';
import { AppCardComponent } from '../shared/app-card/app-card.component';
import { AppsService } from '../services/apps.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AppCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private appsService = inject(AppsService);
  readonly apps = this.appsService.apps;
}
