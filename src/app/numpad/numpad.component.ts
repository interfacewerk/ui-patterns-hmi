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
import { Observable } from 'rxjs/Observable';


@Component({
  selector: 'numpad',
  templateUrl: './numpad.component.html',
  styleUrls: ['./numpad.component.scss']
})
export class NumpadComponent implements OnInit, AfterViewInit, OnDestroy {


  @Output() onChange = new EventEmitter<void>();
  @Output() onValid = new EventEmitter<boolean>();
  @Output() onSubmit = new EventEmitter<EditableContactData>();

  constructor(private renderer: Renderer, private element: ElementRef) {


  }


  ngAfterViewInit() {



  }

  ngOnDestroy() {
  }

  ngOnInit() {
  }

  $onChange() {

  }



  $onSubmit() {
  }
}
