import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBrl',
  standalone: false,
})
export class CurrencyBrlPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    if (valor == null) {
      return '';
    }

    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
