import { CurrencyBrlPipe } from './currency-brl-pipe';

describe('CurrencyBrlPipe', () => {
  let pipe: CurrencyBrlPipe;

  beforeEach(() => {
    pipe = new CurrencyBrlPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format a number as BRL currency', () => {
    const result = pipe.transform(99.9);
    expect(result).toContain('R$');
    expect(result).toContain('99');
  });

  it('should format zero correctly', () => {
    expect(pipe.transform(0)).toContain('R$');
  });

  it('should format a string value as BRL currency', () => {
    expect(pipe.transform('479,90')).toContain('R$');
    expect(pipe.transform('479,90')).toContain('479');
  });
});
