import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'numpad',
  templateUrl: './numpad.component.html',
  styleUrls: ['./numpad.component.scss']
})
export class NumpadComponent {


  @Output() dataChanged = new EventEmitter();

  displayValue: string;
  statusGood: boolean;

  @Input()
  set startData(value: string) {
    this.displayValue = value ? value.toString() : '30';
    this.validateValue();
  }

  addDigit(digit: string) {
    this.displayValue = this.displayValue + digit;
    this.validateValue();
  }

  deleteDigit() {
    this.displayValue = this.displayValue.substring(0, this.displayValue.length - 1);
    this.validateValue();
  }

  setMin() {
    this.displayValue = '30';
    this.validateValue();

  }

  setMax() {
    this.displayValue = '80';
    this.validateValue();

  }

  pushIt() {
    this.dataChanged.emit(Number(this.displayValue));
  }

  validateValue() {
    const a = Number(this.displayValue);
    if (a < 30 || a > 80) {
      this.statusGood = false;
    } else {
      this.statusGood = true;
    }
  }

}
