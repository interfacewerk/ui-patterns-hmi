export class Bird {
  constructor(
    private start: HTMLElement,
    private customClass: string = ''
  ) {

  }

  flyTo(destination: HTMLElement, options: {
    onTakeOff: () => any,
    onLanding: () => any,
    landingDelay: number
  }): Promise<void> {
    
    let start = getCoords(this.start);
    let end = getCoords(destination);

    let promise = new Promise((resolve) => {
      let airport = document.createElement('div');
      airport.innerHTML = destination.outerHTML;
      airport.classList.add('airport');
      airport.style.left = destination.offsetLeft + 'px';
      airport.style.top = destination.offsetTop + 'px';

      let cloud = document.createElement('div');
      cloud.classList.add('cloud');

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
      document.body.appendChild(cloud);
      document.body.appendChild(airport);

      let onend = () => {
        bird.removeEventListener('transitionend', onend);
        bird.remove();
        cloud.remove();
        airport.remove();
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
        bird.style.left = end.left + 'px';
        bird.style.top = end.top + 'px';
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