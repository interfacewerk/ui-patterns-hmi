import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';

@Injectable()
export class BirdService {

  constructor() {
    this.airports = {};
  }

  deliverTo(airportId: string, source: HTMLElement): Promise<void> {
    if (this.airports[airportId]) {
      return this.airports[airportId](source);
    } else {
      return new Promise((resolve) => resolve());
    }
  }

  registerAirport(airpordId: string, cb: (source: HTMLElement) => Promise<void>): () => void {
    this.airports[airpordId] = cb;
    return () => {
      this.airports[airpordId] = null;
    };
  };

  private newDeliverySubject: Subject<{airportId: string, source: HTMLElement}>;

  private airports: {
    [airportId: string]: (source: HTMLElement) => Promise<void>
  }
}
