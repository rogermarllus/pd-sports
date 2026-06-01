import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { FreightService } from './freight.service';

describe('FreightService', () => {
  let service: FreightService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
      ],
    });
    service = TestBed.inject(FreightService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
