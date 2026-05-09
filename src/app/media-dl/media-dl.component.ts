import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  CobaltPickerItem,
  CobaltService,
  DownloadMode,
  VideoQuality,
} from '../services/cobalt.service';

type State = 'idle' | 'loading' | 'done' | 'error';

@Component({
  selector: 'app-media-dl',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './media-dl.component.html',
  styleUrl: './media-dl.component.css',
})
export class MediaDlComponent {
  private cobalt = inject(CobaltService);

  readonly url = signal('');
  readonly quality = signal<VideoQuality>('720');
  readonly audioOnly = signal(false);
  readonly state = signal<State>('idle');
  readonly errorMsg = signal('');
  readonly directUrl = signal<string | null>(null);
  readonly directFilename = signal<string | null>(null);
  readonly directAudioUrl = signal<string | null>(null);
  readonly pickerItems = signal<CobaltPickerItem[]>([]);
  readonly pickerAudio = signal<string | null>(null);

  readonly downloading = signal(false);

  readonly isLoading = computed(() => this.state() === 'loading');
  readonly isDone = computed(() => this.state() === 'done');
  readonly isError = computed(() => this.state() === 'error');
  readonly hasPicker = computed(() => this.pickerItems().length > 0);
  readonly mode = computed<DownloadMode>(() => this.audioOnly() ? 'audio' : 'auto');

  submit(): void {
    const rawUrl = this.url().trim();
    if (!rawUrl || this.isLoading()) return;

    this.state.set('loading');
    this.errorMsg.set('');
    this.directUrl.set(null);
    this.directFilename.set(null);
    this.directAudioUrl.set(null);
    this.pickerItems.set([]);
    this.pickerAudio.set(null);

    this.cobalt.resolve(rawUrl, this.quality(), this.mode()).subscribe({
      next: (res) => {
        if (res.status === 'error') {
          this.state.set('error');
          this.errorMsg.set(this.friendlyError(res.error.code));
          return;
        }
        if (res.status === 'picker') {
          this.pickerItems.set(res.picker);
          this.pickerAudio.set(res.audio ?? null);
          this.state.set('done');
          return;
        }
        this.directUrl.set(res.url);
        this.directFilename.set(res.filename ?? null);
        this.directAudioUrl.set(res.audioUrl ?? null);
        this.state.set('done');
      },
      error: () => {
        this.state.set('error');
        this.errorMsg.set('No se pudo conectar con el servicio. Intenta de nuevo.');
      },
    });
  }

  audioFilename(videoFilename: string | null): string {
    if (!videoFilename) return 'audio.m4a';
    const dot = videoFilename.lastIndexOf('.');
    const base = dot !== -1 ? videoFilename.slice(0, dot) : videoFilename;
    return `${base}_audio.m4a`;
  }

  download(url: string, filename?: string | null): void {
    if (this.downloading()) return;
    this.downloading.set(true);
    const params = new URLSearchParams({ url, filename: filename || 'video.mp4' });
    const a = document.createElement('a');
    a.href = `/api/proxy-download?${params}`;
    a.click();
    setTimeout(() => this.downloading.set(false), 1000);
  }

  reset(): void {
    this.state.set('idle');
    this.url.set('');
    this.directUrl.set(null);
    this.directFilename.set(null);
    this.directAudioUrl.set(null);
    this.pickerItems.set([]);
    this.pickerAudio.set(null);
    this.errorMsg.set('');
  }

  private friendlyError(code: string): string {
    const messages: Record<string, string> = {
      'content.too_long': 'El contenido es demasiado largo para descargar.',
      'content.video.unavailable': 'El video no está disponible.',
      'link.invalid': 'El enlace no es válido.',
      'link.unsupported': 'Este sitio no está soportado todavía.',
      'fetch.fail': 'No se pudo obtener el contenido del enlace.',
      'fetch.rate': 'Demasiadas peticiones. Espera un momento e inténtalo de nuevo.',
      'content.age_restricted': 'El contenido tiene restricción de edad.',
    };
    return messages[code] ?? `Error inesperado (${code}). Intenta con otro enlace.`;
  }
}
