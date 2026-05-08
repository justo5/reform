import { Injectable } from '@angular/core';
import { AppItem } from '../models/app-item.model';

@Injectable({ providedIn: 'root' })
export class AppsService {
  readonly apps: AppItem[] = [
    {
      id: 'reform',
      name: 'reform.',
      description: 'Blur padding para redes sociales',
      route: '/reform',
      available: true,
    },
    {
      id: 'media-dl',
      name: 'Downloader.',
      description: 'Descarga multimedia de cualquier enlace',
      route: '/media-dl',
      available: true,
    },
    {
      id: 'placeholder-2',
      name: 'próximamente',
      description: 'Más herramientas en camino',
      route: '',
      available: false,
    },
  ];
}
