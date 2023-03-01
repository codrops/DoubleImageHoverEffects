
export class Fx5 {
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
                duration: 0.5,
                ease: 'power2',
            },
        })
        .set(this.DOM.bottom, {willChange: 'filter'})
        .set(this.DOM.top, {willChange: 'clip-path'})
        .fromTo(this.DOM.top, {
            clipPath: 'circle(70.7% at 50% 50%)',
        }, {
            clipPath: 'circle(0% at 50% 50%)'
        }, 0)
        
        .fromTo(this.DOM.bottom, {
            scale: 1.5,
            filter: 'brightness(400%) saturate(200%) hue-rotate(190deg)',
        }, {
            scale: 1.3,
            filter: 'brightness(100%) saturate(100%) hue-rotate(0deg)',
        }, 0)

    }
    mouseleave() {
        
        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        this.leaveTimeout = gsap.timeline({
            defaults: {
                duration: 0.5,
                ease: 'power2.inOut',
            },
        })
        .set(this.DOM.bottom, {willChange: 'filter'})
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.DOM.top, {
            clipPath: 'circle(70.7% at 50% 50%)'
        }, 0)

        .to(this.DOM.bottom, {
            scale: 1.5,
            filter: 'brightness(400%) saturate(200%) hue-rotate(190deg)',
        }, 0)

    }
}