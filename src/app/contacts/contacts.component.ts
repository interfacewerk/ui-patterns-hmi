import {
  Component,
  OnInit,
  OnDestroy,
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/core';
import { ContactStore, UIContact } from '../store/contacts';
import { Group } from '../contacts.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['contacts.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0)'})),
      state('out', style({transform: 'translateX(-100%)', display: 'none'})),
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

  constructor(private contactStore: ContactStore) { }

  ngOnInit() {
    this.subscription = this.contactStore.stateUpdate.subscribe(() => {
      let currentState = this.contactStore.getState();
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

  private subscription: Subscription;
}
