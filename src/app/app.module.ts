import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
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
import { ContactFormComponent, ContactFormFooter, ContactFormHeader } from './contact-form/contact-form.component';
import { ExportButtonComponent } from './export-button/export-button.component';
import { ExportService } from './export.service';
import { StatefulButtonModule } from 'ng2-stateful-button'
import { Observable } from 'rxjs/Rx';
import { AirportDirective } from './airport.directive'
import { BirdService } from './bird.service';
import { TestComponent } from './test/test.component';
import { ButtonTestComponent } from './button-test/button-test.component';
import { DelayManagerComponent } from './delay-manager/delay-manager.component';

@Injectable()
export class RemovePlaceholder implements Resolve<void> {
  resolve(): Promise<void> {
    return new Promise(resolve => {
      document.getElementById('loading-app-placeholder').remove();
      resolve();
    });
  }
}

@Injectable()
export class InitialResolve implements Resolve<void> {
  constructor(private contactsService: ContactsService, private contactStore: ContactStore) {}

  resolve(): Promise<void> {
    this.contactStore.setIsInitializing(true);
    return new Promise<void>((resolve, reject) => {
      Observable.timer(2000)
      .zip(this.contactsService.listContacts(), this.contactsService.listGroups())
      .subscribe(
        result => {
          this.contactStore.setContactsAndGroups(result[1], result[2]);
          this.contactStore.setIsInitializing(false);
          resolve();
          document.getElementById('loading-app-placeholder').remove();
        },
        () => {
          this.contactStore.setIsInitializing(false);
          reject();
        }
      );
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    ContactsComponent,
    NoContactSelectedComponent,
    NewContactComponent,
    ContactComponent,
    HomeComponent,
    ContactFormComponent,
    ContactFormHeader,
    ContactFormFooter,
    ExportButtonComponent,
    AirportDirective,
    TestComponent,
    ButtonTestComponent,
    DelayManagerComponent
  ],
  imports: [
    StatefulButtonModule,
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
      },
      {
        path: 'test',
        component: TestComponent,
        resolve: {
          removePlaceholder: RemovePlaceholder
        }
      }
    ])
  ],
  providers: [ ContactStore, ContactsService, InitialResolve, ExportService, BirdService, RemovePlaceholder ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor() {}

}
