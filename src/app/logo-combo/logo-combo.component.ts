import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo-combo',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './logo-combo.component.html',
  styleUrl: './logo-combo.component.css',
})
export class LogoComboComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  userLogoUrl = signal<string | null>(null);
  resultUrl = signal<string | null>(null);
  isDragging = signal(false);
  isProcessing = signal(false);

  private currentFile: File | null = null;

  openFilePicker(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
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

  private loadFile(file: File): void {
    if (!file.type.startsWith('image/')) return;
    if (this.userLogoUrl()) URL.revokeObjectURL(this.userLogoUrl()!);
    if (this.resultUrl()) URL.revokeObjectURL(this.resultUrl()!);
    this.resultUrl.set(null);
    this.currentFile = file;
    this.userLogoUrl.set(URL.createObjectURL(file));
  }

  async process(): Promise<void> {
    if (!this.currentFile) return;
    this.isProcessing.set(true);
    try {
      const blob = await this.composite();
      if (this.resultUrl()) URL.revokeObjectURL(this.resultUrl()!);
      this.resultUrl.set(URL.createObjectURL(blob));
    } finally {
      this.isProcessing.set(false);
    }
  }

  private composite(): Promise<Blob> {
    const file = this.currentFile!;
    return new Promise((resolve, reject) => {
      const baseImg = new Image();
      baseImg.onload = () => {
        const userImg = new Image();
        userImg.onload = () => {
          const W = baseImg.width;
          const H = baseImg.height;
          const canvas = document.createElement('canvas');
          canvas.width = W;
          canvas.height = H;
          const ctx = canvas.getContext('2d')!;

          ctx.drawImage(baseImg, 0, 0, W, H);

          // Right slot: x 60%–95%, y 20%–80% (mirrors left logo area)
          const areaX = W * 0.60;
          const areaW = W * 0.35;
          const areaY = H * 0.20;
          const areaH = H * 0.60;

          const scale = Math.min(areaW / userImg.width, areaH / userImg.height);
          const dw = userImg.width * scale;
          const dh = userImg.height * scale;
          const dx = areaX + (areaW - dw) / 2;
          const dy = areaY + (areaH - dh) / 2;

          ctx.drawImage(userImg, dx, dy, dw, dh);

          canvas.toBlob(blob => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas toBlob failed'));
          }, 'image/png');
        };
        userImg.onerror = reject;
        userImg.src = URL.createObjectURL(file);
      };
      baseImg.onerror = reject;
      baseImg.src = 'plus.png';
    });
  }

  download(): void {
    const url = this.resultUrl();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logo-combinado.png';
    a.click();
  }
}
