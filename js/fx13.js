
export class Fx13 {
    DOM = {
        el: null,
        bottom: null,
        top: null
    }
    // the hole in the top image: its center and radius (px), and the turn of its soft edge
    hole = {
        x: 0,
        y: 0,
        radius: 0,
        turn: 0
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

        gsap.set(this.DOM.bottom, {
            scale: 1.3,
            filter: 'brightness(140%) contrast(80%)'
        });
    }
    // where the hole opens or closes: the pointer, or the center for a keyboard focus
    getPoint(ev) {
        const rect = this.DOM.el.getBoundingClientRect();
        return ev ? {x: ev.clientX - rect.left, y: ev.clientY - rect.top} : {x: rect.width / 2, y: rect.height / 2};
    }
    // cut the hole out of the top image: the image's outline, then the hole's, with evenodd (in px, from the hole's center)
    clip() {
        const width = this.DOM.el.offsetWidth;
        const height = this.DOM.el.offsetHeight;
        const { x, y, radius, turn } = this.hole;
        const points = Array.from({ length: 48 }, (_, i) => {
            const angle = i / 48 * Math.PI * 2;
            // a soft edge: two slow waves around the circle, turning as the hole grows
            const r = radius * (1 + 0.08 * Math.sin(3 * angle + turn) + 0.05 * Math.sin(5 * angle - turn));
            return `${x + Math.cos(angle) * r}px ${y + Math.sin(angle) * r}px`;
        });
        this.DOM.top.style.clipPath = `polygon(evenodd, 0px 0px, ${width}px 0px, ${width}px ${height}px, 0px ${height}px, 0px 0px, ${points.join(', ')}, ${points[0]})`;
    }
    mouseenter(ev) {

        if ( this.leaveTimeout ) {
            this.leaveTimeout.kill();
        }

        const point = this.getPoint(ev);
        // a closed hole starts right at the pointer, and the image underneath zooms around that point too
        if ( this.hole.radius === 0 ) {
            this.hole.x = point.x;
            this.hole.y = point.y;
            gsap.set(this.DOM.bottom, {transformOrigin: `${point.x}px ${point.y}px`});
        }
        // big enough to clear the farthest corner, soft edge included
        const width = this.DOM.el.offsetWidth;
        const height = this.DOM.el.offsetHeight;
        const radius = 1.2 * Math.max(...[[0, 0], [width, 0], [width, height], [0, height]].map(([cx, cy]) => Math.hypot(cx - point.x, cy - point.y)));

        this.enterTimeout = gsap.timeline({
            defaults: {
                duration: 0.9,
                ease: 'power3.inOut',
            },
        })
        .set(this.DOM.bottom, {willChange: 'transform, filter'})
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.hole, {
            x: point.x,
            y: point.y,
            radius: radius,
            turn: Math.PI,
            onUpdate: () => this.clip()
        }, 0)

        .to(this.DOM.bottom, {
            scale: 1.15,
            filter: 'brightness(100%) contrast(100%)'
        }, 0)

    }
    mouseleave(ev) {

        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        // the hole closes on the point where the pointer left
        const point = this.getPoint(ev);

        this.leaveTimeout = gsap.timeline({
            defaults: {
                duration: 0.7,
                ease: 'power3.inOut',
            },
        })
        .set(this.DOM.bottom, {willChange: 'transform, filter'})
        .set(this.DOM.top, {willChange: 'clip-path'})
        .to(this.hole, {
            x: point.x,
            y: point.y,
            radius: 0,
            turn: 0,
            onUpdate: () => this.clip()
        }, 0)

        .to(this.DOM.bottom, {
            scale: 1.3,
            filter: 'brightness(140%) contrast(80%)'
        }, 0)
        // back to no clip, so a resize while idle can't leave an old px shape behind
        .set(this.DOM.top, {clipPath: 'none'})
        .set([this.DOM.bottom, this.DOM.top], {willChange: 'auto'})

    }
}
