import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';

export type VideoQuality = '360' | '480' | '720' | '1080' | '1440' | '2160';
export type DownloadMode = 'auto' | 'audio';

export interface CobaltPickerItem {
  url: string;
  thumb?: string;
  type?: string;
}

export type CobaltResponse =
  | { status: 'stream' | 'redirect' | 'tunnel'; url: string; filename?: string; audioUrl?: string }
  | { status: 'picker'; picker: CobaltPickerItem[]; audio?: string }
  | { status: 'error'; error: { code: string } };

@Injectable({ providedIn: 'root' })
export class CobaltService {
  private http = inject(HttpClient);
  private readonly API = '/api/proxy-cobalt';

  resolve(url: string, quality: VideoQuality, mode: DownloadMode): Observable<CobaltResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
    return this.http.post<CobaltResponse>(
      this.API,
      { url, videoQuality: quality, downloadMode: mode },
      { headers },
    );
  }
}
