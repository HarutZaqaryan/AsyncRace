import { TestBed } from '@angular/core/testing';

import { CarsServivceService } from './cars-servivce.service';

describe('CarsServivceService', () => {
  let service: CarsServivceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarsServivceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
