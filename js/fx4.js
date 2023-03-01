
export class Fx4 {
    DOM = {
        el: null
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

        const iterations = 3;
        let innerHTML = '';
        for (let i = 0; i < iterations; ++i) {
            innerHTML += `<div class="double__img" style="background-image:url(${url})"></div>`;
        }
        this.DOM.el.innerHTML = innerHTML;

        this.DOM.bottom = this.DOM.el.querySelector('.double__img:first-child');
        this.DOM.middle = this.DOM.el.querySelector('.double__img:nth-child(2)');
        this.DOM.top = this.DOM.el.querySelector('.double__img:last-child');
        
        gsap.set(this.DOM.middle, {
            scale: 0.97,
            filter: 'saturate(400%) blur(5px)'
        });

        gsap.set(this.DOM.bottom, {
            scale: 0.94
        });
    }
    mouseenter() {

        if ( this.leaveTimeout ) {
            this.leaveTimeout.kill();
        }
        const DURATION = 0.25;
        this.enterTimeout = gsap.timeline({
            defaults: {
                duration: 0.8,
                ease: "none",
            },
        })
        .addLabel('start', 0)
        .set([this.DOM.top, this.DOM.middle], {willChange: 'clip-path'})
        .fromTo(this.DOM.top, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
        }, 'start')
        .fromTo(this.DOM.middle, {
            xPercent: 0
        }, {
            duration: DURATION,
            ease: 'elastic.inOut(5)',
            xPercent: -3,
            repeat: 1
        }, 'start')
        .fromTo(this.DOM.middle, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
        }, `start+=${DURATION*0.7}`)
        .fromTo(this.DOM.bottom, {
            xPercent: 0,
            yPercent: 0,
        }, {
            duration: DURATION,
            ease: 'elastic.inOut(5)',
            xPercent: 1,
            yPercent: -1,
            repeat: 1
        }, `start+=${DURATION*0.7}`)

    }
    mouseleave() {
        
        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        this.leaveTimeout = gsap.timeline({
            defaults: {
                duration: 0.4,
                ease: "none",
            },
        })
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.DOM.top, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
        }, 0)

    }
}