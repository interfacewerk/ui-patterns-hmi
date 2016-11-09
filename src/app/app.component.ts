import { Component, OnInit } from '@angular/core';
import { ContactStore, UIContact } from './store/contacts';
import { ContactsService } from './contacts.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private contactsService: ContactsService, 
    private contactStore: ContactStore
  ) {
    
  }

  ngOnInit() {
  }

}
