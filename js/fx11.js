
export class Fx11 {
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

        const iterations = 5;
        let innerHTML = '';
        for (let i = 0; i < iterations; ++i) {
            innerHTML += `<div class="double__img" style="background-image:url(${url})"></div>`;
        }
        this.DOM.el.innerHTML = innerHTML;
        this.DOM.images = [...this.DOM.el.querySelectorAll('.double__img')];

        gsap.set(this.DOM.images[0], {
            scale: 0.9,
            filter: 'saturate(200%) hue-rotate(90deg)'
        })
    }
    mouseenter() {

        if ( this.leaveTimeout ) {
            this.leaveTimeout.kill();
        }

        this.enterTimeout = gsap.timeline({
            defaults: {
                duration: 0.3,
                ease: 'steps(3)',
            },
        })
        .set(this.DOM.images, {willChange: 'clip-path'})
        .fromTo(this.DOM.images[1], {
            clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)',
        }, {
            clipPath: 'polygon(100% 50%, 100% 50%, 100% 100%, 100% 100%)'
        }, 0.4)
        .fromTo(this.DOM.images[2], {
            clipPath: 'polygon(0% 50%, 50% 50%, 50% 100%, 0% 100%)',
        }, {
            clipPath: 'polygon(0% 100%, 50% 100%, 50% 100%, 0% 100%)'
        }, 0.6)
        .fromTo(this.DOM.images[3], {
            clipPath: 'polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)',
        }, {
            clipPath: 'polygon(50% 50%, 100% 50%, 100% 50%, 50% 50%)'
        }, 0)
        .fromTo(this.DOM.images[4], {
            clipPath: 'polygon(0% 0%, 50% 0%, 50% 50%, 0% 50%)',
        }, {
            clipPath: 'polygon(0% 0%, 0% 0%, 0% 50%, 0% 50%)'
        }, 0.2)

    }
    mouseleave() {
        
        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        this.leaveTimeout = gsap.timeline({
            defaults: {
                duration: 0.5,
                ease: 'steps(3)',
            },
        })
        .set(this.DOM.images, {willChange: 'clip-path'})
        .to(this.DOM.images[1], {
            clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)',
        }, 0)
        .to(this.DOM.images[2], {
            clipPath: 'polygon(0% 50%, 50% 50%, 50% 100%, 0% 100%)',
        }, 0.6)
        .to(this.DOM.images[3], {
            clipPath: 'polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)',
        }, 0.2)
        .to(this.DOM.images[4], {
            clipPath: 'polygon(0% 0%, 50% 0%, 50% 50%, 0% 50%)',
        }, 0.4)

    }
}