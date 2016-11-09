import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Resolve }   from '@angular/router';

import { AppComponent } from './app.component';
import { ContactStore } from './store/contacts';
import { ContactsService } from './contacts.service';
import { ContactsComponent } from './contacts/contacts.component';
import { NoContactSelectedComponent } from './no-contact-selected/no-contact-selected.component';
import { NewContactComponent } from './new-contact/new-contact.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';

@Injectable()
export class InitialResolve implements Resolve<void> {
  constructor(private contactsService: ContactsService, private contactStore: ContactStore) {}
  
  resolve(): Promise<void> {
    this.contactStore.setIsInitializing(true);
    let pr = new Promise<void>((resolve, reject) => {
      this.contactsService.list().subscribe(
        (contacts) => {
          this.contactStore.setContacts(contacts.map(c => {
            return {
              id: c.id,
              firstName: c.firstName,
              lastName: c.lastName,
              uiState: {
                isBeingCreated: false,
                isBeingRemoved: false
              }
            };
          }));
          this.contactStore.setIsInitializing(false);
          resolve();     
        }, 
        () => {
          this.contactStore.setIsInitializing(false);
          reject();
        }
      );
    });
    return pr;
  }
}

@NgModule({
  declarations: [
    AppComponent,
    ContactsComponent,
    NoContactSelectedComponent,
    NewContactComponent,
    ContactComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: HomeComponent,
        resolve: {
          isInitialized: InitialResolve
        },
        children: [
          {
            path: '',
            component: NoContactSelectedComponent
          },
          {
            path: 'new',
            component: NewContactComponent
          },
          {
            path: 'contact/:id',
            component: ContactComponent
          }
        ]
      }
    ])
  ],
  providers: [ ContactStore, ContactsService, InitialResolve ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor() {}

}
