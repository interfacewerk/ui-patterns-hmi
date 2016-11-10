import { Component, OnInit, ElementRef } from '@angular/core';
import { ExportService } from '../export.service';
import { Bird } from '../bird';

@Component({
  selector: 'app-export-button',
  templateUrl: './export-button.component.html',
  styleUrls: ['./export-button.component.scss']
})
export class ExportButtonComponent implements OnInit {

  constructor(private exportService: ExportService, private elementRef: ElementRef) { }

  ngOnInit() { 
    this.nExports = this.exportService.exportedData.length;

    this.exportService.addedToExport.subscribe(event => {
      let target: HTMLElement = this.elementRef.nativeElement;
      
      this.beReadyToReceive();
      
      let bird = new Bird(event.source, 'export-bird');
      
      bird.flyTo(target).then(() => this.afterReceive());
    });

    window['EXPORT'] = this;
  }

  nExports: number;

  beReadyToReceive() {
    (<HTMLElement>this.elementRef.nativeElement).classList.add('ready-to-receive');
  }

  afterReceive() {
    (<HTMLElement>this.elementRef.nativeElement).classList.remove('ready-to-receive');
    this.nExports = this.exportService.exportedData.length;
  }

}
