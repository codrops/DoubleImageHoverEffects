
export class Fx12 {
    DOM = {
        el: null,
        bottom: null,
        top: null
    }
    // the top image's clip: a rectangle around the center, turned by angle (degrees) and sized by scale
    aperture = {
        angle: 0,
        scale: 1
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
        this.DOM.el.innerHTML = Array.from({ length: iterations }, () => `<div class="double__img" style="background-image:url(${url})"></div>`).join('');

        this.DOM.bottom = this.DOM.el.querySelector('.double__img:first-child');
        this.DOM.top = this.DOM.el.querySelector('.double__img:last-child');

        // turned the other way and toned down to bronze; scaled enough to keep covering the box while it turns
        gsap.set(this.DOM.bottom, {
            rotate: -10,
            scale: 1.3,
            filter: 'grayscale(100%) sepia(60%) brightness(60%)'
        });
    }
    // clip the top image to the turned rectangle (in px, since the box isn't square)
    clip() {
        const width = this.DOM.el.offsetWidth;
        const height = this.DOM.el.offsetHeight;
        const angle = this.aperture.angle * Math.PI / 180;
        const cos = Math.cos(angle) * this.aperture.scale;
        const sin = Math.sin(angle) * this.aperture.scale;
        const points = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => {
            const dx = x * width / 2;
            const dy = y * height / 2;
            return `${width / 2 + dx * cos - dy * sin}px ${height / 2 + dx * sin + dy * cos}px`;
        });
        this.DOM.top.style.clipPath = `polygon(${points.join(', ')})`;
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
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.aperture, {
            angle: 60,
            scale: 0,
            onUpdate: () => this.clip()
        }, 0)

        .to(this.DOM.bottom, {
            rotate: 0,
            scale: 1.15,
            filter: 'grayscale(0%) sepia(0%) brightness(100%)'
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
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.aperture, {
            angle: 0,
            scale: 1,
            onUpdate: () => this.clip()
        }, 0)

        .to(this.DOM.bottom, {
            rotate: -10,
            scale: 1.3,
            filter: 'grayscale(100%) sepia(60%) brightness(60%)'
        }, 0)
        // back to no clip, so a resize while idle can't leave an old px rectangle behind
        .set(this.DOM.top, {clipPath: 'none'})
        .set([this.DOM.bottom, this.DOM.top], {willChange: 'auto'})

    }
}
