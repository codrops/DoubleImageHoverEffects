import { DoubleImageEffect } from './doubleImageEffect.js';

// Lenis smooth scrolling
let lenis;

// Initialize Lenis smooth scrolling
const initSmoothScrolling = () => {

    lenis = new Lenis();

	// Drive Lenis from GSAP's ticker (GSAP's time is in seconds, Lenis' in milliseconds)
	gsap.ticker.add((time) => lenis.raf(time * 1000));
	// Turn off GSAP's lag smoothing, so the scroll never jumps after a slow frame
	gsap.ticker.lagSmoothing(0);

};

// Preload images (an element's background image)
const preloadImages = (selector) => {
    return Promise.all(gsap.utils.toArray(selector).map(el => {
        const img = new Image();
        img.src = getComputedStyle(el).backgroundImage.slice(5, -2);
        // A broken image shouldn't keep the page from showing
        return img.decode().catch(() => {});
    }));
};

document.querySelectorAll('.double').forEach(el => new DoubleImageEffect(el));

// Preload images
preloadImages('.double__img').then(() => {
    // Remove loader (loading class)
    document.body.classList.remove('loading');
    // Lenis (smooth scrolling), but native scrolling for those who prefer reduced motion
    if ( !window.matchMedia('(prefers-reduced-motion: reduce)').matches ) {
        initSmoothScrolling();
    }
});
