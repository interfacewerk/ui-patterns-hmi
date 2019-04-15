import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExportEvent, ExportService } from '../export.service';

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss']
})
export class ExportButtonComponent implements OnInit, OnDestroy {

  nExports: number;
  element: HTMLElement;
  subscription: Subscription;

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
}
