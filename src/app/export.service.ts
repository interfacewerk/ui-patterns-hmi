import { Injectable } from '@angular/core';
import { EditableContactData } from './contacts.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExportService {
  exportEvent: Observable<ExportEvent>;

  constructor() {
    this.exportedData = [];
    this.exportEventSubject = new Subject<ExportEvent>();
    this.exportEvent = this.exportEventSubject.asObservable();
  }

  addToExport(contact: EditableContactData) {
    this.exportedData.push(contact);
    this.exportEventSubject.next(ExportEvent.ADD);
  }

  private
  exportedData: EditableContactData[];
  exportEventSubject: Subject<ExportEvent>;
}

export enum ExportEvent {
  ADD
}