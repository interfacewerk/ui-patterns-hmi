import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactStore, UIContact } from '../store/contacts';
import { Group } from '../contacts.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['contacts.component.scss']
})
export class ContactsComponent implements OnInit, OnDestroy {

  noContact: boolean;
  contacts: UIContact[];
  groups: Group[];

  constructor(private contactStore: ContactStore) { }

  ngOnInit() {
    this.subscription = this.contactStore.stateUpdate.subscribe(() => {
      let currentState = this.contactStore.getState();
      this.contacts = currentState.contacts.filter(c => !c.isDeleted || c.uiState.isBeingUnremoved);
      this.noContact = this.contacts.length === 0;
      this.groups = currentState.groups;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private subscription: Subscription;
}
