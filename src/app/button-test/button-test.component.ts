import { Component, OnInit } from '@angular/core';
import { ButtonState } from 'ng2-stateful-button';

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
  neutral: ButtonState = ButtonState.NEUTRAL;
  dynamic: ButtonState = ButtonState.NEUTRAL;

  clickMe() {
    this.dynamic = ButtonState.DOING;
    setTimeout(() => {
      this.dynamic = ButtonState.SUCCESS;
      setTimeout(() => {
        this.dynamic = ButtonState.NEUTRAL;
      }, 2000);
    }, 2000);
  }
}
