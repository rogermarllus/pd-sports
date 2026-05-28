import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Utiliza a URL base configurada em 'api.config.ts'
  private apiUrl = API_CONFIG.baseUrlUsers;
  private readonly STORAGE_KEY = 'user';

  constructor(private http: HttpClient) {}

  // Busca todos os usuários e compara client-side para realizar o login
  login(email: string, password: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map((users) => {
        const user = users.find((u) => u.email === email && u.password === password);
        if (!user) throw new Error('Email ou senha inválidos');
        return user;
      }),
      // Persiste o objeto do usuário na sessão após autenticação bem-sucedida
      tap((user) => this.saveSession(user)),
    );
  }

  // Registra um novo usuário, verificando a duplicidade de email antes de criar
  register(data: any): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map((users) => {
        if (users.find((u) => u.email === data.email)) {
          throw new Error('Email já cadastrado');
        }
        return data;
      }),
      map((data) => ({
        name: data.name,
        email: data.email,
        phone: data.phone,
        birthDate: data.birthDate,
        password: data.password,
        isAdmin: false,
      })),
      tap((newUser) =>
        this.http
          .post(`${this.apiUrl}/users`, newUser)
          // Salva sessão com o objeto retornado pela API, que inclui o id gerado pelo MockAPI
          .pipe(tap((created) => this.saveSession(created)))
          .subscribe(),
      ),
    );
  }

  // Remove usuário e carrinho juntos
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('cart');
  }

  // Armazena objeto no LocalStorage
  saveSession(user: any): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  // Retorna o objeto usuário salvo no LocalStorage
  getCurrentUser(): any {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  // Retorna false se não houver sessão ativa
  isLogged(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin === true;
  }
}
