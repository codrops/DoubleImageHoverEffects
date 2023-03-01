
export class Fx7 {
    DOM = {
        el: null,
        bottom: null,
        top: null
    }
    constructor(DOM_el) {
        this.DOM.el = DOM_el;
        this.layout();
    }
    layout() {
        /*
        this
        <div class="double" style="background-image:[url]"></div>

        becomes
        <div class="double">
            <div class="double__img" style="background-image:[url]"></div>
            <div class="double__img" style="background-image:[url]"></div>
        </div>
        */
        
        // get element background-image url
        const url = getComputedStyle(this.DOM.el).backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];
        gsap.set(this.DOM.el, {backgroundImage: 'none'});

        const iterations = 2;
        let innerHTML = '';
        for (let i = 0; i < iterations; ++i) {
            innerHTML += `<div class="double__img" style="background-image:url(${url})"></div>`;
        }
        this.DOM.el.innerHTML = innerHTML;

        this.DOM.bottom = this.DOM.el.querySelector('.double__img:first-child');
        this.DOM.top = this.DOM.el.querySelector('.double__img:last-child');
    }
    mouseenter() {

        if ( this.leaveTimeout ) {
            this.leaveTimeout.kill();
        }

        this.enterTimeout = gsap.timeline({
            defaults: {
                duration: 0.8,
                ease: 'expo',
            },
        })
        .set(this.DOM.bottom, {willChange: 'filter', transformOrigin: '50% 50%'})
        .set(this.DOM.top, {willChange: 'clip-path'})
        .fromTo(this.DOM.top, {
            clipPath: 'circle(141.2% at 100% 0%)',
        }, {
            clipPath: 'circle(0% at 100% 0%)'
        }, 0)
        
        .fromTo(this.DOM.bottom, {
            transformOrigin: '50% 100%',
            rotate: 3,
            filter: 'brightness(0%) saturate(600%)',
        }, {
            duration: 0.8,
            filter: 'brightness(100%) saturate(100%)',
            rotate: 0,
            scale: 1.2,
        }, 0)

    }
    mouseleave() {
        
        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        this.leaveTimeout = gsap.timeline({
            defaults: {
                duration: 0.8,
                ease: 'expo',
            },
        })
        .set(this.DOM.bottom, {willChange: 'filter'})
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.DOM.top, {
            clipPath: 'circle(141.2% at 100% 0%)'
        }, 0)

        .to(this.DOM.bottom, {
            duration: 0.8,
            filter: 'brightness(0%) saturate(200%)',
            scale: 1
        }, 0)

    }
}