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
      icon: '🖼️',
    },
    {
      id: 'media-dl',
      name: 'Downloader.',
      description: 'Descarga multimedia de cualquier enlace',
      route: '/media-dl',
      available: true,
      icon: '📥',
    },
    {
      id: 'img-optimizer',
      name: 'Optimizer.',
      description: 'Comprime imágenes sin perder demasiada calidad',
      route: '/img-optimizer',
      available: true,
      icon: '🗜️',
    },
    {
      id: 'logo-combo',
      name: 'Logo+.',
      description: 'Combina tu logo con el de Vamos Bien',
      route: '/logo-combo',
      available: true,
      icon: '🤝',
    },
  ];
}
