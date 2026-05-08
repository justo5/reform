export type AspectRatio = '9:16' | '4:5' | '1:1';
export type MediaType = 'image' | 'video';

export interface OutputFormat {
  label: string;
  ratio: AspectRatio;
  width: number;
  height: number;
}

export interface ProcessingState {
  status: 'idle' | 'loading' | 'processing' | 'done' | 'error';
  progress: number;
  message: string;
}

export const OUTPUT_FORMATS: OutputFormat[] = [
  { label: '9:16 — Stories / Reels', ratio: '9:16', width: 1080, height: 1920 },
  { label: '4:5 — Feed portrait',    ratio: '4:5',  width: 1080, height: 1350 },
  { label: '1:1 — Square / Feed',    ratio: '1:1',  width: 1080, height: 1080 },
];
