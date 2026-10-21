
export class Fx15 {
    DOM = {
        el: null,
        images: null
    }
    // the rings over the cover, from the center out: their radii (in heights of the image) and how far each turns
    rings = [
        {from: 0, to: 0.17, turn: 150},
        {from: 0.17, to: 0.33, turn: -100},
        {from: 0.33, to: 0.49, turn: 60}
    ]
    // the hole in the cover (in heights of the image)
    hole = {
        radius: 0
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
            <div class="double__img" style="background-image:[url]"></div>
            <div class="double__img" style="background-image:[url]"></div>
        </div>
        */

        // get element background-image url
        const url = getComputedStyle(this.DOM.el).backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];
        gsap.set(this.DOM.el, {backgroundImage: 'none'});

        const iterations = 5;
        this.DOM.el.innerHTML = Array.from({ length: iterations }, () => `<div class="double__img" style="background-image:url(${url})"></div>`).join('');
        // the image underneath, the cover, then the three rings
        this.DOM.images = [...this.DOM.el.querySelectorAll('.double__img')];

        // glowing underneath (with reduced motion the effect doesn't run, so it waits as it ends, for the crossfade)
        gsap.set(this.DOM.images[0], window.matchMedia('(prefers-reduced-motion: reduce)').matches ? {
            scale: 1.15
        } : {
            scale: 1.3,
            filter: 'brightness(180%) saturate(130%)'
        });

        this.rings.forEach(ring => ring.inner = ring.from);
        this.clipCover();
        this.rings.forEach((ring, i) => this.clipRing(i));
    }
    // a circle as polygon points (in %), r in heights of the image; the box is always 4 / 2.5, so it stays round
    circle(r) {
        const points = Array.from({ length: 64 }, (_, i) => {
            const angle = i / 64 * Math.PI * 2;
            return `${50 + r * 62.5 * Math.cos(angle)}% ${50 + r * 100 * Math.sin(angle)}%`;
        });
        // back to the first point, so the jump between outlines adds nothing with evenodd
        return [...points, points[0]].join(', ');
    }
    clipCover() {
        this.DOM.images[1].style.clipPath = `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${this.circle(this.hole.radius)})`;
    }
    clipRing(i) {
        const ring = this.rings[i];
        this.DOM.images[2 + i].style.clipPath = `polygon(evenodd, ${this.circle(ring.to)}, ${this.circle(ring.inner)})`;
    }
    mouseenter() {

        if ( this.leaveTimeout ) {
            this.leaveTimeout.kill();
        }

        // .to() from wherever a leave stopped, so a quick in and out doesn't jump
        this.enterTimeout = gsap.timeline({
            defaults: {
                duration: 1.2,
                ease: 'power3.inOut',
            },
        })
        .set(this.DOM.images[0], {willChange: 'transform, filter'})
        .set(this.DOM.images.slice(1), {willChange: 'transform, opacity, clip-path'})
        // the cover opens from the center out (past the corners)
        .to(this.hole, {
            radius: 0.96,
            onUpdate: () => this.clipCover()
        }, 0)

        .to(this.DOM.images[0], {
            scale: 1.15,
            filter: 'brightness(100%) saturate(100%)'
        }, 0);

        // the rings over it turn each their own way, and thin away from their inner edge, fading as they go
        // (so they never end as thin lines)
        this.rings.forEach((ring, i) => {
            this.enterTimeout
            .to(this.DOM.images[2 + i], {
                rotate: ring.turn
            }, 0)
            .to(this.DOM.images[2 + i], {
                opacity: 0
            }, 0)
            .to(ring, {
                inner: ring.to,
                onUpdate: () => this.clipRing(i)
            }, 0);
        });

    }
    mouseleave() {

        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        this.leaveTimeout = gsap.timeline({
            defaults: {
                duration: 0.8,
                ease: 'power3.inOut',
            },
        })
        .set(this.DOM.images[0], {willChange: 'transform, filter'})
        .set(this.DOM.images.slice(1), {willChange: 'transform, opacity, clip-path'})
        .to(this.hole, {
            radius: 0,
            onUpdate: () => this.clipCover()
        }, 0)

        .to(this.DOM.images[0], {
            scale: 1.3,
            filter: 'brightness(180%) saturate(130%)'
        }, 0);

        // the rings fill in and turn back into place
        this.rings.forEach((ring, i) => {
            this.leaveTimeout
            .to(this.DOM.images[2 + i], {
                rotate: 0
            }, 0)
            .to(this.DOM.images[2 + i], {
                opacity: 1
            }, 0)
            .to(ring, {
                inner: ring.from,
                onUpdate: () => this.clipRing(i)
            }, 0);
        });

        this.leaveTimeout.set(this.DOM.images, {willChange: 'auto'});

    }
}
