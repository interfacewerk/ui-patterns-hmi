import { Component, OnInit } from '@angular/core';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService } from '../contacts.service';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {

  constructor(
    private contactsService: ContactsService, 
    private contactStore: ContactStore
  ) {
    
  }

  ngOnInit() {
    this.contactStore.stateUpdate.subscribe(() => {
      let currentState = this.contactStore.getState();
      this.contacts = currentState.contacts;
    });
  }

  contacts: UIContact[];

  addContact() {
    let tmpId = Math.floor(1000000*Math.random());
    this.contactStore.addContact({
      id: tmpId,
      firstName: 'ksdjfh',
      lastName: 'kkjh',
      uiState: {
        isBeingCreated: true,
        isBeingRemoved: false
      }
    });

    this.contactsService.create({
      firstName: 'ksdjfh',
      lastName: 'kkjh'
    })
    .subscribe(
      contact => this.contactStore.updateContactData(tmpId, {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        uiState: {
          isBeingCreated: false,
          isBeingRemoved: false
        }
      }),
      () => alert('ERROR')
     );
  }

  removeContact(contact: UIContact) {
    contact.uiState.isBeingRemoved = true;
    this.contactStore.updateContactData(contact.id, contact);
    this.contactsService.remove(contact.id)
    .subscribe(
      () => this.contactStore.removeContact(contact.id),
      () => alert('ERROR')
    );
    
  }

  nextId() {
    return this.contacts.map(c => c.id).reduce((p, c) => Math.max(p, c), 0) + 1;
  }
}
