import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Group } from '../contacts.service';
import { ContactStore, UIContact } from '../store/contacts';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['contacts.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      state('out', style({ transform: 'translateX(-100%)', display: 'none' })),
      transition('in => out', [
        animate(500)
      ])
    ])
  ]
})
export class ContactsComponent implements OnInit, OnDestroy {

  noContact: boolean;
  contacts: UIContact[];
  groups: Group[];

  private subscription: Subscription;

  constructor(private contactStore: ContactStore) { }

  ngOnInit() {
    this.subscription = this.contactStore.stateUpdate.subscribe(() => {
      const currentState = this.contactStore.getState();
      this.contacts = currentState.contacts;
      this.noContact = this.contacts.length === 0;
      this.groups = currentState.groups;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  trackById(contact: UIContact) {
    return contact.id;
  }

}
