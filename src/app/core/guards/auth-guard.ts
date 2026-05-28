import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se há sessão ativa no localStorage antes de permitir acesso à rota
  if (authService.isLogged()) return true;

  // Redireciona para login
  return router.createUrlTree(['/auth/login']);
};