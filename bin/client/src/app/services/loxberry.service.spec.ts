import { TestBed } from '@angular/core/testing';
import { LoxBerryService } from './loxberry.service';

describe('LoxBerryService', () => {
  let service: LoxBerryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoxBerryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
