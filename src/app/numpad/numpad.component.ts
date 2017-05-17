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


  @Output() dataChanged = new EventEmitter();
  // @Output() onChange = new EventEmitter<void>();
  // @Output() onValid = new EventEmitter<boolean>();
  // @Output() onSubmit = new EventEmitter<EditableContactData>();

  public displayValue:string;
  public statusGood:boolean;
  constructor(private renderer: Renderer, private element: ElementRef) {


  }

  @Input()
  set startData(value) {
    this.displayValue = value? value.toString() : '30';
    this.validateValue();
  }

  addDigit(digit:string){
    this.displayValue = this.displayValue + digit;
    this.validateValue();
  }

  deleteDigit(){
    this.displayValue = this.displayValue.substring(0, this.displayValue.length - 1);
    this.validateValue();
  }

  setMin(){
    this.displayValue = "30";
    this.validateValue();

  }

  setMax(){
    this.displayValue = "80";
    this.validateValue();

  }

  pushIt(){
    this.dataChanged.emit(Number(this.displayValue));
  }

  validateValue(){
    let a = Number(this.displayValue);
    if(a < 30 || a > 80){
      this.statusGood=false;
    }
    else{
      this.statusGood=true;
    }
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
  }

  ngOnInit() {
  }


}
