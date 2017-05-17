import {
  Component,
  OnInit,
  OnDestroy,
  Renderer,
  ElementRef,
  trigger,
  state,
  style,
  transition,
  animate,
  HostBinding
} from '@angular/core';
import { Router, ActivatedRoute, Params,  NavigationStart, NavigationEnd, Event as NavigationEvent } from '@angular/router';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService, EditableContactData, Group } from '../contacts.service';
import { ExportService } from '../export.service';
import { BirdService } from '../bird.service';
import { StatefulButtonModule, ButtonState, delay } from 'ng2-stateful-button';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/pairwise';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['contact.component.scss']
})
export class ContactComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  contactSubscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private contactStore: ContactStore,
    private contactsService: ContactsService,
    private exportService: ExportService,
    private birdService: BirdService,
    private renderer: Renderer,
    private element: ElementRef
  ) {

    this.subscriptions.push(router.events
      .filter(event => event instanceof NavigationStart)
      .subscribe((event: NavigationStart) => {
        this.onContactOpen();
      })
    );

    this.activatedRoute.params.subscribe()
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
        let id = +params['id'];
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
  isFormDisabled: boolean = false;
  isFormDisplayed: boolean = true;
  updateError: string;

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
    let contactId = this.contact.id;
    this.contactStore.startUpdateContactData(contactId, this.model);
    delay(500).then(() => {
      let request = this.contactsService.update(contactId, this.model).share();

      request
        .filter(c => !!c.error)
        .subscribe(c => this.contactStore.finalizeUpdateContactDataWithError(contactId, c.error));

      request
        .filter(c => !c.error)
        .subscribe(c => this.contactStore.finalizeUpdateContactData(contactId, c.contact));

      this.contactSubscriptions.push(
        request
          .filter(c => !!c.error)
          .map(c => this.saveButtonState = ButtonState.FAILURE)
          .delay(2000)
          .subscribe(c => this.saveButtonState = ButtonState.IDLE),
        request
          .filter(c => !c.error)
          .map(c => this.saveButtonState = ButtonState.SUCCESS)
          .delay(2000)
          .subscribe(c => this.saveButtonState = ButtonState.IDLE)
      );
    });
  }

  delete() {
    this.deleteButtonState = ButtonState.DOING;
    let contactId = this.contact.id;
    this.contactStore.startContactDeletion(contactId);
    delay(500).then(() => {
      let request = this.contactsService.remove(contactId).share();

      this.contactSubscriptions.push(
        request.subscribe(c => this.deleteButtonState = ButtonState.IDLE)
      );

      request
        .subscribe(r => this.contactStore.finalizeContactDeletion(contactId, r.data.groups))
    });
  }

  restore() {
    this.restoreButtonState = ButtonState.DOING;
    let contactId = this.contact.id;
    this.contactStore.startContactUndoDeletion(contactId);
    delay(500).then(() => {
      let request = this.contactsService.undoRemove(contactId);

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
