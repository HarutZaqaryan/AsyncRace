import { TestBed } from '@angular/core/testing';

import { CarsServivce } from './cars.service';

describe('CarsServivceService', () => {
  let service: CarsServivce;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarsServivce);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
