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

    // this.exportService.addedToExport.subscribe(event => {
    //   let target: HTMLElement = this.elementRef.nativeElement;
      
    //   let bird = new Bird(event.source, 'export-bird');
      
    //   bird.flyTo(target, {
    //     onTakeOff: () => this.beReadyToReceive(),
    //     onLanding: () => this.receive(),
    //     landingDelay: 1000
    //   }).then(() => this.afterReceive());
    // });
  }

  nExports: number;

  onLanding() {
    (<HTMLElement>this.elementRef.nativeElement).classList.add('receive');
    this.nExports = this.exportService.exportedData.length;
  }

  onTakeOff() {
    (<HTMLElement>this.elementRef.nativeElement).classList.add('ready-to-receive');
  }

  onLanded() {
    (<HTMLElement>this.elementRef.nativeElement).classList.remove('ready-to-receive');
    (<HTMLElement>this.elementRef.nativeElement).classList.remove('receive');
  }

}



// RECEIVER HAS THREE STATES:
// * NEUTRAL
// * READY_TO_RECEIVE
// * RECEIVED