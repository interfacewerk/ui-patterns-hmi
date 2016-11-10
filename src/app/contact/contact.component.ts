import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService, EditableContactData } from '../contacts.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['contact.component.scss']
})
export class ContactComponent implements OnInit {

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private contactStore: ContactStore,
    private contactsService: ContactsService
  ) { }

  ngOnInit() {
    this.contactStore.stateUpdate.subscribe(() => {
      this.activatedRoute.params.forEach(params => {
        let id = +params['id'];
        this.contact = this.contactStore.getState().contacts.filter(c => c.id === id)[0];
        this.model = this.contact.uiState.localModifications || {
          email: this.contact.email,
          name: this.contact.name,
          phone: this.contact.phone
        };
      });
    });
  }

  contact: UIContact;
  model: EditableContactData;
  
  onModelChange() {
    this.contactStore.setLocalModifications(this.contact.id, this.model);
  }

  revert() {
    this.contactStore.removeLocalModifications(this.contact.id);
  }

  save() {
    this.contactStore.startUpdateContactData(this.contact.id, this.model);

    this.contactsService.update(this.contact.id, this.model).subscribe(
      (c) => this.contactStore.finalizeUpdateContactData(this.contact.id, c),
      () => alert('ERROR')
    );
  }

  delete() {
    this.contactStore.startContactDeletion(this.contact.id);
    this.contactsService.remove(this.contact.id).subscribe(
      () => {
        this.contactStore.finalizeContactDeletion(this.contact.id);
      },
      () => alert('ERROR')
    );
  }

  undoDelete() {
    this.contactStore.startContactUndoDeletion(this.contact.id);
    this.contactsService.undoRemove(this.contact.id).subscribe(
      () => {
        this.contactStore.finalizeContactUndoDeletion(this.contact.id);        
      },
      () => alert('ERROR')
    );
  }

  cancel() {

  }

}
