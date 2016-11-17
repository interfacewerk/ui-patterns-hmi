import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  trigger,
  state,
  style,
  transition,
  animate,
  HostBinding
} from '@angular/core';
import { Router } from '@angular/router';
import { ContactStore, UIContact } from '../store/contacts';
import { ContactsService, EditableContactData } from '../contacts.service';
import { ButtonState, delay } from 'ng2-stateful-button'
import { BirdService } from '../bird.service';

@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.component.html',
  styleUrls: ['new-contact.component.scss']
})
export class NewContactComponent implements OnInit {
  @ViewChild('createButton') createButton: ElementRef;

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
    private router: Router,
    private birdService: BirdService
  ) {
  }

  ngOnInit() {
    this.createButtonState = ButtonState.IDLE;
  }

  isFormDisabled: boolean = false;

  create() {
    this.createButtonState = ButtonState.DOING;
    this.isFormDisabled = true;

    let selectedDelay = this.contactStore.getState().selectedCreateContactDelay;

    let tmpId = this.contactStore.startContactCreation(this.newContact);

    setTimeout(() => this.birdService.deliverTo(`contact-airport-${tmpId}`, this.createButton.nativeElement), 0);

    delay(selectedDelay).then(() => this.contactsService.create(this.newContact)
    .subscribe(
      c => {    
        this.contactStore.finalizeContactCreation(tmpId, c);
        this.createButtonState = ButtonState.SUCCESS;
        delay(1000).then(() => this.router.navigate(['/home/contact', c.id]));
      },
      () => {
        alert('ERROR');
        this.isFormDisabled = true;
        this.createButtonState = ButtonState.IDLE;
      }
    ));
  }

}
