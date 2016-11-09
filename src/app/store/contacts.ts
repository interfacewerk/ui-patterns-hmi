import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Contact } from '../contacts.service';

@Injectable()
export class ContactStore {
  public
  stateUpdate: Observable<void>;

  setIsInitializing(v: boolean) {
    this.nextState(state => state.isInitializing = v);
  }

  setContacts(contacts: UIContact[]) {
    this.nextState(state => {
      state.contacts = contacts;
    });
  }

  addContact(contact: UIContact) {
    this.nextState(state => {
      state.contacts.push(JSON.parse(JSON.stringify(contact)));
    });
  }

  updateContactData(id: number, data: UIContact) {
    this.nextState(state => {
      state.contacts.some(s => {
        if (s.id === id) {
          for(let p in data) {
            s[p] = data[p];
          }
          return true;
        }
      });
    });
  }

  removeContact(id: number) {
    this.nextState(state => {
      for(let i = 0; i < state.contacts.length; i++) {
        if (state.contacts[i].id === id) {
          state.contacts.splice(i, 1);
          return;
        } 
      }
    });
  }
  
  getState(): AppState {
    return JSON.parse(JSON.stringify(this.state));
  }

  constructor() {
    this.state = {
      isInitializing: false,
      contacts: []
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
  contacts: Array<UIContact>
}

export type UIContact = {
  id: number
  firstName: string
  lastName: string,
  uiState: {
    isBeingCreated: boolean
    isBeingRemoved: boolean
  }
}