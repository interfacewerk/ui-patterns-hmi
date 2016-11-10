import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService, EditableContactData } from '../contacts.service';

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

  constructor(
    private contactStore: ContactStore,
    private contactsService: ContactsService,
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  create() {
    let tmpId = this.contactStore.startContactCreation(this.newContact);
    this.contactsService.create(this.newContact)
    .subscribe(
      c => {
        this.contactStore.finalizeContactCreation(tmpId, c);
        this.router.navigate(['/home/contact', c.id]);
      },
      () => alert('ERROR')
    );
  }

}
