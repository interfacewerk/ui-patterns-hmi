import { Component, OnInit } from '@angular/core';
import { ButtonState, delay } from 'ng2-stateful-button';

@Component({
  selector: 'app-button-test',
  templateUrl: './button-test.component.html',
  styleUrls: ['./button-test.component.scss']
})
export class ButtonTestComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  doing: ButtonState = ButtonState.DOING;
  success: ButtonState = ButtonState.SUCCESS;
  idle: ButtonState = ButtonState.IDLE;
  dynamic: ButtonState = ButtonState.IDLE;
  disabled: boolean = false;

  clickMe() {
    this.dynamic = ButtonState.DOING;
    delay(2000)
    .then(() => this.dynamic = ButtonState.SUCCESS)
    .then(() => delay(2000))
    .then(() => this.dynamic = ButtonState.IDLE);
  }

  onSubmit() {
    this.clickMe();
  }
}
