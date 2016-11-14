/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BirdService } from './bird.service';

describe('Service: Bird', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BirdService]
    });
  });

  it('should ...', inject([BirdService], (service: BirdService) => {
    expect(service).toBeTruthy();
  }));
});
