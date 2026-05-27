import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://69b83d57ffbcd0286097a0a9.mockapi.io/api';

  // BehaviorSubject permite que qualquer componente acesse o usuário atual de forma reativa
  private currentUser = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    const user = this.authService.getCurrentUser();
    if (user) this.currentUser.next(user);
  }

  // Busca os dados atualizados do usuário diretamente na API e sincroniza o estado reativo
  getUser(): Observable<any> {
    const user = this.authService.getCurrentUser();
    return this.http.get<any>(`${this.apiUrl}/users/${user.id}`).pipe(
      tap((data) => this.currentUser.next(data))
    );
  }

  // Atualiza os dados na API, sincroniza o BehaviorSubject e persiste a sessão localmente
  updateUser(data: any): Observable<any> {
    const user = this.authService.getCurrentUser();
    return this.http.put<any>(`${this.apiUrl}/users/${user.id}`, data).pipe(
      tap((updated) => {
        this.currentUser.next(updated);
        this.authService.saveSession(updated);
      })
    );
  }
}