import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Step {
  id: number;
  title: string;
  items: string[];
  done: boolean;
  open: boolean;
}

@Component({
  selector: 'app-conexiones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './conexiones.component.html',
  styleUrl: './conexiones.component.css',
})
export class ConexionesComponent {
  steps = signal<Step[]>([
    {
      id: 1,
      title: 'Verificación de conexiones en redes sociales',
      items: [
        'Pide al cliente que inicie sesión en Facebook y acceda al panel profesional de su Fanpage.',
        'Revisa la sección de "Cuentas vinculadas" para asegurarte de que la cuenta de Instagram y el número de WhatsApp Business estén correctamente enlazados a la página.',
      ],
      done: false,
      open: false,
    },
    {
      id: 2,
      title: 'Configuración del Business Manager (Portfolio Comercial)',
      items: [
        'Guía al cliente para que ingrese al Administrador de anuncios, despliegue el menú de "Todas las herramientas" y abra la Configuración del negocio en una pestaña nueva.',
        'El objetivo es centralizar todos los activos comerciales (Fanpage, Instagram, WhatsApp y cuenta publicitaria) dentro de un único portfolio para tener un control ordenado.',
        'En la sección de "Información del negocio", edita el nombre del portfolio y asocia la página principal del cliente para que se actualice la información y la foto de perfil del negocio.',
      ],
      done: false,
      open: false,
    },
    {
      id: 3,
      title: 'Revisión y/o creación de la Cuenta Publicitaria',
      items: [
        'Verifica si el cliente ya tiene cuentas publicitarias creadas. Es crucial revisar la moneda y los límites de gasto, ya que si está configurada en dólares en lugar de moneda local puede generar consumos accidentales muy altos.',
        'Asegúrate de verificar un número de teléfono válido dentro de la cuenta.',
        'Si la cuenta actual tiene configuraciones erróneas o da problemas, crea una cuenta publicitaria nueva directamente desde el portfolio comercial, configurando cuidadosamente la zona horaria y la moneda local correcta.',
      ],
      done: false,
      open: false,
    },
    {
      id: 4,
      title: 'Configuración de facturación y métodos de pago',
      items: [
        'Dirígete a la sección de "Facturación y pago" para agregar una tarjeta de crédito o prepaga.',
        'Si Meta solicita verificar el método de pago, explícale al cliente el proceso: Meta hará un cobro de prueba por un monto mínimo (equivalente a 1 dólar) que aparecerá en su extracto bancario junto a un código. El cliente deberá buscar ese código en su banco y dictártelo para validar la tarjeta.',
        'Aclara el sistema de cobros: al ser una cuenta nueva, Meta realizará cobros diarios o muy frecuentes por importes bajos. A medida que la plataforma gane confianza en el método de pago, los cobros se harán cada dos, tres días, de forma semanal o quincenal.',
      ],
      done: false,
      open: false,
    },
    {
      id: 5,
      title: 'Asignación de permisos para tu agencia/equipo',
      items: [
        'En la sección "Personas" (dentro de Usuarios), pide al cliente que haga clic en "Invitar a personas" e ingrese el correo electrónico con el que trabajas.',
        'Solicita que te otorgue acceso de administración y que asigne manualmente todos los activos (marcando la Fanpage, cuenta de Instagram y la cuenta publicitaria) para que recibas la invitación con los permisos necesarios para operar.',
      ],
      done: false,
      open: false,
    },
    {
      id: 6,
      title: 'Establecimiento de canales de comunicación y próximos pasos',
      items: [
        'Avisa que crearás un grupo de WhatsApp (o el canal de comunicación que utilices) con el cliente y tu equipo para centralizar todo lo referido a campañas, creatividades y textos.',
        'Solicita el material creativo: pide al cliente que comparta carpetas de Drive con fotos y videos, y recomiéndale generar más contenido, ya que "es mejor que sobre contenido a que falte".',
        'Informa que podrías requerir datos adicionales (como fechas de nacimiento o un correo de facturación) para dar de alta al cliente en el sistema interno de tu agencia de manera formal.',
      ],
      done: false,
      open: false,
    },
  ]);

  doneCount = computed(() => this.steps().filter(s => s.done).length);
  total = computed(() => this.steps().length);
  progress = computed(() => Math.round((this.doneCount() / this.total()) * 100));

  toggle(id: number): void {
    this.steps.update(steps =>
      steps.map(s => (s.id === id ? { ...s, open: !s.open } : s))
    );
  }

  toggleDone(id: number, event: Event): void {
    event.stopPropagation();
    this.steps.update(steps =>
      steps.map(s => (s.id === id ? { ...s, done: !s.done } : s))
    );
  }

  reset(): void {
    this.steps.update(steps => steps.map(s => ({ ...s, done: false, open: false })));
  }
}
