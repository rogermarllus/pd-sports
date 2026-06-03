import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { API_CONFIG } from '../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = API_CONFIG.baseUrlUsers;
  private readonly STORAGE_KEY = 'user';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map((users) => {
        const user = users.find((u) => u.email === email && u.password === password);

        if (!user) {
          throw new Error('Email ou senha inválidos');
        }

        return user;
      }),
      tap((user) => this.saveSession(user)),
    );
  }

  register(data: {
    nome: string;
    email: string;
    telefone: string;
    dataNascimento: string;
    senha: string;
  }): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      switchMap((users) => {
        const emailJaExiste = users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());

        if (emailJaExiste) {
          return throwError(() => new Error('Email já cadastrado'));
        }

        const newUser = {
          name: data.nome,
          email: data.email,
          phone: data.telefone,
          birthDate: data.dataNascimento,
          password: data.senha,
          isAdmin: false,
        };

        return this.http.post<any>(`${this.apiUrl}/users`, newUser);
      }),
      tap((createdUser) => this.saveSession(createdUser)),
    );
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('cart');
  }

  saveSession(user: any): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  getCurrentUser(): any {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  isLogged(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin === true;
  }
}
