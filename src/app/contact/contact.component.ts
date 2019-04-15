import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { ButtonState, delay } from 'ng2-stateful-button';
import { Subscription } from 'rxjs';
import { filter, map, share, delay as rxDelay } from 'rxjs/operators';
import { BirdService } from '../bird.service';
import { ContactsService, EditableContactData, Group } from '../contacts.service';
import { ContactStore, UIContact } from '../store/contacts';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  contactSubscriptions: Subscription[] = [];
  contact: UIContact;
  model: EditableContactData;
  isFormValid: boolean;
  groups: Group[];
  isContactInGroup: {
    [groupId: string]: boolean;
  };
  hasModifications: boolean;
  deleteButtonState: ButtonState = ButtonState.IDLE;
  saveButtonState: ButtonState = ButtonState.IDLE;
  restoreButtonState: ButtonState = ButtonState.IDLE;
  isFormDisabled = false;
  isFormDisplayed = true;
  updateError: string;

  constructor(
    router: Router,
    private activatedRoute: ActivatedRoute,
    private contactStore: ContactStore,
    private contactsService: ContactsService,
    private birdService: BirdService
  ) {

    this.subscriptions.push(router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.onContactOpen();
      })
    );

    this.activatedRoute.params.subscribe();
  }

  // this is kind of our ngOnInit hook here:
  // the ng-router reuses the component…
  onContactOpen() {
    this.contactSubscriptions.forEach(s => s.unsubscribe());
    this.contactSubscriptions = [];

    this.saveButtonState = ButtonState.IDLE;
    this.deleteButtonState = ButtonState.IDLE;
    this.restoreButtonState = ButtonState.IDLE;

    this.contactSubscriptions.push(this.contactStore.stateUpdate.subscribe(() => {
      this.activatedRoute.params.forEach(params => {
        const id = +params['id'];
        this.contact = this.contactStore.getState().contacts.filter(c => c.id === id)[0];
        this.model = this.contact.uiState.localModifications || {
          email: this.contact.email,
          name: this.contact.name,
          phone: this.contact.phone,
          drilling: this.contact.drilling
        };

        this.updateError = this.contact.uiState.updateError;
        this.isFormDisplayed = !this.contact.isDeleted;
        this.isFormDisabled = this.contact.uiState.isUpdating || this.contact.uiState.isBeingRemoved || this.contact.isDeleted;
        this.groups = this.contactStore.getState().groups;
        this.isContactInGroup = {};
        this.groups.forEach(group => {
          this.isContactInGroup[group.id] = group.contactIds.indexOf(id) > -1;
        });
        this.hasModifications = !!this.contact.uiState.localModifications;
      });
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.contactSubscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit() {
    this.onContactOpen();
  }

  toggleContactInGroup(group: Group) {
    if (this.isContactInGroup[group.id]) {
      const target = <HTMLElement>document.querySelector(`[group-checkbox-id="${group.id}"]`);

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
    const contactId = this.contact.id;
    this.contactStore.startUpdateContactData(contactId, this.model);
    delay(500).then(() => {
      const request = this.contactsService.update(contactId, this.model).pipe(share());

      request
        .pipe(filter(c => !!c.error))
        .subscribe(c => this.contactStore.finalizeUpdateContactDataWithError(contactId, c.error));

      request
        .pipe(filter(c => !c.error))
        .subscribe(c => this.contactStore.finalizeUpdateContactData(contactId, c.contact));

      this.contactSubscriptions.push(
        request
          .pipe(
            filter(c => !!c.error),
            map(() => this.saveButtonState = ButtonState.FAILURE),
            rxDelay(2000)
          )
          .subscribe(() => this.saveButtonState = ButtonState.IDLE),
        request
          .pipe(
            filter(c => !c.error),
            map(() => this.saveButtonState = ButtonState.SUCCESS),
            rxDelay(2000)
          )
          .subscribe(() => this.saveButtonState = ButtonState.IDLE)
      );
    });
  }

  delete() {
    this.deleteButtonState = ButtonState.DOING;
    const contactId = this.contact.id;
    this.contactStore.startContactDeletion(contactId);
    delay(500).then(() => {
      const request = this.contactsService.remove(contactId).pipe(share());

      this.contactSubscriptions.push(
        request.subscribe(() => this.deleteButtonState = ButtonState.IDLE)
      );

      request
        .subscribe((r: any) => this.contactStore.finalizeContactDeletion(contactId, r.data.groups));
    });
  }

  restore() {
    this.restoreButtonState = ButtonState.DOING;
    const contactId = this.contact.id;
    this.contactStore.startContactUndoDeletion(contactId);
    delay(500).then(() => {
      const request = this.contactsService.undoRemove(contactId);

      request
        .subscribe(() => this.contactStore.finalizeContactUndoDeletion(contactId));

      this.contactSubscriptions.push(
        request.subscribe(() => this.restoreButtonState = ButtonState.IDLE)
      );
    });
  }

  // export($event: MouseEvent) {
  //   $event.preventDefault();
  //   this.birdService.deliverTo('export-airport', <HTMLElement>$event.target)
  //   .then(() => this.exportService.addToExport(this.contact));
  // }

}
