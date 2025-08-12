import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TurfService } from '../../services/turf.service';
import { ElementRef } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import lottie from 'lottie-web';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-turf-list',
  templateUrl: './turf-list.component.html',
  styleUrls: ['./turf-list.component.css']
})
export class TurfListComponent implements OnInit {
  turfs$!: Observable<any[]>;

  constructor(
    public turfService: TurfService,
    private el: ElementRef
  ) { }

  ngOnInit(): void {
    this.turfs$ = this.turfService.getVisibleTurfs();
  }

  ngAfterViewInit(): void {
    this.animateHeading();
    this.animateSubtext();
    this.initLottieAnimations();
  }

  initLottieAnimations(): void {
    const leftAnim = lottie.loadAnimation({
      container: this.el.nativeElement.querySelector('#lottie-left'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/Soccer Ball.json' 
    });

    const rightAnim = lottie.loadAnimation({
      container: this.el.nativeElement.querySelector('#lottie-right'),
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'assets/Soccer Ball.json'
    });
     gsap.fromTo(
      ['#lottie-left', '#lottie-right'],
      { opacity: 0.8, y: 0 },
      {
        opacity: 0.9,
        y: 50,
        scrollTrigger: {
          trigger: '.container',
          start: 'top top',
          end: 'bottom bottom',
          scrub: true
        }
      }
    );
  }

  animateHeading(): void {
  const heading = this.el.nativeElement.querySelector('#split-heading');
  const text = heading.textContent.trim();
  heading.textContent = '';

  [...text].forEach(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char; // non-breaking space for real spacing
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    span.style.transform = 'translateY(30px)';
    heading.appendChild(span);
  });

  gsap.to(heading.querySelectorAll('span'), {
    opacity: 1,
    y: 0,
    stagger: 0.05,
    duration: 0.5,
    ease: 'power2.out'
  });
}

   animateSubtext(): void {
  const subtext = this.el.nativeElement.querySelector('#split-subtext');
  const words = subtext.textContent.trim().split(' ');
  subtext.textContent = '';

  words.forEach((word: string) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline-block';
    span.style.marginRight = '0.5ch'; // visually separates words
    span.style.opacity = '0';
    span.style.transform = 'translateY(20px)';
    subtext.appendChild(span);
  });

  gsap.to(subtext.querySelectorAll('span'), {
    opacity: 1,
    y: 0,
    stagger: 0.08,
    duration: 0.4,
    ease: 'power2.out'
  });
}
}