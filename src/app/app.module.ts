import { Injectable, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Resolve, RouterModule } from '@angular/router';
import { StatefulButtonModule } from 'ng2-stateful-button';
import { timer } from 'rxjs';
import { zip } from 'rxjs/operators';
import { AirportDirective } from './airport.directive';
import { AppComponent } from './app.component';
import { BirdService } from './bird.service';
import { ButtonTestComponent } from './button-test/button-test.component';
import { ContactFormComponent, ContactFormFooterDirective, ContactFormHeaderDirective } from './contact-form/contact-form.component';
import { ContactComponent } from './contact/contact.component';
import { ContactsService } from './contacts.service';
import { ContactsComponent } from './contacts/contacts.component';
import { DelayManagerComponent } from './delay-manager/delay-manager.component';
import { Draggable } from './draggable';
import { ExportButtonComponent } from './export-button/export-button.component';
import { ExportService } from './export.service';
import { HomeComponent } from './home/home.component';
import { NewContactComponent } from './new-contact/new-contact.component';
import { NoContactSelectedComponent } from './no-contact-selected/no-contact-selected.component';
import { NumpadComponent } from './numpad/numpad.component';
import { ContactStore } from './store/contacts';
import { TestComponent } from './test/test.component';


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
  constructor(private contactsService: ContactsService, private contactStore: ContactStore) { }

  resolve(): Promise<void> {
    this.contactStore.setIsInitializing(true);
    return new Promise<void>((resolve, reject) => {
      timer(3000)
        .pipe(
          zip(this.contactsService.listContacts(), this.contactsService.listGroups())
        )
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
    NumpadComponent,
    Draggable,
    ContactFormHeaderDirective,
    ContactFormFooterDirective,
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
    BrowserAnimationsModule,
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
  providers: [ContactStore, ContactsService, InitialResolve, ExportService, BirdService, RemovePlaceholder],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor() { }

}
