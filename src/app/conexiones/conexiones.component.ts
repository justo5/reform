import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Section {
  title?: string;
  items: string[];
}

interface Step {
  id: number;
  title: string;
  sections: Section[];
  done: boolean;
  open: boolean;
}

interface Stage {
  id: string;
  label: string;
  steps: Step[];
}

@Component({
  selector: 'app-conexiones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './conexiones.component.html',
  styleUrl: './conexiones.component.css',
})
export class ConexionesComponent {
  activeStageId = signal<string>('charla');

  stages = signal<Stage[]>([
    {
      id: 'charla',
      label: 'Charla plan del mes',
      steps: [
        {
          id: 1,
          title: 'Introducción y romper el hielo',
          sections: [
            { title: 'Objetivo', items: ['Hacer sentir cómodo al cliente y generar profesionalismo.'] },
            {
              title: 'Qué transmitir',
              items: [
                'Agradecer el tiempo.',
                'Explicar que el Zoom sirve para ordenar todo correctamente.',
                'Remarcar que buscan relaciones a largo plazo.',
                'Aclarar que el trabajo NO es mágico ni instantáneo.',
              ],
            },
            {
              title: 'Frases clave',
              items: [
                '"Esto es un trabajo en equipo."',
                '"Lo importante es estar alineados."',
                '"Nosotros buscamos trabajar a mediano y largo plazo."',
                '"Nadie compra si no confía."',
              ],
            },
            {
              title: 'Transmitir emocionalmente',
              items: ['Profesionalismo.', 'Seguridad.', 'Paciencia.', 'Organización.', 'Que saben lo que hacen.'],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 2,
          title: 'Explicar el "Plan del Mes"',
          sections: [
            { title: 'Objetivo', items: ['Que el cliente entienda por qué NO se publicita todo junto.'] },
            { title: 'Concepto principal', items: ['Hacer foco en UN producto específico durante el mes.'] },
            {
              title: 'El producto elegido debe ser',
              items: ['El más vendido.', 'El más rentable.', 'El que más stock tiene.'],
            },
            {
              title: 'Por qué funciona el foco',
              items: [
                'Meta necesita información clara.',
                'El algoritmo funciona mejor con foco.',
                'Es más fácil analizar resultados.',
                'Evita campañas desordenadas.',
              ],
            },
            {
              title: 'Frases clave',
              items: [
                '"Vamos de lo simple a lo complejo."',
                '"Primero validamos."',
                '"Después escalamos."',
                '"No queremos tirar plata."',
              ],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 3,
          title: 'Investigación del negocio',
          sections: [
            {
              title: 'Objetivo',
              items: ['Sacar información útil para segmentación, anuncios, creatividades y estrategia.'],
            },
            {
              title: 'Sobre el negocio',
              items: [
                'Hace cuánto trabajan.',
                'Cómo venden actualmente.',
                'Qué productos funcionan mejor.',
                'Qué productos dejan más ganancia.',
                'Qué zonas quieren trabajar.',
                'Cómo manejan WhatsApp.',
                'Cómo atienden consultas.',
              ],
            },
            {
              title: 'Sobre clientes',
              items: ['Quién les compra.', 'Edad promedio.', 'Hombre/mujer.', 'Ticket promedio.', 'Tipo de cliente.'],
            },
            {
              title: 'Sobre contenido',
              items: [
                'Qué contenido tienen.',
                'Si hacen videos.',
                'Si editan.',
                'Si tienen diseñador.',
                'Si hacen historias.',
                'Si usan flyers.',
              ],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 4,
          title: 'Explicar cómo funciona Meta Ads',
          sections: [
            {
              title: 'Objetivo',
              items: ['Que entiendan por qué se invierte, cómo funciona, qué hace Meta y qué hace la agencia.'],
            },
            {
              title: 'Meta necesita',
              items: ['Tiempo.', 'Datos.', 'Creatividades.', 'Estabilidad.'],
            },
            {
              title: 'Errores comunes a evitar',
              items: [
                'Prender y apagar campañas.',
                'Editar todos los días.',
                'Cambiar textos constantemente.',
                'Cambiar públicos todo el tiempo.',
              ],
            },
            {
              title: 'Importante',
              items: [
                'Cuando se modifica presupuesto, texto, público, ubicación o creatividad, la campaña "vuelve a aprender".',
              ],
            },
            {
              title: 'Frases clave',
              items: [
                '"La campaña necesita optimizar."',
                '"Meta necesita datos."',
                '"No queremos romper el aprendizaje."',
              ],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 5,
          title: 'Explicación de creatividades',
          sections: [
            { title: 'Objetivo', items: ['Que entiendan que HOY el contenido es clave.'] },
            {
              title: 'Lo más importante',
              items: [
                'VIDEOS.',
                'Los flyers siguen funcionando, pero el video genera confianza, atención, empatía y humanización.',
              ],
            },
            {
              title: 'Los primeros 3 segundos son TODO',
              items: ['El gancho inicial tiene que frenar el scroll, llamar la atención y generar curiosidad.'],
            },
            {
              title: 'Ejemplos de ganchos',
              items: ['Oferta fuerte.', 'Pregunta.', 'Movimiento.', 'Problema.', 'Alguien hablando.'],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 6,
          title: 'Cantidad de creatividades',
          sections: [
            { title: 'Qué necesita Meta hoy', items: ['Variedad.', 'Testeo.', 'Volumen creativo.'] },
            {
              title: 'Recomendación',
              items: ['Entre 6 y 10 creatividades.', 'Mezclar videos, flyers, formatos distintos y ganchos distintos.'],
            },
            {
              title: 'El objetivo',
              items: [
                'Meta va detectando qué creatividad funciona, qué público responde mejor y qué anuncio trae mejores consultas.',
              ],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 7,
          title: 'Explicar el análisis de resultados',
          sections: [
            { title: 'Objetivo', items: ['Que el cliente entienda que TODO se mide.'] },
            {
              title: 'Qué se analiza',
              items: [
                'Mensajes.',
                'Alcance.',
                'Impresiones.',
                'Costo por mensaje.',
                'Ventas.',
                'Facturación.',
                'ROAS.',
              ],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 8,
          title: 'Explicación del ROAS',
          sections: [
            { title: 'Fórmula', items: ['ROAS = Facturación ÷ inversión publicitaria.'] },
            { title: 'Qué mide', items: ['Cuánto retorna cada peso invertido.'] },
            {
              title: 'Objetivo final',
              items: ['Saber cuánto cuesta una venta.', 'Cuánto deja cada campaña.', 'Cuánto invertir para escalar.'],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 9,
          title: 'Explicar la inversión',
          sections: [
            { title: 'Objetivo', items: ['Ordenar expectativas.'] },
            {
              title: 'Diferencia entre',
              items: [
                'Honorarios: lo que cobra la agencia.',
                'Inversión: dinero que va a Meta.',
                'Impuestos: cobros externos de Meta/banco.',
              ],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 10,
          title: 'Responsabilidades del cliente',
          sections: [
            {
              title: 'El cliente debe',
              items: [
                'Responder rápido.',
                'Enviar contenido.',
                'Hacer videos.',
                'Mantener saldo.',
                'Informar ventas.',
                'Compartir facturación.',
                'Avisar cambios.',
                'Colaborar.',
              ],
            },
            {
              title: 'Importante',
              items: ['Si el cliente responde tarde, no manda material o no atiende bien, la campaña se rompe.'],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 11,
          title: 'Cierre de la llamada',
          sections: [
            {
              title: 'Confirmar',
              items: ['Estrategia.', 'Inversión.', 'Producto.', 'Localidades.', 'Público.'],
            },
            {
              title: 'Luego explicar',
              items: [
                'Se hará el PDF resumen.',
                'Se hará el grupo de WhatsApp.',
                'Se harán las conexiones.',
                'Luego se activan campañas.',
              ],
            },
          ],
          done: false,
          open: false,
        },
      ],
    },
    {
      id: 'conexiones',
      label: 'Conexiones',
      steps: [
        {
          id: 1,
          title: 'Revisión de Fanpage',
          sections: [
            {
              title: 'Revisar',
              items: ['Que sea la correcta.', 'Que pertenezca al negocio.', 'Que tenga acceso.'],
            },
            { title: 'Entrar a', items: ['Panel Profesional → Cuentas Vinculadas.'] },
            { title: 'Confirmar', items: ['Instagram conectado.', 'WhatsApp Business conectado.'] },
            { title: 'IMPORTANTE', items: ['WhatsApp debe ser BUSINESS.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 2,
          title: 'Revisar cuenta publicitaria',
          sections: [
            {
              title: 'En el Administrador de anuncios',
              items: ['Descartar borradores.', 'Definir portfolio correcto.'],
            },
            {
              title: 'Importante',
              items: ['Muchos clientes tienen portfolios duplicados, cuentas viejas o agencias anteriores.'],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 3,
          title: 'Copiar el ID de la cuenta',
          sections: [
            { title: 'Cómo encontrarlo', items: ['El ID se encuentra en: "act="'] },
            { title: 'Para qué sirve', items: ['Solicitar acceso.', 'Vincular la cuenta al portfolio.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 4,
          title: 'Revisión de facturación',
          sections: [
            { title: 'Revisar', items: ['Tarjeta activa.', 'Saldo.', 'Rechazos.', 'Restricciones.'] },
            { title: 'Importante', items: ['Si Meta no puede cobrar, pausa campañas.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 5,
          title: 'Configuración del portfolio',
          sections: [
            {
              title: 'Entrar a Configuración del negocio y revisar',
              items: ['Páginas.', 'Cuentas.', 'Accesos.'],
            },
            {
              title: 'Confirmar',
              items: ['FanPage correcta.', 'Control total.', 'Portfolio correcto.'],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 6,
          title: 'Organizar el portfolio',
          sections: [
            { title: 'Cambiar', items: ['Nombre del negocio.', 'Página principal.'] },
            { title: 'Objetivo', items: ['Que quede ordenado, profesional y fácil de administrar.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 7,
          title: 'Agregar cuenta publicitaria',
          sections: [
            {
              title: 'Diferencia entre opciones',
              items: ['Crear: si NO existe.', 'Solicitar acceso: si ya funciona.', 'Reclamar: si pertenece al negocio.'],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 8,
          title: 'Renombrar cuenta publicitaria',
          sections: [
            { title: 'Objetivo', items: ['Evitar cuentas con nombres numéricos.'] },
            { title: 'Ejemplos', items: ['Marca Ads.', 'Negocio Ads.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 9,
          title: 'Revisar Instagram y WhatsApp',
          sections: [
            { title: 'Confirmar', items: ['Conexión correcta.', 'Permisos.', 'Portfolio correcto.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 10,
          title: 'Dar accesos',
          sections: [
            { title: 'Cómo', items: ['Invitar personas.', 'Habilitar: administrar y control total.'] },
            { title: 'Importante', items: ['Todo acceso debe quedar claro, ordenado y profesional.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 11,
          title: 'Seguridad y limpieza',
          sections: [
            {
              title: 'Revisar',
              items: ['Personas.', 'Socios.', 'Agencias viejas.', 'Accesos innecesarios.'],
            },
            { title: 'Objetivo', items: ['Evitar problemas, bloqueos y pérdida de acceso.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 12,
          title: 'Dominios / Pixel / API',
          sections: [
            { title: 'Revisar', items: ['Dominio.', 'Pixel.', 'API.', 'Eventos.'] },
            { title: 'Importante', items: ['NO crear pixels duplicados innecesariamente.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 13,
          title: 'Explicación del Pixel',
          sections: [
            {
              title: 'El Pixel',
              items: ['Mide comportamiento.', 'Registra eventos.', 'Ayuda a optimizar campañas.'],
            },
            { title: 'Eventos importantes', items: ['Compra.', 'Contacto.', 'Agregar al carrito.', 'Visitas.'] },
          ],
          done: false,
          open: false,
        },
        {
          id: 14,
          title: 'Explicación de la API',
          sections: [
            {
              title: 'La API ayuda a',
              items: ['Mejorar medición.', 'Recuperar datos.', 'Mejorar optimización.'],
            },
          ],
          done: false,
          open: false,
        },
        {
          id: 15,
          title: 'Cierre de configuración',
          sections: [
            {
              title: 'Confirmar',
              items: [
                'Todo conectado.',
                'Accesos correctos.',
                'Portfolio ordenado.',
                'Medios de pago funcionando.',
              ],
            },
            { title: 'Luego', items: ['Armar grupo.', 'Pedir creatividades.', 'Activar campañas.'] },
          ],
          done: false,
          open: false,
        },
      ],
    },
  ]);

  currentStage = computed(() => this.stages().find(s => s.id === this.activeStageId())!);
  doneCount = computed(() => this.currentStage().steps.filter(s => s.done).length);
  total = computed(() => this.currentStage().steps.length);
  progress = computed(() => Math.round((this.doneCount() / this.total()) * 100));

  setStage(id: string): void {
    this.activeStageId.set(id);
  }

  toggle(stepId: number): void {
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage =>
        stage.id === stageId
          ? { ...stage, steps: stage.steps.map(s => (s.id === stepId ? { ...s, open: !s.open } : s)) }
          : stage
      )
    );
  }

  toggleDone(stepId: number, event: Event): void {
    event.stopPropagation();
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage =>
        stage.id === stageId
          ? { ...stage, steps: stage.steps.map(s => (s.id === stepId ? { ...s, done: !s.done } : s)) }
          : stage
      )
    );
  }

  reset(): void {
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage =>
        stage.id === stageId
          ? { ...stage, steps: stage.steps.map(s => ({ ...s, done: false, open: false })) }
          : stage
      )
    );
  }
}
