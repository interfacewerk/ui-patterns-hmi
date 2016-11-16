export class Bird {
  constructor(
    private start: HTMLElement,
    private customClass: string = ''
  ) {

  }

  flyTo(destination: HTMLElement, options: {
    placement: string,
    onTakeOff: () => any,
    onLanding: () => any,
    landingDelay: number
  }): Promise<void> {
    
    let start = getCoords(this.start);
    let end = getCoords(destination);

    let promise = new Promise((resolve) => {
      // let airport = document.createElement('div');
      // airport.innerHTML = destination.outerHTML;
      // airport.classList.add('airport');
      // airport.style.left = destination.offsetLeft + 'px';
      // airport.style.top = destination.offsetTop + 'px';

      // let cloud = document.createElement('div');
      // cloud.classList.add('cloud');

      let bird = document.createElement('div');
      bird.classList.add('bird');
      if (this.customClass) bird.classList.add(this.customClass);
      bird.style.left = start.left + 'px';
      bird.style.top = start.top + 'px';
      
      try {
        options.onTakeOff && options.onTakeOff();        
      } catch(e) {
        console.error(e);
      }
      
      document.body.appendChild(bird);
      // document.body.appendChild(cloud);
      // document.body.appendChild(airport);

      let onend = () => {
        bird.removeEventListener('transitionend', onend);
        bird.remove();
        // cloud.remove();
        // airport.remove();
        try {
          options.onLanding && options.onLanding();        
        } catch(e) {
          console.error(e);
        }

        setTimeout(() => resolve(), options.landingDelay);
      };
      bird.addEventListener('transitionend', onend);
      setTimeout(() => {
        bird.classList.add('flying');
        let splitPlacement = options.placement.split(' ');
        let placement = {
          horizontal: {
            left: splitPlacement.indexOf('left') > -1,
            center: splitPlacement.indexOf('center') > -1,
            right: splitPlacement.indexOf('right') > -1
          },
          vertical: {
            top: splitPlacement.indexOf('top') > -1,
            middle: splitPlacement.indexOf('middle') > -1,
            bottom: splitPlacement.indexOf('bottom') > -1
          }
        };
        if (placement.horizontal.left) {
          bird.style.left = end.left + 'px';
        } else if (placement.horizontal.center) {
          bird.style.left = end.left + 0.5 * destination.clientWidth + 'px';
        } else if (placement.horizontal.right) {
          bird.style.left = end.left + destination.clientWidth + 'px';
        }
        if (placement.vertical.top) {
          bird.style.top = end.top + 'px';
        } else if (placement.vertical.middle) {
          bird.style.top = end.top + 0.5 * destination.clientHeight + 'px';
        } else if (placement.vertical.bottom) {
          bird.style.top = end.top + destination.clientHeight + 'px';
        }
      }, 200);  
    });
    return promise;

  }
}

function getCoords(elem): { top: number, left: number } { // crossbrowser version
  var box = elem.getBoundingClientRect();

  var body = document.body;
  var docEl = document.documentElement;

  var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
  var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

  var clientTop = docEl.clientTop || body.clientTop || 0;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;

  var top  = box.top +  scrollTop - clientTop;
  var left = box.left + scrollLeft - clientLeft;

  return { top: Math.round(top), left: Math.round(left) };
}