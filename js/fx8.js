
export class Fx8 {
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

        const iterations = 3;
        let innerHTML = '';
        for (let i = 0; i < iterations; ++i) {
            innerHTML += `<div class="double__img" style="background-image:url(${url})"></div>`;
        }
        this.DOM.el.innerHTML = innerHTML;

        this.DOM.bottom = this.DOM.el.querySelector('.double__img:first-child');
        this.DOM.middle = this.DOM.el.querySelector('.double__img:nth-child(2)');
        this.DOM.top = this.DOM.el.querySelector('.double__img:last-child');
        
        gsap.set(this.DOM.bottom, {
            scale: 1.3
        });
        gsap.set(this.DOM.middle, {
            scaleX: -1.15,
            scaleY: 1.15,
        });
    }
    mouseenter() {

        if ( this.leaveTimeout ) {
            this.leaveTimeout.kill();
        }

        const DURATION = 0.6;
        this.enterTimeout = gsap.timeline({
            defaults: {
                duration: DURATION/2,
                ease: 'power1',
            },
        })
        .addLabel('start', 0)
        .set([this.DOM.middle,this.DOM.bottom], {willChange: 'filter'})
        .set([this.DOM.middle,this.DOM.top], {willChange: 'clip-path'})
        .fromTo(this.DOM.top, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }, {
            clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
        }, 'start')
        .fromTo(this.DOM.middle, {
            filter: 'brightness(600%) saturate(200%)',
        }, {
            filter: 'brightness(100%) saturate(100%)',
        }, 'start')

        .fromTo(this.DOM.middle, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }, {
            clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)'
        }, `start+=${DURATION/2}`)
        
        .fromTo(this.DOM.bottom, {
            filter: 'brightness(600%) saturate(200%)',
        }, {
            filter: 'brightness(100%) saturate(100%)',
        }, `start+=${DURATION/2}`)

    }
    mouseleave() {
        
        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        const DURATION = 0.6;
        this.leaveTimeout = gsap.timeline({
            defaults: {
                duration: DURATION/2,
                ease: 'power1',
            },
        })
        .addLabel('start', 0)
        .set([this.DOM.middle,this.DOM.bottom], {willChange: 'filter'})
        .set([this.DOM.middle,this.DOM.top], {willChange: 'clip-path'})
        .to(this.DOM.bottom, {
            filter: 'brightness(150%) saturate(150%)',
        }, `start`)
        .to(this.DOM.middle, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }, `start`)
        .to(this.DOM.middle, {
            filter: 'brightness(150%) saturate(150%)',
        }, `start+=${DURATION/2}`)
        .to(this.DOM.top, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
        }, `start+=${DURATION/2}`)

    }
}