import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { ExportService, ExportEvent } from '../export.service';
import { Bird } from '../bird';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss']
})
export class ExportButtonComponent implements OnInit, OnDestroy {

  constructor(private exportService: ExportService, private elementRef: ElementRef) { }

  ngOnInit() {
    this.element = this.elementRef.nativeElement;
    this.nExports = this.exportService.exportedData.length;
    this.subscription = this.exportService.exportEvent.subscribe(event => {
      this.nExports = this.exportService.exportedData.length;
      if (event === ExportEvent.ADD) {
        this.element.classList.remove('highlight-badge');
        setTimeout(() => this.element.classList.add('highlight-badge'), 0);
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  nExports: number;
  element: HTMLElement;
  subscription: Subscription;
}
