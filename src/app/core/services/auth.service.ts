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

  login(email: string, password: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/users`).pipe(
      map((users) => {
        const user = users.find((u) => u.email === email && u.password === password);
        if (!user) throw new Error('Email ou senha inválidos');
        return user;
      }),
      tap((user) => this.saveSession(user)),
    );
  }

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
          .pipe(tap((created) => this.saveSession(created)))
          .subscribe(),
      ),
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
