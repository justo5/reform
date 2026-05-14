import { Injectable, signal } from '@angular/core';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ProcessingState } from '../models/media.model';

type DrawSource = HTMLImageElement | HTMLVideoElement;

@Injectable({ providedIn: 'root' })
export class MediaProcessorService {
  readonly state = signal<ProcessingState>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  private ffmpeg: FFmpeg | null = null;

  async convertToMp4(blob: Blob): Promise<Blob> {
    if (!this.ffmpeg) {
      this.setState({ status: 'processing', progress: 0, message: 'Cargando conversor…' });
      const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      this.ffmpeg = new FFmpeg();
      await this.ffmpeg.load({
        coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    }

    this.setState({ status: 'processing', progress: 50, message: 'Transformando a MP4…' });
    await this.ffmpeg.writeFile('input.webm', await fetchFile(blob));
    await this.ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-preset', 'fast', '-c:a', 'aac', 'output.mp4']);
    const raw = await this.ffmpeg.readFile('output.mp4') as Uint8Array;
    await this.ffmpeg.deleteFile('input.webm');
    await this.ffmpeg.deleteFile('output.mp4');

    this.setState({ status: 'done', progress: 100, message: '¡Listo!' });
    return new Blob([new Uint8Array(raw)], { type: 'video/mp4' });
  }

  async processImage(file: File, outW: number, outH: number): Promise<Blob> {
    this.setState({ status: 'processing', progress: 0, message: 'Procesando imagen…' });

    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width  = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d')!;

    this.drawBlurBg(ctx, img, outW, outH);
    this.drawFitFg(ctx, img, outW, outH);

    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
    this.setState({ status: 'done', progress: 100, message: '¡Listo!' });
    return blob;
  }

  processVideo(file: File, outW: number, outH: number): Promise<Blob> {
    this.setState({ status: 'processing', progress: 0, message: 'Procesando video…' });

    // Create AudioContext here — this method is called from a button click (user gesture).
    // Creating it inside loadedmetadata would be outside that gesture context and
    // Chrome would leave it suspended, silencing the audio in the output.
    const audioCtx = new AudioContext();

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.playsInline = true;

      const canvas = document.createElement('canvas');
      canvas.width  = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d')!;

      // Small scratch canvases for cheap blur: process at 25% resolution then upscale.
      // Reduces blur cost ~16× (fewer pixels) with identical visual result.
      const bgW = Math.ceil(outW * 0.25);
      const bgH = Math.ceil(outH * 0.25);
      const bgRaw  = Object.assign(document.createElement('canvas'), { width: bgW, height: bgH });
      const bgBlur = Object.assign(document.createElement('canvas'), { width: bgW, height: bgH });
      const bgRawCtx  = bgRaw.getContext('2d')!;
      const bgBlurCtx = bgBlur.getContext('2d')!;

      video.addEventListener('loadedmetadata', () => {
        const duration = video.duration;

        // Route audio through AudioContext so it's captured but not played aloud.
        const audioSrc  = audioCtx.createMediaElementSource(video);
        const audioDest = audioCtx.createMediaStreamDestination();
        audioSrc.connect(audioDest);

        const canvasStream = canvas.captureStream(30);
        audioDest.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));

        const mimeType = preferredMime();
        const recorder = new MediaRecorder(canvasStream, { mimeType });
        const chunks: Blob[] = [];

        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          URL.revokeObjectURL(video.src);
          audioCtx.close();
          this.setState({ status: 'done', progress: 100, message: '¡Listo!' });
          resolve(new Blob(chunks, { type: mimeType }));
        };

        let raf = 0;
        const tick = () => {
          if (video.paused || video.ended) return;
          this.drawBlurBgFast(ctx, bgRawCtx, bgBlurCtx, video, outW, outH);
          this.drawFitFg(ctx, video, outW, outH);
          this.setState({ progress: Math.round((video.currentTime / duration) * 100) });
          raf = requestAnimationFrame(tick);
        };

        recorder.start();
        // Resume AudioContext before playing — ensures the audio graph is running
        // before any samples flow through it.
        audioCtx.resume()
          .then(() => video.play())
          .then(tick)
          .catch(reject);
        video.addEventListener('ended', () => { cancelAnimationFrame(raf); recorder.stop(); });
        video.addEventListener('error',  () => { cancelAnimationFrame(raf); reject(new Error('Error al leer el video')); });
      });

      video.addEventListener('error', () => { audioCtx.close(); reject(new Error('Error al leer el video')); });
    });
  }

  // 3-pass blur used for video: operate at 25% resolution then upscale — ~16× cheaper.
  private drawBlurBgFast(
    ctx: CanvasRenderingContext2D,
    rawCtx: CanvasRenderingContext2D,
    blurCtx: CanvasRenderingContext2D,
    src: HTMLVideoElement,
    w: number,
    h: number
  ): void {
    const { sw, sh } = naturalSize(src);
    const bgW = rawCtx.canvas.width, bgH = rawCtx.canvas.height;
    const scale = Math.max(bgW / sw, bgH / sh) * 1.08;
    const dw = sw * scale, dh = sh * scale;
    const dx = (bgW - dw) / 2, dy = (bgH - dh) / 2;

    // Pass 1: draw current video frame at small size (no filter).
    rawCtx.drawImage(src, dx, dy, dw, dh);

    // Pass 2: blur the small frame (8px here ≈ 32px at full scale after upscaling).
    blurCtx.save();
    blurCtx.filter = 'blur(8px) brightness(0.72) saturate(1.2)';
    blurCtx.drawImage(rawCtx.canvas, 0, 0);
    blurCtx.restore();

    // Pass 3: scale the blurred small canvas up to the output canvas (no filter).
    ctx.drawImage(blurCtx.canvas, 0, 0, w, h);
  }

  private drawBlurBg(ctx: CanvasRenderingContext2D, src: DrawSource, w: number, h: number): void {
    const { sw, sh } = naturalSize(src);
    // Slight overscan (1.08×) hides the feathered edge produced by blur.
    const scale = Math.max(w / sw, h / sh) * 1.08;
    const dw = sw * scale, dh = sh * scale;
    const dx = (w - dw) / 2,  dy = (h - dh) / 2;

    ctx.save();
    ctx.filter = 'blur(30px) brightness(0.72) saturate(1.2)';
    ctx.drawImage(src, dx, dy, dw, dh);
    ctx.restore();
  }

  private drawFitFg(ctx: CanvasRenderingContext2D, src: DrawSource, w: number, h: number): void {
    const { sw, sh } = naturalSize(src);
    const scale = Math.min(w / sw, h / sh);
    const dw = sw * scale, dh = sh * scale;
    const dx = (w - dw) / 2,  dy = (h - dh) / 2;

    ctx.save();
    ctx.filter = 'none';
    ctx.drawImage(src, dx, dy, dw, dh);
    ctx.restore();
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload  = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  reset(): void {
    this.setState({ status: 'idle', progress: 0, message: '' });
  }

  private setState(patch: Partial<ProcessingState>): void {
    this.state.update(s => ({ ...s, ...patch }));
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function naturalSize(src: DrawSource): { sw: number; sh: number } {
  return src instanceof HTMLVideoElement
    ? { sw: src.videoWidth,   sh: src.videoHeight }
    : { sw: src.naturalWidth, sh: src.naturalHeight };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob falló')), type, quality)
  );
}

function preferredMime(): string {
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return candidates.find(m => MediaRecorder.isTypeSupported(m)) ?? 'video/webm';
}
