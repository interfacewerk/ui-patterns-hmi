import { Injectable } from '@angular/core';
import { Observable, AsyncSubject } from 'rxjs';

const INITIAL_GROUPS: Group[] = [{
  id: 0,
  name: 'Family',
  contactIds: []
}, {
  id: 1,
  name: 'Friends',
  contactIds: []
}, {
  id: 2,
  name: 'Work',
  contactIds: []
}];

@Injectable()
export class ContactsService {
  contacts: Contact[];
  groups: Group[];
  altKey: boolean;

  constructor() {
    document.addEventListener('keydown', (event) => {
      this.altKey = event.altKey;
    });

    document.addEventListener('keyup', (event) => {
      this.altKey = event.altKey;
    });

    try {
      this.contacts = JSON.parse(localStorage.getItem('server:contacts')) || [];
      this.groups = JSON.parse(localStorage.getItem('server:groups')) || INITIAL_GROUPS;
    } catch (e) {
      this.contacts = [];
      this.groups = INITIAL_GROUPS;
    }

    this.save();
  }

  listGroups(): Observable<Group[]> {
    return delayedResponse<Group[]>(this.groups, 2000);
  }

  listContacts(): Observable<Contact[]> {
    return delayedResponse<Contact[]>(this.contacts, 2000);
  }

  create(data: EditableContactData): Observable<Contact> {
    const contact: Contact = {
      id: this.contacts.reduce((p, c) => Math.max(p, c.id), 0) + 1,
      name: data.name,
      phone: data.phone,
      email: data.email,
      drilling: data.drilling,
      isDeleted: false
    };
    this.contacts.push(contact);
    this.save();
    return delayedResponse<Contact>(contact, 200);
  }

  update(id: number, data: EditableContactData): Observable<{error?: string, contact?: Contact}> {
    if (this.altKey) {
      return delayedResponse({error: 'Dieser CNC Job konnte nicht auf der Maschine gespeichert werden. Bitte nocheinmal versuchen.'}, 2000);
    }

    let found: Contact;

    this.contacts.some(c => {
      if (c.id !== id) {
        return false;
      }
      c.email = data.email;
      c.name = data.name;
      c.phone = data.phone;
      c.drilling = data.drilling;
      found = c;
      return true;
    });

    if (found) {
      this.save();
      return delayedResponse({contact: found}, 2000);
    } else {
      return delayedResponse({error: 'Not found'}, 2000);
    }
  }

  addContactToGroup(params: {
    contactId: number,
    groupId: number
  }): Observable<Group> {
    let result: Group = null;
    this.contacts.some(c => {
      if (c.id !== params.contactId) {
        return false;
      }
      return this.groups.some(g => {
        if (g.id !== params.groupId) {
          return false;
        }
        const idx = g.contactIds.indexOf(params.contactId);
        if (idx > -1) {
          return false;
        }
        g.contactIds.push(params.contactId);
        result = g;
        return true;
      });
    });
    if (result) {
      this.save();
    }
    return delayedResponse<Group>(result, 0);
  }

  removeContactFromGroup(params: {
    contactId: number,
    groupId: number
  }): Observable<Group> {
    let result: Group = null;
    this.contacts.some(c => {
      if (c.id !== params.contactId) {
        return false;
      }
      return this.groups.some(g => {
        if (g.id !== params.groupId) {
          return false;
        }
        const idx = g.contactIds.indexOf(params.contactId);
        if (idx === -1) {
          return false;
        }
        g.contactIds.splice(idx, 1);
        result = g;
        return true;
      });
    });
    if (result) {
      this.save();
    }
    return delayedResponse<Group>(result, 0);
  }

  remove(id: number): Observable<{error?: string, data?: { groups: Group[] }}> {
    const idx = this.contacts.map(c => c.id).indexOf(id);
    if (idx === -1) {
      return delayedResponse({error: 'No such contact'}, 2000);
    }
    this.contacts[idx].isDeleted = true;
    this.groups.forEach(group => group.contactIds = group.contactIds.filter(c => c !== id));
    this.save();
    return delayedResponse({
      data: {
        groups: this.groups
      }
    }, 2000);
  }

  undoRemove(id: number): Observable<string> {
    const idx = this.contacts.map(c => c.id).indexOf(id);
    if (idx === -1) {
      return delayedResponse('No such contact', 2000);
    }
    this.contacts[idx].isDeleted = false;
    this.save();
    return delayedResponse(null, 2000);
  }

  private save() {
    localStorage.setItem('server:contacts', JSON.stringify(this.contacts));
    localStorage.setItem('server:groups', JSON.stringify(this.groups));
  }

}

function delayedResponse<T>(value: T, delay: number): Observable<T> {
  const subject = new AsyncSubject<T>();
  setTimeout(() => {
    subject.next(value);
    subject.complete();
  }, delay);
  return subject.asObservable();
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  drilling?: string;
  isDeleted: boolean;
}

export interface EditableContactData {
  name?: string;
  email?: string;
  phone?: string;
  drilling?: string;
}

export interface Group {
  id: number;
  name: string;
  contactIds: number[];
}

