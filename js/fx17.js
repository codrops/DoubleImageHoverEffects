
// where the cells open (in heights of the image, from the center), and the phase of each one's soft edge
const CELLS = [
    {x: -0.55, y: -0.25, phase: 0},
    {x: 0.1, y: -0.05, phase: 2.1},
    {x: 0.6, y: 0.2, phase: 4.2},
    {x: -0.2, y: 0.35, phase: 1.3},
    {x: 0.45, y: -0.35, phase: 3.4}
];
// how big the cells end: together they cover the whole image, even where their edges dip in
const RADIUS = 0.85;

export class Fx17 {
    DOM = {
        el: null,
        cover: null,
        halo: null,
        image: null
    }
    // how far the cells have grown (0 to 1)
    growth = {
        progress: 0
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

        // the image as it is, a bronze copy for the cells' halos, and the image the cells reveal
        this.DOM.cover = this.DOM.el.querySelector('.double__img:first-child');
        this.DOM.halo = this.DOM.el.querySelector('.double__img:nth-child(2)');
        this.DOM.image = this.DOM.el.querySelector('.double__img:last-child');

        gsap.set(this.DOM.cover, {
            filter: 'brightness(100%)'
        });
        gsap.set(this.DOM.halo, {
            scale: 1.5,
            filter: 'grayscale(100%) sepia(100%) hue-rotate(-15deg) brightness(110%) saturate(170%)'
        });
        gsap.set(this.DOM.image, {
            scale: 1.35,
            filter: 'grayscale(0%) sepia(0%) hue-rotate(0deg) brightness(170%) saturate(105%)'
        });
        this.clip();
    }
    // all the cells as one polygon (in %): each cell's outline, joined by lines that go out and come straight back,
    // so with the default nonzero rule the cells simply add up, overlaps included. The box is always 4 / 2.5
    cells(scale) {
        const radius = RADIUS * this.growth.progress * scale;
        const turn = this.growth.progress * Math.PI;
        const point = (x, y) => `${50 + x * 62.5}% ${50 + y * 100}%`;
        const outlines = CELLS.map(cell => {
            const points = Array.from({ length: 48 }, (_, i) => {
                const angle = i / 48 * Math.PI * 2;
                // a soft edge: two slow waves around the circle, turning as the cell grows
                const r = radius * (1 + 0.08 * Math.sin(3 * angle + cell.phase + turn) + 0.05 * Math.sin(5 * angle - cell.phase - turn));
                return point(cell.x + Math.cos(angle) * r, cell.y + Math.sin(angle) * r);
            });
            return [...points, points[0]];
        });
        // out to each cell from the first one's start, around it, and back
        const start = outlines[0][0];
        return `polygon(${outlines.map((outline, i) => i ? [...outline, start] : outline).flat().join(', ')})`;
    }
    clip() {
        this.DOM.halo.style.clipPath = this.cells(1.2);
        this.DOM.image.style.clipPath = this.cells(1);
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
        .set(this.DOM.cover, {willChange: 'transform, filter'})
        .set([this.DOM.halo, this.DOM.image], {willChange: 'transform, filter, clip-path'})
        // the cells open and grow into each other
        .to(this.growth, {
            progress: 1,
            onUpdate: () => this.clip()
        }, 0)

        // the image in them settles from a flash, the halos come into line with it, the cover recedes
        .to([this.DOM.halo, this.DOM.image], {
            scale: 1.15,
            filter: 'grayscale(0%) sepia(0%) hue-rotate(0deg) brightness(100%) saturate(100%)'
        }, 0)
        .to(this.DOM.cover, {
            scale: 1.1,
            filter: 'brightness(60%)'
        }, 0)

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
        .set(this.DOM.cover, {willChange: 'transform, filter'})
        .set([this.DOM.halo, this.DOM.image], {willChange: 'transform, filter, clip-path'})
        .to(this.growth, {
            progress: 0,
            onUpdate: () => this.clip()
        }, 0)

        .to(this.DOM.halo, {
            scale: 1.5,
            filter: 'grayscale(100%) sepia(100%) hue-rotate(-15deg) brightness(110%) saturate(170%)'
        }, 0)
        .to(this.DOM.image, {
            scale: 1.35,
            filter: 'grayscale(0%) sepia(0%) hue-rotate(0deg) brightness(170%) saturate(105%)'
        }, 0)
        .to(this.DOM.cover, {
            scale: 1,
            filter: 'brightness(100%)'
        }, 0)
        .set([this.DOM.cover, this.DOM.halo, this.DOM.image], {willChange: 'auto'})

    }
}
