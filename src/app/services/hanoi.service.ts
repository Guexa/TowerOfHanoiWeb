import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HanoiService {

  private baseUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  getSolution(numDisks: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/solve-tower?numDisks=${numDisks}`).pipe(
      catchError((error) => {
        console.error('Error en getSolution', error);
        return throwError(() => new Error('Error al obtener la solución de la API'));
      })
    );
  }
  
  getMinMoves(numDisks: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/calculate-moves?numDisks=${numDisks}`).pipe(
      catchError((error) => {
        console.error('Error en getMinMoves', error);
        return throwError(() => new Error('Error al obtener el número mínimo de movimientos'));
      })
    );
  }
}
