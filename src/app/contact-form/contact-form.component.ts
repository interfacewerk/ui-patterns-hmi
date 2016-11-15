import {
  OnDestroy,
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Directive,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Renderer,
  HostBinding
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { EditableContactData } from '../contacts.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @Input() model: EditableContactData;
  @HostBinding('class.disabled') @Input() formDisabled: boolean;

  @Output() onChange = new EventEmitter<void>();
  @Output() onValid = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<EditableContactData>();
  @ViewChild(NgForm) contactForm: NgForm;

  constructor(private renderer: Renderer, private element: ElementRef) { }

  ngAfterViewInit() {
    this.valueChanges = this.contactForm.valueChanges.subscribe(() => {
      this.onValid.emit(this.contactForm.valid);
    });
  }

  ngOnDestroy() {
    this.valueChanges.unsubscribe();
  }

  ngOnInit() {
  }

  $onChange() {
    this.onChange.emit();
  }

  $onSubmit() {
    this.onSubmit.emit(this.model);
  }

  private
  valueChanges: Subscription;

}

@Directive({
  selector: 'app-contact-form-header'
})
export class ContactFormHeader {}

@Directive({
  selector: 'app-contact-form-footer'
})
export class ContactFormFooter {}
