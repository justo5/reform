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
      this.ffmpeg = new FFmpeg();
      await this.ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js?ngsw-bypass=true', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm?ngsw-bypass=true', 'application/wasm'),
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
      const ctx = canvas.getContext('2d', { alpha: false })!;

      // Cached background: re-rendered only every BG_REFRESH_MS — the blur is
      // strong enough that updating it ~10×/s is visually identical to every frame.
      const bg = Object.assign(document.createElement('canvas'), { width: outW, height: outH });
      const bgCtx = bg.getContext('2d', { alpha: false })!;

      // Tiny scratch for the cheap-blur trick: downscale source aggressively,
      // then upscale to the cached bg via bilinear interpolation. No CSS filter
      // anywhere — that's what was eating the frame budget.
      const tinyW = 48;
      const tinyH = Math.max(8, Math.ceil(48 * outH / outW));
      const tiny = Object.assign(document.createElement('canvas'), { width: tinyW, height: tinyH });
      const tinyCtx = tiny.getContext('2d', { alpha: false })!;

      const BG_REFRESH_MS = 100;

      video.addEventListener('loadedmetadata', () => {
        const duration = video.duration;

        // Route audio through AudioContext so it's captured but not played aloud.
        const audioSrc  = audioCtx.createMediaElementSource(video);
        const audioDest = audioCtx.createMediaStreamDestination();
        audioSrc.connect(audioDest);

        // No frame-rate cap on captureStream — let the canvas drive the cadence.
        const canvasStream = canvas.captureStream();
        audioDest.stream.getAudioTracks().forEach(t => canvasStream.addTrack(t));

        const { mime, ext } = preferredMime();
        const recorder = new MediaRecorder(canvasStream, {
          mimeType: mime,
          videoBitsPerSecond: 5_000_000,
        });
        const chunks: Blob[] = [];

        recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        recorder.onstop = () => {
          URL.revokeObjectURL(video.src);
          audioCtx.close();
          this.setState({ status: 'done', progress: 100, message: '¡Listo!' });
          // Tag the blob with the extension so callers can skip ffmpeg when it's mp4.
          const blob = new Blob(chunks, { type: mime });
          (blob as Blob & { __ext?: string }).__ext = ext;
          resolve(blob);
        };

        let stopped = false;
        let lastBg  = -Infinity;
        let rafId   = 0;

        const renderFrame = (nowMs: number) => {
          if (nowMs - lastBg > BG_REFRESH_MS) {
            this.refreshBlurBg(bgCtx, tinyCtx, video, outW, outH);
            lastBg = nowMs;
          }
          ctx.drawImage(bg, 0, 0);
          this.drawFitFg(ctx, video, outW, outH);
          this.setState({ progress: Math.round((video.currentTime / duration) * 100) });
        };

        // Prefer requestVideoFrameCallback: fires exactly once per decoded source
        // frame, so we render the source's native cadence (24/30/60) rather than
        // the display refresh rate. Fall back to rAF on browsers without it.
        const hasRVFC = typeof (video as HTMLVideoElement & { requestVideoFrameCallback?: unknown }).requestVideoFrameCallback === 'function';

        const tickRVFC = (_now: number, _metadata: { mediaTime: number; presentationTime: number }) => {
          if (stopped || video.ended) return;
          renderFrame(performance.now());
          (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: (n: number, m: { mediaTime: number; presentationTime: number }) => void) => number }).requestVideoFrameCallback(tickRVFC);
        };

        const tickRAF = () => {
          if (stopped || video.paused || video.ended) return;
          renderFrame(performance.now());
          rafId = requestAnimationFrame(tickRAF);
        };

        const startTicking = () => {
          if (hasRVFC) {
            (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: (n: number, m: { mediaTime: number; presentationTime: number }) => void) => number }).requestVideoFrameCallback(tickRVFC);
          } else {
            rafId = requestAnimationFrame(tickRAF);
          }
        };

        recorder.start();
        // Resume AudioContext before playing — ensures the audio graph is running
        // before any samples flow through it.
        audioCtx.resume()
          .then(() => video.play())
          .then(startTicking)
          .catch(reject);
        video.addEventListener('ended', () => { stopped = true; cancelAnimationFrame(rafId); recorder.stop(); });
        video.addEventListener('error',  () => { stopped = true; cancelAnimationFrame(rafId); reject(new Error('Error al leer el video')); });
      });

      video.addEventListener('error', () => { audioCtx.close(); reject(new Error('Error al leer el video')); });
    });
  }

  // Cheap blur: aggressive downscale + bilinear upscale. The browser's image
  // interpolation does the "blur" for us — no CSS filter, fully GPU-friendly.
  private refreshBlurBg(
    bgCtx: CanvasRenderingContext2D,
    tinyCtx: CanvasRenderingContext2D,
    src: HTMLVideoElement,
    w: number,
    h: number
  ): void {
    const { sw, sh } = naturalSize(src);
    if (!sw || !sh) return;

    const tw = tinyCtx.canvas.width;
    const th = tinyCtx.canvas.height;
    const scale = Math.max(tw / sw, th / sh) * 1.08;
    const dw = sw * scale, dh = sh * scale;
    const dx = (tw - dw) / 2, dy = (th - dh) / 2;

    // Source → tiny (covers the tiny canvas).
    tinyCtx.drawImage(src, dx, dy, dw, dh);

    // Tiny → bg full size. Bilinear upscale ≈ Gaussian blur.
    bgCtx.imageSmoothingEnabled = true;
    bgCtx.imageSmoothingQuality = 'high';
    bgCtx.drawImage(tinyCtx.canvas, 0, 0, w, h);

    // Darken (was brightness(0.72) in the old CSS filter).
    bgCtx.fillStyle = 'rgba(0,0,0,0.28)';
    bgCtx.fillRect(0, 0, w, h);
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

function preferredMime(): { mime: string; ext: 'mp4' | 'webm' } {
  // mp4 first: H.264 is usually hardware-accelerated, so encoding is far cheaper
  // than VP8/VP9 software encode, and we skip the ffmpeg.wasm conversion step
  // entirely. Falls back to webm on Firefox.
  const candidates: { mime: string; ext: 'mp4' | 'webm' }[] = [
    { mime: 'video/mp4;codecs=avc1.42E01F,mp4a.40.2', ext: 'mp4' },
    { mime: 'video/mp4;codecs=avc1,mp4a.40.2',        ext: 'mp4' },
    { mime: 'video/mp4',                              ext: 'mp4' },
    { mime: 'video/webm;codecs=vp8,opus',             ext: 'webm' },
    { mime: 'video/webm;codecs=vp9,opus',             ext: 'webm' },
    { mime: 'video/webm',                             ext: 'webm' },
  ];
  return candidates.find(c => MediaRecorder.isTypeSupported(c.mime)) ?? { mime: 'video/webm', ext: 'webm' };
}
