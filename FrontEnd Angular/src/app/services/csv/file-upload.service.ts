import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsvUploadService {

  private apiUrl = 'http://localhost:3000/api/upload';  // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient) { }

  uploadCsv(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);  // Envoi du FormData
  }
}
