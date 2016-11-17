import { Component, OnInit } from '@angular/core';
import { ContactStore } from '../store/contacts';

@Component({
  selector: 'app-delay-manager',
  templateUrl: './delay-manager.component.html',
  styleUrls: ['./delay-manager.component.scss']
})
export class DelayManagerComponent implements OnInit {

  constructor(private store: ContactStore) {

  }

  ngOnInit() {
    this.store.stateUpdate.subscribe(() => {
      let state = this.store.getState();
      this.delays = state.createContactDelays;
      this.selectedDelay = state.selectedCreateContactDelay;
    });
  }

  onDelayChange() {
    this.store.setCreateContactDelay(this.selectedDelay);
  }
  
  selectedDelay: number;

  delays = [{
    text: 'No delay',
    value: 0,
  }, {
    text: 'Optimal delay',
    value: 1000
  }, {
    text: 'Long delay',
    value: 5000
  }];

}
