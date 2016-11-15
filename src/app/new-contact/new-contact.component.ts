import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService, EditableContactData } from '../contacts.service';
import { ButtonState } from 'ng2-stateful-button'

@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.component.html',
  styleUrls: ['new-contact.component.scss']
})
export class NewContactComponent implements OnInit {
  newContact: EditableContactData = {
    email: '',
    name: '',
    phone: ''
  };
  isFormValid: boolean;
  createButtonState: ButtonState;

  constructor(
    private contactStore: ContactStore,
    private contactsService: ContactsService,
    private router: Router
  ) {
  }

  ngOnInit() {
    this.createButtonState = ButtonState.NEUTRAL;
  }

  create() {
    let tmpId = this.contactStore.startContactCreation(this.newContact);
    
    this.createButtonState = ButtonState.DOING;

    this.contactsService.create(this.newContact)
    .subscribe(
      c => {
        this.contactStore.finalizeContactCreation(tmpId, c);
        this.router.navigate(['/home/contact', c.id]);
      },
      () => {
        alert('ERROR');
        this.createButtonState = ButtonState.NEUTRAL;
      }
    );
  }

}
