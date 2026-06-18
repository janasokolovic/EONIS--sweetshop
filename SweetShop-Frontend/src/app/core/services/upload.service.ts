import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UploadResult {
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly apiUrl = 'https://localhost:7052/api/upload';
  private readonly serverBaseUrl = 'https://localhost:7052';

  constructor(private http: HttpClient) {}

  /**
   * Upload slike na server.
   * @param file fajl iz <input type="file">
   * @param folder 'products' ili 'categories'
   */
  uploadImage(file: File, folder: 'products' | 'categories'): Observable<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResult>(`${this.apiUrl}/image?folder=${folder}`, formData);
  }

  /**
   * Pretvara relativnu URL putanju (npr. /uploads/products/abc.jpg) u kompletnu URL.
   * Vraća prazan string ako URL nije zadat.
   */
  getFullUrl(relativeOrFullUrl?: string): string {
    if (!relativeOrFullUrl) return '';
    // Ako je već apsolutni URL (počinje sa http), vrati ga kakav jeste
    if (relativeOrFullUrl.startsWith('http://') || relativeOrFullUrl.startsWith('https://')) {
      return relativeOrFullUrl;
    }
    // Inače dodaj base URL backend-a
    return this.serverBaseUrl + relativeOrFullUrl;
  }
}