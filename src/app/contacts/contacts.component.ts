import { Component, OnInit } from '@angular/core';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService, Group } from '../contacts.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['contacts.component.scss']
})
export class ContactsComponent implements OnInit {

  noContact: boolean;
  contacts: UIContact[];
  groups: Group[];

  constructor(
    private contactsService: ContactsService, 
    private contactStore: ContactStore,
    private activatedRoute: ActivatedRoute
  ) {
    
  }

  ngOnInit() {
    this.contactStore.stateUpdate.subscribe(() => {
      let currentState = this.contactStore.getState();
      this.contacts = currentState.contacts.filter(c => !c.isDeleted);
      this.noContact = this.contacts.length === 0;
      this.groups = currentState.groups;
    });
  }
}
