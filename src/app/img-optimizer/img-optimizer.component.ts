import {
  Component,
  computed,
  ElementRef,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type OutputFormat = 'image/jpeg' | 'image/webp' | 'image/png';

interface FormatOption {
  mime: OutputFormat;
  label: string;
  ext: string;
  lossy: boolean;
}

const FORMATS: FormatOption[] = [
  { mime: 'image/jpeg', label: 'JPEG', ext: 'jpg',  lossy: true  },
  { mime: 'image/webp', label: 'WebP', ext: 'webp', lossy: true  },
  { mime: 'image/png',  label: 'PNG',  ext: 'png',  lossy: false },
];

@Component({
  selector: 'app-img-optimizer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './img-optimizer.component.html',
  styleUrl: './img-optimizer.component.css',
})
export class ImgOptimizerComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  readonly formats = FORMATS;

  previewUrl    = signal<string | null>(null);
  resultUrl     = signal<string | null>(null);
  originalSize  = signal<number>(0);
  resultSize    = signal<number>(0);
  quality       = signal<number>(80);
  outputFormat  = signal<FormatOption>(FORMATS[0]);
  isDragging    = signal(false);
  isProcessing  = signal(false);

  readonly isDone = computed(() => this.resultUrl() !== null);
  readonly isLossy = computed(() => this.outputFormat().lossy);
  readonly compressionRatio = computed(() => {
    const orig = this.originalSize();
    const res  = this.resultSize();
    if (!orig || !res) return 0;
    return Math.max(0, Math.round((1 - res / orig) * 100));
  });

  private currentImg: HTMLImageElement | null = null;
  private currentFilename = 'imagen';
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  openFilePicker(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (file) this.loadFile(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files[0];
    if (file && file.type.startsWith('image/')) this.loadFile(file);
  }

  selectFormat(fmt: FormatOption): void {
    this.outputFormat.set(fmt);
    this.scheduleCompress();
  }

  private loadFile(file: File): void {
    if (this.previewUrl()) URL.revokeObjectURL(this.previewUrl()!);
    if (this.resultUrl())  URL.revokeObjectURL(this.resultUrl()!);

    this.resultUrl.set(null);
    this.resultSize.set(0);
    this.originalSize.set(file.size);
    this.currentFilename = file.name.replace(/\.[^.]+$/, '');

    const url = URL.createObjectURL(file);
    this.previewUrl.set(url);

    const img = new Image();
    img.onload = () => {
      this.currentImg = img;
      this.compress();
    };
    img.src = url;
  }

  onQualityChange(event: Event): void {
    this.quality.set(Number((event.target as HTMLInputElement).value));
    this.scheduleCompress();
  }

  private scheduleCompress(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.compress(), 120);
  }

  private compress(): void {
    if (!this.currentImg) return;

    this.isProcessing.set(true);

    const fmt    = this.outputFormat();
    const img    = this.currentImg;
    const canvas = document.createElement('canvas');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;

    canvas.getContext('2d')!.drawImage(img, 0, 0);

    const qualityArg = fmt.lossy ? this.quality() / 100 : undefined;

    canvas.toBlob(
      blob => {
        if (!blob) { this.isProcessing.set(false); return; }
        if (this.resultUrl()) URL.revokeObjectURL(this.resultUrl()!);
        this.resultUrl.set(URL.createObjectURL(blob));
        this.resultSize.set(blob.size);
        this.isProcessing.set(false);
      },
      fmt.mime,
      qualityArg,
    );
  }

  download(): void {
    const url = this.resultUrl();
    if (!url) return;
    const fmt = this.outputFormat();
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentFilename}_opt.${fmt.ext}`;
    a.click();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
