import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verifica se o usuário atual é um administrador antes de permitir acesso à rota
  if (authService.isAdmin()) return true;

  // Redireciona para home
  return router.createUrlTree(['/']);
};