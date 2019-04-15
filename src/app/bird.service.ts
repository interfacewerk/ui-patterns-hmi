import { Injectable } from '@angular/core';

@Injectable()
export class BirdService {

  private airports: {
    [airportId: string]: (source: HTMLElement) => Promise<void>
  } = {};

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
  }

}
