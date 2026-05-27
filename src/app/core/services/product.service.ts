import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'https://69b83d23ffbcd02860979f9b.mockapi.io/api';

  // O MockAPI limita 100 itens por coleção, produtos acima do id 100 estão em /products2
  getEndpointById(id: number) {
    return Number(id) <= 100 ? 'products' : 'products2';
  }

  constructor(private http: HttpClient) {}

  // Busca simultânea nas duas coleções e combina em um único array
  getAll(): Observable<any[]> {
    const products = this.http.get<any[]>(`${this.apiUrl}/products`);
    const products2 = this.http.get<any[]>(`${this.apiUrl}/products2`);

    return forkJoin([products, products2]).pipe(map(([p1, p2]) => [...p1, ...p2]));
  }

  // Busca um item pelo id
  getById(id: number): Observable<any> {
    const endpoint = this.getEndpointById(id);
    return this.http.get<any>(`${this.apiUrl}/${endpoint}/${id}`);
  }

  // Filtragem client-side por modalidade esportiva (ex: "futebol", "natação")
  getProductsByModality(modality: string): Observable<any[]> {
    return this.getAll().pipe(map((products) => products.filter((p) => p.modality === modality)));
  }

  // Busca por ietns com base em um nome
  searchProductsByName(term: string): Observable<any[]> {
    return this.getAll().pipe(
      map((products) => products.filter((p) => p.name.toLowerCase().includes(term.toLowerCase()))),
    );
  }

  // Novos produtos sempre criados em /products2 por ser a coleção de expansão
  create(product: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products2`, product);
  }

  // Atualiza um item pelo id
  update(id: number, product: any): Observable<any> {
    const endpoint = this.getEndpointById(id);
    return this.http.put<any>(`${this.apiUrl}/${endpoint}/${id}`, product);
  }

  // Exclui um item pelo id
  delete(id: number): Observable<any> {
    const endpoint = this.getEndpointById(id);
    return this.http.delete<any>(`${this.apiUrl}/${endpoint}/${id}`);
  }
}
