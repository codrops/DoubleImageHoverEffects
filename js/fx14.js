
export class Fx14 {
    DOM = {
        el: null,
        bottom: null,
        middle: null,
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
            <div class="double__img" style="background-image:[url]"></div>
        </div>
        */

        // get element background-image url
        const url = getComputedStyle(this.DOM.el).backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];
        gsap.set(this.DOM.el, {backgroundImage: 'none'});

        const iterations = 3;
        this.DOM.el.innerHTML = Array.from({ length: iterations }, () => `<div class="double__img" style="background-image:url(${url})"></div>`).join('');

        this.DOM.bottom = this.DOM.el.querySelector('.double__img:first-child');
        this.DOM.middle = this.DOM.el.querySelector('.double__img:nth-child(2)');
        this.DOM.top = this.DOM.el.querySelector('.double__img:last-child');

        // two print plates out of register: a gray one, and a bronze one laid over it
        gsap.set(this.DOM.bottom, {
            xPercent: -6,
            scale: 1.3,
            filter: 'grayscale(100%) contrast(115%) brightness(105%)'
        });
        gsap.set(this.DOM.middle, {
            xPercent: 6,
            scale: 1.3,
            opacity: 0.6,
            filter: 'grayscale(100%) sepia(100%) saturate(180%) hue-rotate(-15deg) brightness(115%)'
        });
        gsap.set(this.DOM.top, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
        });
    }
    mouseenter() {

        if ( this.leaveTimeout ) {
            this.leaveTimeout.kill();
        }

        // .to() from wherever a leave stopped, so a quick in and out doesn't jump
        this.enterTimeout = gsap.timeline({
            defaults: {
                duration: 0.9,
                ease: 'power3.inOut',
            },
        })
        .set(this.DOM.bottom, {willChange: 'transform, filter'})
        .set(this.DOM.middle, {willChange: 'transform, opacity'})
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.DOM.top, {
            clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)'
        }, 0)

        // the plates slide into register and the picture comes back in color
        .to([this.DOM.bottom, this.DOM.middle], {
            xPercent: 0,
            scale: 1.15
        }, 0)
        .to(this.DOM.middle, {
            opacity: 0
        }, 0)
        .to(this.DOM.bottom, {
            filter: 'grayscale(0%) contrast(100%) brightness(100%)'
        }, 0)

    }
    mouseleave() {

        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        this.leaveTimeout = gsap.timeline({
            defaults: {
                duration: 0.7,
                ease: 'power3.inOut',
            },
        })
        .set(this.DOM.bottom, {willChange: 'transform, filter'})
        .set(this.DOM.middle, {willChange: 'transform, opacity'})
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.DOM.top, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
        }, 0)

        .to(this.DOM.bottom, {
            xPercent: -6,
            scale: 1.3,
            filter: 'grayscale(100%) contrast(115%) brightness(105%)'
        }, 0)
        .to(this.DOM.middle, {
            xPercent: 6,
            scale: 1.3,
            opacity: 0.6
        }, 0)
        .set([this.DOM.bottom, this.DOM.middle, this.DOM.top], {willChange: 'auto'})

    }
}
