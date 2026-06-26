import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  create<T>(endpoint: string, data: unknown): Observable<T> {
    return this.http.post<T>(`${this.base}/${endpoint}`, data);
  }

  getAll<T>(endpoint: string): Observable<T[]> {
    return this.http.get<T[]>(`${this.base}/${endpoint}`);
  }

  update<T>(endpoint: string, id: number, data: unknown): Observable<T> {
    return this.http.put<T>(`${this.base}/${endpoint}/${id}`, data);
  }

  delete(endpoint: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${endpoint}/${id}`);
  }
}