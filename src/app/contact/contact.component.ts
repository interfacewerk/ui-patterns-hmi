import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService } from '../contacts.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private contactStore: ContactStore,
    private contactsService: ContactsService
  ) { }

  ngOnInit() {
    this.contactStore.stateUpdate.subscribe(() => {
      this.activatedRoute.params.forEach(params => {
        let id = +params['id'];
        this.contact = this.contactStore.getState().contacts.filter(c => c.id === id)[0];
      });
    });
  }

  contact: UIContact;

}
