
// how every facet ends: true colors (the same filter functions as each facet's start, so they blend)
const TRUE_COLORS = 'grayscale(0%) sepia(0%) contrast(100%) brightness(100%) saturate(100%)';

// the image cut along its diagonals: top, right, bottom and left triangles (in %), each a little past the
// diagonals and the edges, so neighbours overlap and no seam shows while they're aligned
const TRIANGLES = [
    'polygon(-2% 0%, 102% 0%, 50% 52%)',
    'polygon(100% -2%, 100% 102%, 48% 50%)',
    'polygon(102% 100%, -2% 100%, 50% 48%)',
    'polygon(0% 102%, 0% -2%, 52% 50%)'
];

export class Fx16 {
    DOM = {
        el: null,
        facets: null,
        pieces: null
    }
    // where each piece of the cover slides out to, in the order of TRIANGLES
    exits = [
        {xPercent: 0, yPercent: -60},
        {xPercent: 60, yPercent: 0},
        {xPercent: 0, yPercent: 60},
        {xPercent: -60, yPercent: 0}
    ]
    // how each facet's copy starts: zoomed and shifted on its own (through the background, so its triangle stays put),
    // in its own tone. They all end as the image at 1.15, in true colors
    facets = [
        {size: '145% auto', position: '50% 35%', filter: 'grayscale(100%) sepia(80%) contrast(100%) brightness(110%) saturate(100%)'},
        {size: '135% auto', position: '65% 50%', filter: 'grayscale(100%) sepia(0%) contrast(120%) brightness(115%) saturate(100%)'},
        {size: '145% auto', position: '50% 65%', filter: 'grayscale(0%) sepia(0%) contrast(80%) brightness(150%) saturate(80%)'},
        {size: '135% auto', position: '35% 50%', filter: 'grayscale(0%) sepia(0%) contrast(110%) brightness(80%) saturate(180%)'}
    ]
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
            ... 9 in all
        </div>
        */

        // get element background-image url
        const url = getComputedStyle(this.DOM.el).backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];
        gsap.set(this.DOM.el, {backgroundImage: 'none'});

        const iterations = 9;
        this.DOM.el.innerHTML = Array.from({ length: iterations }, () => `<div class="double__img" style="background-image:url(${url})"></div>`).join('');
        // the image as it ends (hidden under the rest, and what the reduced motion crossfade shows),
        // the four facets, then the four pieces of the cover
        const images = [...this.DOM.el.querySelectorAll('.double__img')];
        this.DOM.facets = images.slice(1, 5);
        this.DOM.pieces = images.slice(5);

        gsap.set(images[0], {backgroundSize: '115% auto'});

        gsap.set(this.DOM.facets, {
            clipPath: i => TRIANGLES[i],
            backgroundSize: i => this.facets[i].size,
            backgroundPosition: i => this.facets[i].position,
            filter: i => this.facets[i].filter
        });
        gsap.set(this.DOM.pieces, {
            clipPath: i => TRIANGLES[i],
            filter: 'brightness(100%)'
        });
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
        .set(this.DOM.facets, {willChange: 'filter'})
        .set(this.DOM.pieces, {willChange: 'transform, filter'})
        // the cover breaks along its diagonals and the pieces slide out, darkening
        .to(this.DOM.pieces, {
            xPercent: i => this.exits[i].xPercent,
            yPercent: i => this.exits[i].yPercent,
            filter: 'brightness(40%)'
        }, 0)

        // the facets underneath come together into the image at 1.15 (115% wide is the image scaled by 1.15)
        .to(this.DOM.facets, {
            backgroundSize: '115% auto',
            backgroundPosition: '50% 50%',
            filter: TRUE_COLORS
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
        .set(this.DOM.facets, {willChange: 'filter'})
        .set(this.DOM.pieces, {willChange: 'transform, filter'})
        .to(this.DOM.pieces, {
            xPercent: 0,
            yPercent: 0,
            filter: 'brightness(100%)'
        }, 0)

        .to(this.DOM.facets, {
            backgroundSize: i => this.facets[i].size,
            backgroundPosition: i => this.facets[i].position,
            filter: i => this.facets[i].filter
        }, 0)
        .set([...this.DOM.facets, ...this.DOM.pieces], {willChange: 'auto'})

    }
}
