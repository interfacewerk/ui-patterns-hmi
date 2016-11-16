import { OnDestroy, Directive, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { BirdService } from './bird.service';
import { Bird } from './bird';
import { Subscription } from 'rxjs/Subscription';

@Directive({
  selector: '[appAirport]'
})
export class AirportDirective implements OnDestroy {
  @Input() set appAirport(id: string) {
    if (this.subscription) this.subscription();
    this.subscription = this.birdService.registerAirport(id, source => {
      let target: HTMLElement = this.elementRef.nativeElement;
      
      let bird = new Bird(source, this.birdClass);
      
      return bird.flyTo(target, {
        placement: this.landingStripPlacement,
        onTakeOff: () => this.onTakeOff.emit(),
        onLanding: () => this.onLanding.emit(),
        landingDelay: 0
      }).then(() => this.onLanded.emit());
    });
  }

  @Input() birdClass: string = '';
  @Input() landingStripPlacement: string = 'center middle';

  @Output() onLanding = new EventEmitter<void>();
  @Output() onTakeOff = new EventEmitter<void>();
  @Output() onLanded = new EventEmitter<void>();
  
  constructor(private birdService: BirdService, private elementRef: ElementRef) {
    
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription();
  }

  private subscription: () => void;
}
