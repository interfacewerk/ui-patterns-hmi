import { Component, OnInit, Input, Directive, Output, EventEmitter } from '@angular/core';
import { EditableContactData } from '../contacts.service';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit {
  @Input() model: EditableContactData;
  @Output() onChange = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  $onChange() {
    this.onChange.emit();
  }

}

@Directive({
  selector: 'app-contact-form-header'
})
export class ContactFormHeader {}

@Directive({
  selector: 'app-contact-form-footer'
})
export class ContactFormFooter {}
