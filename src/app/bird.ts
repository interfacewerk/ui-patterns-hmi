export class Bird {
  constructor(
    private start: HTMLElement,
    private customClass: string = ''
  ) {

  }

  flyTo(destination: HTMLElement): Promise<void> {
    let start = {
      top: this.start.offsetTop + 'px',
      left: this.start.offsetLeft + 'px'
    }
    let end = {
      top: destination.offsetTop + 'px',
      left: destination.offsetLeft + 'px'
    };

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
      bird.style.left = String(start.left);
      bird.style.top = String(start.top);
      document.body.appendChild(bird);
      document.body.appendChild(cloud);
      document.body.appendChild(airport);

      let onend = () => {
        bird.removeEventListener('transitionend', onend);
        bird.remove();
        cloud.remove();
        airport.remove();
        resolve();
      };
      bird.addEventListener('transitionend', onend);
      setTimeout(() => {
        bird.classList.add('flying');
        bird.style.left = String(end.left);
        bird.style.top = String(end.top);
      }, 200);  
    });
    return promise;

  }
}
