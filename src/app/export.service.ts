import { Injectable } from '@angular/core';
import { EditableContactData } from './contacts.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExportService {
  addedToExport: Observable<ExportEventParam>;
  
  constructor() {
    this.addedToExportSubject = new Subject<ExportEventParam>();
    this.addedToExport = this.addedToExportSubject.asObservable();
    this.exportedData = [];
  }

  addToExport(contact: EditableContactData, source: HTMLElement) {
    this.exportedData.push(contact);
    this.addedToExportSubject.next({contact, source});
  }

  private
  addedToExportSubject: Subject<ExportEventParam>;
  exportedData: EditableContactData[];
}

type ExportEventParam = {
  contact: EditableContactData,
  source: HTMLElement
}
