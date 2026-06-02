import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-redirecciones',
  standalone: true,
  imports: [],
  template: '',
})
export class RedireccionesComponent {
  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      window.location.href = 'https://tinyurl.com/3w2xs8n3';
    }
  }
}
