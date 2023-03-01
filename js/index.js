import { DoubleImageEffect } from './doubleImageEffect.js';

// Lenis smooth scrolling
let lenis;

// Initialize Lenis smooth scrolling
const initSmoothScrolling = () => {
	
    lenis = new Lenis({
        smooth: true
	});

	const scrollFn = (time) => {
		lenis.raf(time);
		requestAnimationFrame(scrollFn);
	};
	
    requestAnimationFrame(scrollFn);

};

[...document.querySelectorAll('.double')].forEach(el => new DoubleImageEffect(el));

// Preload images
imagesLoaded(document.querySelectorAll('.double__img'), {background: true}, () => {
    // Remove loader (loading class)
    document.body.classList.remove('loading');
    // Lenis (smooth scrolling)
    initSmoothScrolling();
});