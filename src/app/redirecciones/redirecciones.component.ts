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
      window.location.href = 'https://wa.me/5491144407562?text=Hola!%20V%C3%AD%20la%20publicidad%20y%20me%20gustar%C3%ADa%20saber%20m%C3%A1s%20sobre%20los%20productos%20montessori';
    }
  }
}
