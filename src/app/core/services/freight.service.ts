import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FreightService {
  // Rota relativa — depende de proxy ou deploy da serverless function
  private apiUrl = '/api/freight';

  constructor(private http: HttpClient) {}
  // Método de cálculo de frete
  calculateFreight(zipCode: string): Observable<any[]> {
    const cleanZipCode = zipCode.replace(/\D/g, '');

    // Validação antecipada evita chamada desnecessária à API
    if (cleanZipCode.length !== 8) {
      return throwError(() => new Error('CEP inválido'));
    }

    // POST para a serverless function que intermedia a chamada ao Melhor Envio
    return this.http.post<any[]>(this.apiUrl, { zipCode: cleanZipCode }).pipe(
      map(data => {
        if (!Array.isArray(data)) {
          throw new Error('Formato inesperado da resposta');
        }
        return data;
      }),
      catchError(err => {
        const msg = err?.error?.erro || err?.message || 'Erro ao calcular frete';
        return throwError(() => new Error(msg));
      })
    );
  }
}