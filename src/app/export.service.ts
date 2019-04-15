import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EditableContactData } from './contacts.service';

export enum ExportEvent {
  ADD
}

@Injectable()
export class ExportService {
  exportEvent: Observable<ExportEvent>;
  exportedData: EditableContactData[];

  private exportEventSubject: Subject<ExportEvent>;

  constructor() {
    this.exportedData = [];
    this.exportEventSubject = new Subject<ExportEvent>();
    this.exportEvent = this.exportEventSubject.asObservable();
  }

  addToExport(contact: EditableContactData) {
    this.exportedData.push(contact);
    this.exportEventSubject.next(ExportEvent.ADD);
  }

}
