import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AsyncSubject } from 'rxjs/AsyncSubject';


@Injectable()
export class ContactsService {
  contacts: Contact[];

  constructor() {
    try {
      this.contacts = JSON.parse(localStorage.getItem('server:contacts')) || [];
    } catch(e) {
      this.contacts = [];
    }

    this.saveContactsInLocalStorage();
  }

  list(): Observable<Contact[]> {
    return delayedResponse<Contact[]>(this.contacts, 2000);
  }

  get(id: number): Observable<Contact> {
    return delayedResponse<Contact>(this.contacts.filter(c => c.id === id)[0], 2000);
  }

  create(data: EditableContactData): Observable<Contact> {
    let contact: Contact = {
      id: this.contacts.reduce((p, c) => Math.max(p, c.id), 0) + 1,
      name: data.name,
      phone: data.phone,
      email: data.email,
      isDeleted: false
    };
    this.contacts.push(contact);
    this.saveContactsInLocalStorage();
    return delayedResponse<Contact>(contact, 2000);
  }

  update(id: number, data: EditableContactData): Observable<Contact> {
    let found: Contact;
    
    this.contacts.some(c => {
      if (c.id !== id) return false;
      c.email = data.email;
      c.name = data.name;
      c.phone = data.phone;
      found = c;
      return true;
    });
    
    if (found) {
      this.saveContactsInLocalStorage();      
      return delayedResponse<Contact>(found, 2000);
    } else {
      return delayedResponse<Contact>(null, 2000);
    }
  }

  remove(id: number): Observable<string> {
    let idx = this.contacts.map(c => c.id).indexOf(id);
    if (idx === -1) {
      return delayedResponse('No such contact', 2000);
    }
    this.contacts[idx].isDeleted = true;
    this.saveContactsInLocalStorage();
    return delayedResponse(null, 2000);
  }

  undoRemove(id: number): Observable<string> {
    let idx = this.contacts.map(c => c.id).indexOf(id);
    if (idx === -1) {
      return delayedResponse('No such contact', 2000);
    }
    this.contacts[idx].isDeleted = false;
    this.saveContactsInLocalStorage();
    return delayedResponse(null, 2000);
  }

  private
  saveContactsInLocalStorage() {
    localStorage.setItem('server:contacts', JSON.stringify(this.contacts));
  }

}

function delayedResponse<T>(value: T, delay: number): Observable<T> {
  let subject = new AsyncSubject<T>();
  setTimeout(() => {
    subject.next(value);
    subject.complete();
  }, delay);
  return subject.asObservable();
}

export type Contact = {
  id: number,
  name: string,
  email: string,
  phone: string,
  isDeleted: boolean
}

export type EditableContactData = {
  name?: string,
  email?: string,
  phone?: string
}