import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyBrl',
  standalone: false,
})
export class CurrencyBrlPipe implements PipeTransform {
  transform(valor: number | string | null | undefined): string {
    if (valor == null || valor === '') {
      return '';
    }

    let numericValue: number;
    if (typeof valor === 'string') {
      const cleanedValue = valor.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
      numericValue = Number(cleanedValue);
      if (!Number.isFinite(numericValue)) {
        return valor;
      }
    } else {
      numericValue = valor;
    }

    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }
}
