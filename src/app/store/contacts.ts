import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Group, Contact, EditableContactData } from '../contacts.service';

@Injectable()
export class ContactStore {
  public
  stateUpdate: Observable<void>;

  setGroupData(id: number, data: Group) {
    this.nextState(state => findGroupByIdAndDo(id, (g, idx) => {
      state.groups[idx] = data;
    }, state));
  }

  setLocalModifications(id: number, data: EditableContactData) {
    this.nextState(state => findContactByIdAndDo(id, contact => {
      contact.uiState.localModifications = data;
    }, state));
  }

  removeLocalModifications(id: number) {
    this.nextState(state => findContactByIdAndDo(id, contact => {
      contact.uiState.localModifications = null;
    }, state));
  }

  startUpdateContactData(id: number, data: EditableContactData) {
    this.nextState(state => findContactByIdAndDo(id, contact => {
      contact.uiState.isUpdating = true;
      contact.uiState.localModifications = data;
    }, state));
  }

  finalizeUpdateContactData(id: number, data: EditableContactData) {
    this.nextState(state => findContactByIdAndDo(id, contact => {
      contact.uiState.isUpdating = false;
      contact.uiState.localModifications = null;
      contact.uiState.updateError = null;
      contact.email = data.email;
      contact.name = data.name;
      contact.phone = data.phone;
    }, state));
  }
  
  finalizeUpdateContactDataWithError(id: number, error: string) {
    this.nextState(state => findContactByIdAndDo(id, contact => {
      contact.uiState.isUpdating = false;
      contact.uiState.updateError = error;
    }, state));
  }

  setIsInitializing(v: boolean) {
    this.nextState(state => state.isInitializing = v);
  }
  
  setContactsAndGroups(contacts: Contact[], groups: Group[]) {
    this.nextState(state => {
      state.groups = groups;
      state.contacts = contacts.map(c => {
        let result: UIContact = {
          id: c.id,
          email: c.email,
          isDeleted: c.isDeleted,
          name: c.name,
          phone: c.phone,
          uiState: {
            isBeingCreated: false,
            isBeingRemoved: false,
            isBeingUnremoved: false,
            isUpdating: false,
            updateError: null
          }
        };
        return result;
      });
    });
  }

  startContactUndoDeletion(id: number) {
    this.nextState(state => findContactByIdAndDo(id, (c, idx) => {
      c.uiState.isBeingUnremoved = true;
    }, state));
  }

  finalizeContactUndoDeletion(id: number) {
    this.nextState(state => findContactByIdAndDo(id, (c, idx) => {
      c.uiState.isBeingUnremoved = false;
      c.isDeleted = false;
    }, state));
  }

  startContactDeletion(id: number) {
    this.nextState(state => findContactByIdAndDo(id, (c, idx) => {
      c.uiState.isBeingRemoved = true;
      c.uiState.updateError = null;
    }, state));
  }

  finalizeContactDeletion(id: number, groups: Group[]) {
    this.nextState(state => {
      findContactByIdAndDo(id, (c, idx) => {
        c.isDeleted = true;
        c.uiState.isBeingRemoved = false;      
      }, state);
      state.groups = groups;
    });
  }

  startContactCreation(contact: EditableContactData): number {
    let tmpId = - Math.floor(Math.random() * 10000000);
    this.nextState(state => {
      let uiContact: UIContact = {
        id: tmpId,
        email: contact.email,
        name: contact.name,
        phone: contact.phone,
        isDeleted: false,
        uiState: {
          isBeingCreated: true,
          isBeingRemoved: false,
          isUpdating: false,
          isBeingUnremoved: false,
          updateError: null
        }
      };
      state.contacts.push(JSON.parse(JSON.stringify(uiContact)));
    });
    return tmpId;
  }

  finalizeContactCreation(tmpId: number, contact: Contact) {
    this.nextState(state => 
      findContactByIdAndDo(tmpId, (c, idx) => {
        state.contacts[idx] = {
          id: contact.id,
          email: contact.email,
          name: contact.name,
          phone: contact.phone,
          isDeleted: contact.isDeleted,
          uiState: {
            isBeingCreated: false,
            isBeingRemoved: false,
            isUpdating: false,
            isBeingUnremoved: false,
            updateError: null
          }
        }
      }, state)
    );
  }

  getState(): AppState {
    return JSON.parse(JSON.stringify(this.state));
  }

  constructor() {
    this.state = {
      isInitializing: false,
      contacts: [],
      groups: []
    };
    this._stateUpdate = new BehaviorSubject<void>(null);
    this.stateUpdate = this._stateUpdate.asObservable();
  }

  private
  state: AppState;
  _stateUpdate: BehaviorSubject<void>;
  nextState(stateModifier: (s: AppState) => void) {
    let newState: AppState = JSON.parse(JSON.stringify(this.state));

    try {
      stateModifier(newState);
      this.state = newState;
    } catch(e) {
      console.error(e);
    }

    this._stateUpdate.next(null);
  }

}

export type AppState = {
  isInitializing: boolean,
  contacts: Array<UIContact>,
  groups: Array<Group>
}

export type UIContact = Contact & {
  uiState: {
    isBeingCreated: boolean
    isBeingRemoved: boolean
    isUpdating: boolean
    isBeingUnremoved: boolean
    localModifications?: EditableContactData
    updateError: string
  }
}

function findContactByIdAndDo(id: number, cb:(c: UIContact, idx: number) => any,  state: AppState) {
  state.contacts.some((c, idx) => {
    if (c.id !== id) return false;
    cb(c, idx);
    return true;
  });
}

function findGroupByIdAndDo(id: number, cb:(c: Group, idx: number) => any,  state: AppState) {
  state.groups.some((c, idx) => {
    if (c.id !== id) return false;
    cb(c, idx);
    return true;
  });
}
