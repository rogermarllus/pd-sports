import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'https://69b83d23ffbcd02860979f9b.mockapi.io/api';

  getEndpointById(id: number) {
    return Number(id) <= 100 ? 'products' : 'products2';
  }

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    const products = this.http.get<any[]>(`${this.apiUrl}/products`);
    const products2 = this.http.get<any[]>(`${this.apiUrl}/products2`);

    return forkJoin([products, products2]).pipe(map(([p1, p2]) => [...p1, ...p2]));
  }

  getById(id: number): Observable<any> {
    const endpoint = this.getEndpointById(id);
    return this.http.get<any>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  getProductsByModality(modality: string): Observable<any[]> {
    return this.getAll().pipe(map((products) => products.filter((p) => p.modality === modality)));
  }

  searchProductsByName(term: string): Observable<any[]> {
    return this.getAll().pipe(
      map((products) => products.filter((p) => p.name.toLowerCase().includes(term.toLowerCase()))),
    );
  }

  create(product: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products2`, product);
  }

  update(id: number, product: any): Observable<any> {
    const endpoint = this.getEndpointById(id);
    return this.http.put<any>(`${this.apiUrl}/${endpoint}/${id}`, product);
  }

  delete(id: number): Observable<any> {
    const endpoint = this.getEndpointById(id);
    return this.http.delete<any>(`${this.apiUrl}/${endpoint}/${id}`);
  }
}
