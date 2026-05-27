import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://69b83d57ffbcd0286097a0a9.mockapi.io/api';
  private readonly STORAGE_KEY = 'user';

  constructor(private http: HttpClient) {}

  login(email: string, senha: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map((users) => {
        const user = users.find((u) => u.email === email && u.password === senha);
        if (!user) throw new Error('Email ou senha inválidos');
        return user;
      }),
      tap((user) => this.salvarSessao(user)),
    );
  }

  registrar(dados: any): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map((users) => {
        if (users.find((u) => u.email === dados.email)) {
          throw new Error('Email já cadastrado');
        }
        return dados;
      }),
      map((dados) => ({
        name: dados.name,
        email: dados.email,
        phone: dados.phone,
        birthDate: dados.birthDate,
        password: dados.password,
        isAdmin: false,
      })),
      tap((novoUsuario) =>
        this.http
          .post(`${this.apiUrl}/users`, novoUsuario)
          .pipe(tap((criado) => this.salvarSessao(criado)))
          .subscribe(),
      ),
    );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('cart');
  }

  salvarSessao(user: any): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  getUsuarioAtual(): any {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  isLogado(): boolean {
    return !!this.getUsuarioAtual();
  }

  isAdmin(): boolean {
    const user = this.getUsuarioAtual();
    return user?.isAdmin === true;
  }
}
