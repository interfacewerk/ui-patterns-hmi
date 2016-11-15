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
import { ButtonState } from 'ng2-stateful-button'
import { BirdService } from '../bird.service';

@Component({
  selector: 'app-new-contact',
  templateUrl: './new-contact.component.html',
  styleUrls: ['new-contact.component.scss'],
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
export class NewContactComponent implements OnInit {
  @ViewChild('createButton') createButton: ElementRef;

  @HostBinding('@routeAnimation') get routeAnimation() {
    return true;
  }

  @HostBinding('style.display') get display() {
    return 'block';
  }

  @HostBinding('style.position') get position() {
    return 'absolute';
  }

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
    this.createButtonState = ButtonState.NEUTRAL;
  }

  get isFormDisabled(): boolean { return this.createButtonState === ButtonState.DOING; }

  create() {
    this.createButtonState = ButtonState.DOING;

    let tmpId = this.contactStore.startContactCreation(this.newContact);

    setTimeout(() => this.birdService.deliverTo(`contact-airport-${tmpId}`, this.createButton.nativeElement), 0);

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
