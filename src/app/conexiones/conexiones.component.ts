import {
  Component,
  signal,
  computed,
  effect,
  ElementRef,
  viewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import mermaid from 'mermaid';

interface Section {
  title?: string;
  items: string[];
}

interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

interface Step {
  id: number;
  title: string;
  sections: Section[];
  done: boolean;
  open: boolean;
  question?: string;
  answer: 'yes' | 'no' | null;
  noBranch?: SubTask[];
}

type FlowNodeType = 'process' | 'decision' | 'terminator';

interface FlowNode {
  id: string;
  label: string;
  type: FlowNodeType;
  done: boolean;
  clickable: boolean;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

interface FlowGraph {
  direction: 'LR' | 'TD';
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface Stage {
  id: string;
  label: string;
  steps?: Step[];
  graph?: FlowGraph;
}

@Component({
  selector: 'app-conexiones',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './conexiones.component.html',
  styleUrl: './conexiones.component.css',
})
export class ConexionesComponent {
  diagramRef = viewChild<ElementRef<HTMLDivElement>>('diagram');
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  activeStageId = signal<string>('charla');

  stages = signal<Stage[]>([
    {
      id: 'charla',
      label: 'Charla plan del mes',
      steps: [
        {
          id: 1, title: 'Intro', answer: null,
          sections: [
            { title: 'Objetivo', items: ['Hacer sentir cómodo al cliente y generar profesionalismo.'] },
            { title: 'Qué transmitir', items: ['Agradecer el tiempo.', 'Explicar que el Zoom sirve para ordenar todo correctamente.', 'Remarcar que buscan relaciones a largo plazo.', 'Aclarar que el trabajo NO es mágico ni instantáneo.'] },
            { title: 'Frases clave', items: ['"Esto es un trabajo en equipo."', '"Lo importante es estar alineados."', '"Nosotros buscamos trabajar a mediano y largo plazo."', '"Nadie compra si no confía."'] },
            { title: 'Transmitir emocionalmente', items: ['Profesionalismo.', 'Seguridad.', 'Paciencia.', 'Organización.', 'Que saben lo que hacen.'] },
          ],
          done: false, open: false,
        },
        {
          id: 2, title: 'Plan del mes', answer: null,
          sections: [
            { title: 'Objetivo', items: ['Que el cliente entienda por qué NO se publicita todo junto.'] },
            { title: 'Concepto principal', items: ['Hacer foco en UN producto específico durante el mes.'] },
            { title: 'El producto elegido debe ser', items: ['El más vendido.', 'El más rentable.', 'El que más stock tiene.'] },
            { title: 'Por qué funciona el foco', items: ['Meta necesita información clara.', 'El algoritmo funciona mejor con foco.', 'Es más fácil analizar resultados.', 'Evita campañas desordenadas.'] },
            { title: 'Frases clave', items: ['"Vamos de lo simple a lo complejo."', '"Primero validamos."', '"Después escalamos."', '"No queremos tirar plata."'] },
          ],
          done: false, open: false,
        },
        {
          id: 3, title: 'Investigación', answer: null,
          sections: [
            { title: 'Objetivo', items: ['Sacar información útil para segmentación, anuncios, creatividades y estrategia.'] },
            { title: 'Sobre el negocio', items: ['Hace cuánto trabajan.', 'Cómo venden actualmente.', 'Qué productos funcionan mejor.', 'Qué productos dejan más ganancia.', 'Qué zonas quieren trabajar.', 'Cómo manejan WhatsApp.', 'Cómo atienden consultas.'] },
            { title: 'Sobre clientes', items: ['Quién les compra.', 'Edad promedio.', 'Hombre/mujer.', 'Ticket promedio.', 'Tipo de cliente.'] },
            { title: 'Sobre contenido', items: ['Qué contenido tienen.', 'Si hacen videos.', 'Si editan.', 'Si tienen diseñador.', 'Si hacen historias.', 'Si usan flyers.'] },
          ],
          done: false, open: false,
        },
        {
          id: 4, title: 'Meta Ads', answer: null,
          sections: [
            { title: 'Objetivo', items: ['Que entiendan por qué se invierte, cómo funciona, qué hace Meta y qué hace la agencia.'] },
            { title: 'Meta necesita', items: ['Tiempo.', 'Datos.', 'Creatividades.', 'Estabilidad.'] },
            { title: 'Errores comunes a evitar', items: ['Prender y apagar campañas.', 'Editar todos los días.', 'Cambiar textos constantemente.', 'Cambiar públicos todo el tiempo.'] },
            { title: 'Importante', items: ['Cuando se modifica presupuesto, texto, público, ubicación o creatividad, la campaña "vuelve a aprender".'] },
            { title: 'Frases clave', items: ['"La campaña necesita optimizar."', '"Meta necesita datos."', '"No queremos romper el aprendizaje."'] },
          ],
          done: false, open: false,
        },
        {
          id: 5, title: 'Creatividades', answer: null,
          sections: [
            { title: 'Objetivo', items: ['Que entiendan que HOY el contenido es clave.'] },
            { title: 'Lo más importante', items: ['VIDEOS.', 'Los flyers siguen funcionando, pero el video genera confianza, atención, empatía y humanización.'] },
            { title: 'Los primeros 3 segundos son TODO', items: ['El gancho inicial tiene que frenar el scroll, llamar la atención y generar curiosidad.'] },
            { title: 'Ejemplos de ganchos', items: ['Oferta fuerte.', 'Pregunta.', 'Movimiento.', 'Problema.', 'Alguien hablando.'] },
          ],
          done: false, open: false,
        },
        {
          id: 6, title: 'Cantidad', answer: null,
          sections: [
            { title: 'Qué necesita Meta hoy', items: ['Variedad.', 'Testeo.', 'Volumen creativo.'] },
            { title: 'Recomendación', items: ['Entre 6 y 10 creatividades.', 'Mezclar videos, flyers, formatos distintos y ganchos distintos.'] },
            { title: 'El objetivo', items: ['Meta va detectando qué creatividad funciona, qué público responde mejor y qué anuncio trae mejores consultas.'] },
          ],
          done: false, open: false,
        },
        {
          id: 7, title: 'Análisis', answer: null,
          sections: [
            { title: 'Objetivo', items: ['Que el cliente entienda que TODO se mide.'] },
            { title: 'Qué se analiza', items: ['Mensajes.', 'Alcance.', 'Impresiones.', 'Costo por mensaje.', 'Ventas.', 'Facturación.', 'ROAS.'] },
          ],
          done: false, open: false,
        },
        {
          id: 8, title: 'ROAS', answer: null,
          sections: [
            { title: 'Fórmula', items: ['ROAS = Facturación ÷ inversión publicitaria.'] },
            { title: 'Qué mide', items: ['Cuánto retorna cada peso invertido.'] },
            { title: 'Objetivo final', items: ['Saber cuánto cuesta una venta.', 'Cuánto deja cada campaña.', 'Cuánto invertir para escalar.'] },
          ],
          done: false, open: false,
        },
        {
          id: 9, title: 'Inversión', answer: null,
          sections: [
            { title: 'Objetivo', items: ['Ordenar expectativas.'] },
            { title: 'Diferencia entre', items: ['Honorarios: lo que cobra la agencia.', 'Inversión: dinero que va a Meta.', 'Impuestos: cobros externos de Meta/banco.'] },
          ],
          done: false, open: false,
        },
        {
          id: 10, title: 'Responsabilidades', answer: null,
          sections: [
            { title: 'El cliente debe', items: ['Responder rápido.', 'Enviar contenido.', 'Hacer videos.', 'Mantener saldo.', 'Informar ventas.', 'Compartir facturación.', 'Avisar cambios.', 'Colaborar.'] },
            { title: 'Importante', items: ['Si el cliente responde tarde, no manda material o no atiende bien, la campaña se rompe.'] },
          ],
          done: false, open: false,
        },
        {
          id: 11, title: 'Cierre', answer: null,
          sections: [
            { title: 'Confirmar', items: ['Estrategia.', 'Inversión.', 'Producto.', 'Localidades.', 'Público.'] },
            { title: 'Luego explicar', items: ['Se hará el PDF resumen.', 'Se hará el grupo de WhatsApp.', 'Se harán las conexiones.', 'Luego se activan campañas.'] },
          ],
          done: false, open: false,
        },
      ],
    },
    {
      id: 'conexiones',
      label: 'Conexiones',
      graph: {
        direction: 'LR',
        nodes: [
          { id: 'nodeStart', label: 'INICIO', type: 'terminator', done: false, clickable: false },
          { id: 'fanpage', label: '¿Tenés acceso<br/>a la Fanpage?', type: 'decision', done: false, clickable: true },
          { id: 'admin', label: 'Identificar al<br/>administrador', type: 'process', done: false, clickable: true },
          { id: 'professional', label: 'Panel Profesional', type: 'process', done: false, clickable: true },
          { id: 'linked', label: '¿Cuentas vinculadas?<br/>(IG + WA)', type: 'decision', done: false, clickable: true },
          { id: 'linkacct', label: 'Vincular cuentas', type: 'process', done: false, clickable: true },
          { id: 'wa', label: '¿WhatsApp<br/>es Business?', type: 'decision', done: false, clickable: true },
          { id: 'wasetup', label: 'Pasar WA a<br/>Business', type: 'process', done: false, clickable: true },
          { id: 'adacct', label: '¿Tiene cuenta<br/>publicitaria?', type: 'decision', done: false, clickable: true },
          { id: 'createad', label: 'Crear cuenta<br/>publicitaria', type: 'process', done: false, clickable: true },
          { id: 'cleanad', label: 'Limpiar accesos:<br/>personas, socios,<br/>agencias', type: 'process', done: false, clickable: true },
          { id: 'payment', label: '¿Método de pago<br/>correcto?', type: 'decision', done: false, clickable: true },
          { id: 'stopscreen', label: 'Dejar de compartir<br/>pantalla y agregar', type: 'process', done: false, clickable: true },
          { id: 'verify', label: 'Verificación<br/>de 1 USD', type: 'process', done: false, clickable: true },
          { id: 'bizconfig', label: 'Configuración<br/>del Negocio', type: 'process', done: false, clickable: true },
          { id: 'pageconn', label: '¿Página conectada<br/>al portafolio?', type: 'decision', done: false, clickable: true },
          { id: 'createpage', label: 'Conectar o crear<br/>(foto + nombre)', type: 'process', done: false, clickable: true },
          { id: 'execaccess', label: 'Accesos a<br/>ejecutivos', type: 'process', done: false, clickable: true },
          { id: 'acctsconn', label: '¿Cuentas bien<br/>conectadas?', type: 'decision', done: false, clickable: true },
          { id: 'connectthem', label: 'Conectarlas', type: 'process', done: false, clickable: true },
          { id: 'adacctconn', label: '¿Ad Account<br/>conectada?', type: 'decision', done: false, clickable: true },
          { id: 'pasteid', label: "Copiar ID 'act='<br/>y pegarlo", type: 'process', done: false, clickable: true },
          { id: 'newad', label: 'Agregar > Crear nueva<br/>(evitar nombres<br/>numéricos)', type: 'process', done: false, clickable: true },
          { id: 'invite', label: 'Invitar Personas', type: 'process', done: false, clickable: true },
          { id: 'permissions', label: 'Email > Control Total<br/>> Administrar', type: 'process', done: false, clickable: true },
          { id: 'conv', label: '¿Publicidad de<br/>Conversión / Web?', type: 'decision', done: false, clickable: true },
          { id: 'webaudit', label: 'Revisar:<br/>Dominio, Pixel,<br/>API, Eventos', type: 'process', done: false, clickable: true },
          { id: 'events', label: 'Eventos clave:<br/>Compra, Contacto,<br/>Carrito, Visitas', type: 'process', done: false, clickable: true },
          { id: 'nodeEnd', label: 'FIN', type: 'terminator', done: false, clickable: false },
        ],
        edges: [
          { from: 'nodeStart', to: 'fanpage' },
          { from: 'fanpage', to: 'admin', label: 'No' },
          { from: 'fanpage', to: 'professional', label: 'Sí' },
          { from: 'admin', to: 'professional' },
          { from: 'professional', to: 'linked' },
          { from: 'linked', to: 'linkacct', label: 'No' },
          { from: 'linked', to: 'wa', label: 'Sí' },
          { from: 'linkacct', to: 'wa' },
          { from: 'wa', to: 'wasetup', label: 'No' },
          { from: 'wa', to: 'adacct', label: 'Sí' },
          { from: 'wasetup', to: 'adacct' },
          { from: 'adacct', to: 'createad', label: 'No' },
          { from: 'adacct', to: 'cleanad', label: 'Sí' },
          { from: 'createad', to: 'cleanad' },
          { from: 'cleanad', to: 'payment' },
          { from: 'payment', to: 'stopscreen', label: 'No' },
          { from: 'payment', to: 'verify', label: 'Sí' },
          { from: 'stopscreen', to: 'verify' },
          { from: 'verify', to: 'bizconfig' },
          { from: 'bizconfig', to: 'pageconn' },
          { from: 'pageconn', to: 'createpage', label: 'No' },
          { from: 'pageconn', to: 'execaccess', label: 'Sí' },
          { from: 'createpage', to: 'execaccess' },
          { from: 'execaccess', to: 'acctsconn' },
          { from: 'acctsconn', to: 'connectthem', label: 'No' },
          { from: 'acctsconn', to: 'adacctconn', label: 'Sí' },
          { from: 'connectthem', to: 'adacctconn' },
          { from: 'adacctconn', to: 'pasteid', label: 'No (existe)' },
          { from: 'adacctconn', to: 'newad', label: 'No (no existe)' },
          { from: 'adacctconn', to: 'invite', label: 'Sí' },
          { from: 'pasteid', to: 'invite' },
          { from: 'newad', to: 'invite' },
          { from: 'invite', to: 'permissions' },
          { from: 'permissions', to: 'conv' },
          { from: 'conv', to: 'nodeEnd', label: 'No' },
          { from: 'conv', to: 'webaudit', label: 'Sí' },
          { from: 'webaudit', to: 'events' },
          { from: 'events', to: 'nodeEnd' },
        ],
      },
    },
  ]);

  currentStage = computed(() => this.stages().find(s => s.id === this.activeStageId())!);

  doneCount = computed(() => {
    const stage = this.currentStage();
    if (stage.steps) return stage.steps.filter(s => s.done).length;
    if (stage.graph) return stage.graph.nodes.filter(n => n.clickable && n.done).length;
    return 0;
  });

  total = computed(() => {
    const stage = this.currentStage();
    if (stage.steps) return stage.steps.length;
    if (stage.graph) return stage.graph.nodes.filter(n => n.clickable).length;
    return 0;
  });

  progress = computed(() => (this.total() === 0 ? 0 : Math.round((this.doneCount() / this.total()) * 100)));

  mermaidSource = computed(() => {
    const stage = this.currentStage();
    if (!stage.graph) return '';
    return this.buildMermaid(stage.graph);
  });

  constructor() {
    if (this.isBrowser) {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: 'base',
        flowchart: {
          curve: 'basis',
          htmlLabels: true,
          padding: 14,
          nodeSpacing: 44,
          rankSpacing: 66,
          useMaxWidth: false,
        },
        themeVariables: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '12.5px',
          primaryColor: '#26203a',
          primaryBorderColor: '#3d3556',
          primaryTextColor: '#ffffff',
          lineColor: '#F7941E',
          secondaryColor: '#26203a',
          tertiaryColor: '#26203a',
          edgeLabelBackground: '#0c0a19',
        },
      });

      effect(() => {
        const src = this.mermaidSource();
        const containerRef = this.diagramRef();
        if (src && containerRef) {
          this.renderDiagram(containerRef.nativeElement, src);
        }
      });
    }
  }

  private buildMermaid(graph: FlowGraph): string {
    const lines: string[] = [`graph ${graph.direction}`];

    for (const node of graph.nodes) {
      const safeLabel = node.label.replace(/"/g, '&quot;');
      let shape: string;
      switch (node.type) {
        case 'decision':
          shape = `{"${safeLabel}"}`;
          break;
        case 'terminator':
          shape = `(("${safeLabel}"))`;
          break;
        default:
          shape = `["${safeLabel}"]`;
      }
      lines.push(`  ${node.id}${shape}`);
    }

    for (const edge of graph.edges) {
      if (edge.label) {
        const safeEdgeLabel = edge.label.replace(/"/g, '&quot;');
        lines.push(`  ${edge.from} -->|"${safeEdgeLabel}"| ${edge.to}`);
      } else {
        lines.push(`  ${edge.from} --> ${edge.to}`);
      }
    }

    for (const node of graph.nodes) {
      if (!node.clickable) {
        lines.push(`  class ${node.id} terminator`);
      } else if (node.done) {
        lines.push(`  class ${node.id} done`);
      } else if (node.type === 'decision') {
        lines.push(`  class ${node.id} decision`);
      } else {
        lines.push(`  class ${node.id} process`);
      }
    }

    lines.push('  classDef process fill:#272138,stroke:#3f3658,color:#ffffff,stroke-width:1.5px');
    lines.push('  classDef decision fill:#2a2236,stroke:#a26519,color:#ffffff,stroke-width:1.5px');
    lines.push('  classDef done fill:#1f2a14,stroke:#7ab83d,color:#dff4be,stroke-width:2px');
    lines.push('  classDef terminator fill:#322852,stroke:#9b7ad6,color:#e3d4ff,stroke-width:2px');

    return lines.join('\n');
  }

  private async renderDiagram(container: HTMLDivElement, source: string): Promise<void> {
    try {
      const renderId = 'mermaid-' + Math.random().toString(36).slice(2);
      const { svg } = await mermaid.render(renderId, source);
      container.innerHTML = svg;
      this.decorateDiagram(container);
    } catch (err) {
      console.error('Mermaid render error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      container.innerHTML = `<pre class="mermaid-error">Error al renderizar el diagrama:\n\n${msg}</pre>`;
    }
  }

  private decorateDiagram(container: HTMLDivElement): void {
    const stage = this.currentStage();
    if (!stage.graph) return;

    const clickableIds = new Set(stage.graph.nodes.filter(n => n.clickable).map(n => n.id));

    container.querySelectorAll<SVGRectElement>('g.node rect').forEach(rect => {
      rect.setAttribute('rx', '12');
      rect.setAttribute('ry', '12');
    });

    container.querySelectorAll<SVGPolygonElement>('g.node polygon').forEach(poly => {
      this.roundPolygon(poly, 10);
    });

    container.querySelectorAll<SVGGElement>('g.node').forEach(g => {
      const rawId = g.id;
      const match = rawId.match(/flowchart-([a-z0-9_]+)-\d+/i);
      if (!match) return;
      const nodeId = match[1];
      if (!clickableIds.has(nodeId)) return;

      g.style.cursor = 'pointer';
      g.addEventListener('click', () => this.toggleGraphNode(nodeId));
    });

    container.querySelectorAll<SVGGElement>('g.edgeLabel').forEach(label => {
      const text = (label.textContent || '').trim().toLowerCase();
      if (text === 'sí' || text === 'si') {
        label.classList.add('edge-label-yes');
      } else if (text === 'no' || text.startsWith('no ')) {
        label.classList.add('edge-label-no');
      }
    });
  }

  private roundPolygon(poly: SVGPolygonElement, radius: number): void {
    const pointsAttr = poly.getAttribute('points');
    if (!pointsAttr) return;

    const tokens = pointsAttr.trim().split(/[\s,]+/).map(parseFloat);
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i + 1 < tokens.length; i += 2) {
      points.push({ x: tokens[i], y: tokens[i + 1] });
    }
    if (points.length < 3) return;

    const n = points.length;
    const parts: string[] = [];

    for (let i = 0; i < n; i++) {
      const prev = points[(i - 1 + n) % n];
      const curr = points[i];
      const next = points[(i + 1) % n];

      const v1x = prev.x - curr.x;
      const v1y = prev.y - curr.y;
      const v2x = next.x - curr.x;
      const v2y = next.y - curr.y;
      const len1 = Math.hypot(v1x, v1y);
      const len2 = Math.hypot(v2x, v2y);
      if (len1 === 0 || len2 === 0) continue;

      const r = Math.min(radius, len1 / 2, len2 / 2);

      const p1x = curr.x + (v1x / len1) * r;
      const p1y = curr.y + (v1y / len1) * r;
      const p2x = curr.x + (v2x / len2) * r;
      const p2y = curr.y + (v2y / len2) * r;

      parts.push(`${i === 0 ? 'M' : 'L'} ${p1x.toFixed(2)} ${p1y.toFixed(2)}`);
      parts.push(`Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${p2x.toFixed(2)} ${p2y.toFixed(2)}`);
    }
    parts.push('Z');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', parts.join(' '));
    for (const attr of Array.from(poly.attributes)) {
      if (attr.name !== 'points') {
        path.setAttribute(attr.name, attr.value);
      }
    }
    poly.replaceWith(path);
  }

  toggleGraphNode(nodeId: string): void {
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage => {
        if (stage.id !== stageId || !stage.graph) return stage;
        return {
          ...stage,
          graph: {
            ...stage.graph,
            nodes: stage.graph.nodes.map(n =>
              n.id === nodeId && n.clickable ? { ...n, done: !n.done } : n
            ),
          },
        };
      })
    );
  }

  setStage(id: string): void {
    this.activeStageId.set(id);
  }

  toggle(stepId: number): void {
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage =>
        stage.id === stageId && stage.steps
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
        stage.id === stageId && stage.steps
          ? { ...stage, steps: stage.steps.map(s => (s.id === stepId ? { ...s, done: !s.done } : s)) }
          : stage
      )
    );
  }

  setAnswer(stepId: number, value: 'yes' | 'no'): void {
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage =>
        stage.id === stageId && stage.steps
          ? {
              ...stage,
              steps: stage.steps.map(s =>
                s.id === stepId ? { ...s, answer: value, done: value === 'yes' } : s
              ),
            }
          : stage
      )
    );
  }

  resetAnswer(stepId: number, event: Event): void {
    event.stopPropagation();
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage =>
        stage.id === stageId && stage.steps
          ? { ...stage, steps: stage.steps.map(s => (s.id === stepId ? { ...s, answer: null, done: false } : s)) }
          : stage
      )
    );
  }

  toggleSubTask(stepId: number, subId: string): void {
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage =>
        stage.id === stageId && stage.steps
          ? {
              ...stage,
              steps: stage.steps.map(s => {
                if (s.id !== stepId || !s.noBranch) return s;
                const newBranch = s.noBranch.map(t => (t.id === subId ? { ...t, done: !t.done } : t));
                const allDone = newBranch.every(t => t.done);
                return { ...s, noBranch: newBranch, done: allDone };
              }),
            }
          : stage
      )
    );
  }

  reset(): void {
    const stageId = this.activeStageId();
    this.stages.update(stages =>
      stages.map(stage => {
        if (stage.id !== stageId) return stage;
        if (stage.steps) {
          return {
            ...stage,
            steps: stage.steps.map(s => ({
              ...s,
              done: false,
              open: false,
              answer: null,
              noBranch: s.noBranch?.map(t => ({ ...t, done: false })),
            })),
          };
        }
        if (stage.graph) {
          return {
            ...stage,
            graph: { ...stage.graph, nodes: stage.graph.nodes.map(n => ({ ...n, done: false })) },
          };
        }
        return stage;
      })
    );
  }
}
