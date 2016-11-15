import { Component, OnInit, Renderer } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService, EditableContactData, Group } from '../contacts.service';
import { ExportService } from '../export.service';
import { BirdService } from '../bird.service';
import { StatefulButtonModule, ButtonState, delay } from 'ng2-stateful-button';

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
    private contactsService: ContactsService,
    private exportService: ExportService,
    private birdService: BirdService,
    private renderer: Renderer
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
        this.groups = this.contactStore.getState().groups;
        this.isContactInGroup = {};
        this.groups.forEach(group => {
          this.isContactInGroup[group.id] = group.contactIds.indexOf(id) > -1;
        });
        this.hasModifications = !!this.contact.uiState.localModifications;
      });
    });
  }

  contact: UIContact;
  model: EditableContactData;
  isFormValid: boolean;
  groups: Group[];
  isContactInGroup: {
    [groupId: string]: boolean;
  };
  hasModifications: boolean;
  deleteButtonState: ButtonState = ButtonState.NEUTRAL;
  saveButtonState: ButtonState = ButtonState.NEUTRAL;

  toggleContactInGroup(group: Group) {
    if (this.isContactInGroup[group.id]) {
      let target = <HTMLElement>document.querySelector(`[group-checkbox-id="${group.id}"]`);

      this.contactsService.addContactToGroup({
        contactId: this.contact.id,
        groupId: group.id
      }).subscribe(g => {
        this.birdService.deliverTo('group-' + group.id, target)
        .then(() => this.contactStore.setGroupData(group.id, g));
      });
    } else {
      this.contactsService.removeContactFromGroup({
        contactId: this.contact.id,
        groupId: group.id
      })
      .subscribe(
        g => this.contactStore.setGroupData(group.id, g)
      );
    }
  }

  onModelChange() {
    this.contactStore.setLocalModifications(this.contact.id, this.model);
  }

  revert() {
    this.contactStore.removeLocalModifications(this.contact.id);
  }

  save() {
    this.saveButtonState = ButtonState.DOING;    
    this.contactStore.startUpdateContactData(this.contact.id, this.model);
    delay(1000).then(() => this.contactsService.update(this.contact.id, this.model)
      .subscribe(
        c => {
          this.saveButtonState = ButtonState.SUCCESS;
          this.contactStore.finalizeUpdateContactData(this.contact.id, c);
          delay(2000).then(() => this.saveButtonState = ButtonState.NEUTRAL);
        },
        () => {
          alert('ERROR');
          this.saveButtonState = ButtonState.NEUTRAL;
        }
      )
    );
  }

  delete() {
    this.deleteButtonState = ButtonState.DOING;
    this.contactStore.startContactDeletion(this.contact.id);
    delay(1000).then(() => this.contactsService.remove(this.contact.id)
      .subscribe(
        () => {
          this.deleteButtonState = ButtonState.NEUTRAL;
          this.contactStore.finalizeContactDeletion(this.contact.id);
        },
        () => alert('ERROR')
      )
    );
    
  }

  undoDelete() {
    this.contactStore.startContactUndoDeletion(this.contact.id);
    this.contactsService.undoRemove(this.contact.id).subscribe(
      () => this.contactStore.finalizeContactUndoDeletion(this.contact.id),
      () => alert('ERROR')
    );
  }

  export($event: MouseEvent) {
    $event.preventDefault();
    this.birdService.deliverTo('export-airport', <HTMLElement>$event.target)
    .then(() => this.exportService.addToExport(this.contact));
  }

}
