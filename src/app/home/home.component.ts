import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
  shouldDisplayModal: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  @HostListener('document:keydown', ['$event'])
  displayModal($event: KeyboardEvent) {
    if ($event.key === 'e' && $event.ctrlKey) {
      this.shouldDisplayModal = true;
    }
  }

}
