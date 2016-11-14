import { Injectable } from '@angular/core';
import { EditableContactData } from './contacts.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ExportService {
  
  constructor() {
    this.exportedData = [];
  }

  addToExport(contact: EditableContactData) {
    this.exportedData.push(contact);
  }

  private
  exportedData: EditableContactData[];
}
