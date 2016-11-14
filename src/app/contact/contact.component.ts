import { Component, OnInit, Renderer } from '@angular/core';
import { Router, ActivatedRoute, Params,  NavigationStart, Event as NavigationEvent } from '@angular/router';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService, EditableContactData, Group } from '../contacts.service';
import { ExportService } from '../export.service';
import { BirdService } from '../bird.service';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/pairwise';


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
  ) {
    this.router.events.pairwise().subscribe((e) => {
      console.log(e);
    });
    router.events
      .filter(event => event instanceof NavigationStart)
      .subscribe((event:NavigationStart) => {
        this.isContentLoading = true;
        setTimeout(()=> {
          this.isContentLoading = false;
        },2000);
         // You only receive NavigationStart events
         // NavigationEnd
          // NavigationCancel
          // NavigationError
          // RoutesRecognized
     });
  }

  ngOnDestroy(){
    console.log("contact comp destroyed");
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
          this.groups = this.contactStore.getState().groups;
          this.isContactInGroup = {};
          this.groups.forEach(group => {
            this.isContactInGroup[group.id] = group.contactIds.indexOf(id) > -1;
          });
        });
      })
      this.isContentLoading = false;
    },2000);
  }

  contact: UIContact;
  model: EditableContactData;
  isFormValid: boolean;
  isContentLoading: boolean;
  groups: Group[];
  isContactInGroup: {
    [groupId: string]: boolean;
  }

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
    this.contactStore.startUpdateContactData(this.contact.id, this.model);

    this.contactsService.update(this.contact.id, this.model).subscribe(
      (c) => this.contactStore.finalizeUpdateContactData(this.contact.id, c),
      () => alert('ERROR')
    );
  }

  delete() {
    this.contactStore.startContactDeletion(this.contact.id);
    this.contactsService.remove(this.contact.id).subscribe(
      () => this.contactStore.finalizeContactDeletion(this.contact.id),
      () => alert('ERROR')
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
