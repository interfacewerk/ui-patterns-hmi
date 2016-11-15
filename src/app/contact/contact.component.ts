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
  styleUrls: ['contact.component.scss'],
  animations: [
    trigger('routeAnimation', [
      state('*',
        style({
          opacity: 1,
          transform: 'translateX(0) scale(1)'
        })
      ),
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(-100%) scale(0.5)'
        }),
        animate('0.5s ease-in')
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({
          opacity: 0,
          transform: 'translateX(-100%)'
        }))
      ])
    ])
  ]
})
export class ContactComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  @HostBinding('@routeAnimation') get routeAnimation() {
    return true;
  }

  @HostBinding('style.display') get display() {
    return 'block';
  }

  @HostBinding('style.position') get position() {
    return 'absolute';
  }

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
    this.subscriptions.push(this.router.events.pairwise().subscribe((e) => {
      // console.log(e);
    }));

    this.subscriptions.push(router.events
      .filter(event => event instanceof NavigationEnd)
      .subscribe((event: NavigationEnd) => {
        this.isContentLoading = true;
        setTimeout(()=> {
          this.isContentLoading = false;
        }, 2000);
      }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnInit() {
    this.isContentLoading = true;
    setTimeout(() => {
      this.contactStore.stateUpdate.subscribe(() => {
        this.activatedRoute.params.forEach(params => {
          let id = +params['id'];
          this.contact = this.contactStore.getState().contacts.filter(c => c.id === id)[0];
          this.model = this.contact.uiState.localModifications || {
            email: this.contact.email,
            name: this.contact.name,
            phone: this.contact.phone
          };
          this.updateError = this.contact.uiState.updateError;
          this.isFormDisplayed = !this.contact.isDeleted;
          this.isFormDisabled = this.contact.uiState.isUpdating || this.contact.uiState.isBeingRemoved || this.contact.isDeleted;          
          this.groups = this.contactStore.getState().groups;
          this.isContactInGroup = {};
          this.groups.forEach(group => {
            this.isContactInGroup[group.id] = group.contactIds.indexOf(id) > -1;
          });
        });
        this.hasModifications = !!this.contact.uiState.localModifications;
      })
      this.isContentLoading = false;
    }, 2000);
  }

  contact: UIContact;
  model: EditableContactData;
  isFormValid: boolean;
  isContentLoading: boolean;
  groups: Group[];
  isContactInGroup: {
    [groupId: string]: boolean;
  };
  hasModifications: boolean;
  deleteButtonState: ButtonState = ButtonState.NEUTRAL;
  saveButtonState: ButtonState = ButtonState.NEUTRAL;
  restoreButtonState: ButtonState = ButtonState.NEUTRAL;
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
    this.contactStore.startUpdateContactData(this.contact.id, this.model);
    delay(500).then(() => this.contactsService.update(this.contact.id, this.model)
      .subscribe(c => {
        if (c.error) {
          this.saveButtonState = ButtonState.NEUTRAL;
          this.contactStore.finalizeUpdateContactDataWithError(this.contact.id, c.error);
        } else {
          this.saveButtonState = ButtonState.SUCCESS;
          this.contactStore.finalizeUpdateContactData(this.contact.id, c.contact);
          delay(2000).then(() => this.saveButtonState = ButtonState.NEUTRAL);
        }
      })
    );
  }

  delete() {
    this.deleteButtonState = ButtonState.DOING;
    let contactId = this.contact.id;
    this.contactStore.startContactDeletion(contactId);
    delay(500).then(() => this.contactsService.remove(contactId)
      .subscribe(
        (r) => {
          this.deleteButtonState = ButtonState.NEUTRAL;
          this.contactStore.finalizeContactDeletion(contactId, r.data.groups);
        },
        () => alert('ERROR')
      )
    );
    
  }

  restore() {
    this.restoreButtonState = ButtonState.DOING;
    this.contactStore.startContactUndoDeletion(this.contact.id);
    delay(500).then(() => this.contactsService.undoRemove(this.contact.id).subscribe(
      () => {
        this.restoreButtonState = ButtonState.NEUTRAL;        
        this.contactStore.finalizeContactUndoDeletion(this.contact.id);
      },
      () => {
        this.restoreButtonState = ButtonState.NEUTRAL;
        alert('ERROR')
      }
    ));
  }

  // export($event: MouseEvent) {
  //   $event.preventDefault();
  //   this.birdService.deliverTo('export-airport', <HTMLElement>$event.target)
  //   .then(() => this.exportService.addToExport(this.contact));
  // }

}
