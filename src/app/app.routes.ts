import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'reform',
    loadComponent: () =>
      import('./reform/reform.component').then(m => m.ReformComponent),
  },
  {
    path: 'media-dl',
    loadComponent: () =>
      import('./media-dl/media-dl.component').then(m => m.MediaDlComponent),
  },
  {
    path: 'img-optimizer',
    loadComponent: () =>
      import('./img-optimizer/img-optimizer.component').then(m => m.ImgOptimizerComponent),
  },
  {
    path: 'logo-combo',
    loadComponent: () =>
      import('./logo-combo/logo-combo.component').then(m => m.LogoComboComponent),
  },
  {
    path: 'conexiones',
    loadComponent: () =>
      import('./conexiones/conexiones.component').then(m => m.ConexionesComponent),
  },
  {
    path: 'redirecciones',
    canActivate: [() => { window.location.href = 'https://tinyurl.com/3w2xs8n3'; return false; }],
    component: class {},
  },
  { path: '**', redirectTo: '' },
];
