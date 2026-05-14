import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MediaProcessorService } from '../services/media-processor.service';
import {
  AspectRatio,
  MediaType,
  OUTPUT_FORMATS,
  OutputFormat,
} from '../models/media.model';

@Component({
  selector: 'app-reform',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reform.component.html',
  styleUrl: './reform.component.css',
})
export class ReformComponent {
  private processor = inject(MediaProcessorService);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  readonly formats = OUTPUT_FORMATS;
  readonly processingState = this.processor.state;

  selectedFormat = signal<OutputFormat>(OUTPUT_FORMATS[0]);
  mediaType      = signal<MediaType | null>(null);
  previewUrl     = signal<string | null>(null);
  resultUrl      = signal<string | null>(null);
  resultFilename = signal<string>('output');
  isDragging     = signal(false);

  readonly isProcessing = computed(
    () => this.processingState().status === 'processing'
  );
  readonly isDone = computed(() => this.processingState().status === 'done');

  readonly previewRatio = computed(() => {
    const { width, height } = this.selectedFormat();
    return `${width} / ${height}`;
  });

  private currentFile: File | null = null;
  private resultBlob: Blob | null = null;

  selectFormat(fmt: OutputFormat): void {
    this.selectedFormat.set(fmt);
    this.resultUrl.set(null);
    this.resultBlob = null;
    this.processor.reset();
  }

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
    if (file) this.loadFile(file);
  }

  private loadFile(file: File): void {
    if (this.previewUrl()) URL.revokeObjectURL(this.previewUrl()!);
    if (this.resultUrl())  URL.revokeObjectURL(this.resultUrl()!);

    this.resultUrl.set(null);
    this.resultBlob = null;
    this.processor.reset();

    const type = file.type.startsWith('video/') ? 'video' : 'image';
    this.mediaType.set(type);
    this.currentFile = file;
    this.previewUrl.set(URL.createObjectURL(file));
    this.resultFilename.set(this.buildFilename(file.name));
  }

  async process(): Promise<void> {
    if (!this.currentFile) return;

    const { width, height } = this.selectedFormat();
    let blob: Blob;

    if (this.mediaType() === 'video') {
      blob = await this.processor.processVideo(this.currentFile, width, height);
    } else {
      blob = await this.processor.processImage(this.currentFile, width, height);
    }

    if (this.resultUrl()) URL.revokeObjectURL(this.resultUrl()!);
    this.resultBlob = blob;
    this.resultUrl.set(URL.createObjectURL(blob));
  }

  async download(): Promise<void> {
    if (this.mediaType() === 'video' && this.resultBlob) {
      const mp4Blob = await this.processor.convertToMp4(this.resultBlob);
      const url = URL.createObjectURL(mp4Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.resultFilename();
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } else {
      const url = this.resultUrl();
      if (!url) return;
      const a = document.createElement('a');
      a.href = url;
      a.download = this.resultFilename();
      a.click();
    }
  }

  private buildFilename(original: string): string {
    const base = original.replace(/\.[^.]+$/, '');
    const ratio = this.selectedFormat().ratio.replace(':', 'x');
    const ext   = this.mediaType() === 'video' ? 'mp4' : 'jpg';
    return `${base}_${ratio}.${ext}`;
  }

  formatLabel(ratio: AspectRatio): string {
    return ratio;
  }
}
