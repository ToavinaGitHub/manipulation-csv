import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsvUploadService {

  private apiUrl = 'http://localhost:3000/api';  // Remplacez par l'URL de votre backend

  constructor(private http: HttpClient) { }

  // Méthode pour télécharger un fichier CSV
  uploadCsv(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/upload`, formData);  // Envoi du FormData
  }

  // Méthode pour récupérer tous les fichiers (sans spécifier de type)
  getFiles(type?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getFile?type=${type}`);
  }

  deleteFile(type: string, fileName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${type}/${fileName}`);
  }
}
