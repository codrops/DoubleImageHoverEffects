import { GLImage, COVER } from './webgl/glImage.js';

// The look of the effect. Change a value, save and reload; the shader reads each one as a uniform (turns → uTurns)
const SETTINGS = {
    // how many times each point turns all the way round as the twist passes it (keep it a whole number: a whole turn
    // brings the image back straight)
    turns: 1,
    // how much of the image twists at once (in heights of the image; smaller is a tighter spiral)
    band: 0.6,
    // the image's size while hovered
    zoom: 1.15,
    // how far red and blue come apart in the twist (0 for none)
    colorSplit: 0.01
};

// A twist grows from the middle of the image out past its corners, and every point it passes turns all the way round,
// always the same way, the way set by the side the pointer came in from. Behind it the turn is complete, so the image
// is straight again, already at its new size. Leaving twists on the same way round back to the image as it was
const fragmentShader = /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uProgress;
    uniform float uTurn;
    uniform float uZoomFrom;
    uniform float uZoomTo;
    uniform float uTurns;
    uniform float uBand;
    uniform float uColorSplit;
    varying vec2 vUv;

    ${COVER}

    const float PI = 3.14159265;

    // the point looked up for position, turned around the middle by angle (positions in the box's own units)
    vec2 turned(vec2 position, float angle, float aspect) {
        vec2 p = mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * position;
        return p / vec2(aspect, 1.0) + 0.5;
    }

    void main() {
        float aspect = uResolution.x / uResolution.y;

        // positions in the box's own units (its height is 1), from its middle
        vec2 position = (vUv - 0.5) * vec2(aspect, 1.0);
        float distance = length(position);
        float farthest = length(vec2(aspect, 1.0) * 0.5);

        // how far the twist has turned this point: none ahead of it, all the way round behind it
        float front = mix(-uBand, farthest, uProgress);
        float done = 1.0 - smoothstep(front, front + uBand, distance);
        float angle = uTurn * 2.0 * PI * uTurns * done;
        float zoom = mix(uZoomFrom, uZoomTo, done);

        // red and blue turn a little ahead and behind, only while the point is turning
        float split = uTurn * uColorSplit * 2.0 * PI * uTurns * sin(PI * done);
        vec3 color = vec3(
            texture2D(uTexture, coverUv(turned(position, angle + split, aspect), zoom)).r,
            texture2D(uTexture, coverUv(turned(position, angle, aspect), zoom)).g,
            texture2D(uTexture, coverUv(turned(position, angle - split, aspect), zoom)).b
        );
        gl_FragColor = vec4(color, 1.0);
    }
`;

export class Fx19 {
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
            <canvas class="double__gl"></canvas>
        </div>
        */

        // get element background-image url
        const url = getComputedStyle(this.DOM.el).backgroundImage.match(/url\(["']?([^"']*)["']?\)/)[1];
        gsap.set(this.DOM.el, {backgroundImage: 'none'});

        this.DOM.el.innerHTML = `<div class="double__img" style="background-image:url(${url})"></div>`;
        this.gl = new GLImage(this.DOM.el, url, fragmentShader, SETTINGS, {
            // which way it turns: 1 or -1
            uTurn: { value: 1 },
            // the size ahead of the twist and behind it
            uZoomFrom: { value: 1 },
            uZoomTo: { value: SETTINGS.zoom }
        });
    }
    // twists towards the image at zoom: a new twist from the middle if the image is still, or back the way it came
    // if a twist towards the other size is under way, so nothing jumps
    twistTo(zoom, duration) {
        const uniforms = this.gl.uniforms;
        const progress = uniforms.uProgress.value;
        if ( progress === 0 || progress === 1 ) {
            const current = progress === 0 ? uniforms.uZoomFrom.value : uniforms.uZoomTo.value;
            uniforms.uZoomFrom.value = current;
            uniforms.uZoomTo.value = zoom;
            uniforms.uProgress.value = 0;
        }
        const target = uniforms.uZoomTo.value === zoom ? 1 : 0;

        return gsap.timeline({
            defaults: {
                duration: duration,
                ease: 'power3.inOut',
            },
        })
        .to(uniforms.uProgress, {
            value: target,
            onUpdate: () => this.gl.render()
        }, 0)
    }
    mouseenter(ev) {

        if ( this.leaveTimeout ) {
            this.leaveTimeout.kill();
        }

        // a twist from still turns clockwise when the pointer came in on the left, the other way on the right
        const progress = this.gl.uniforms.uProgress.value;
        if ( (progress === 0 || progress === 1) && ev ) {
            const rect = this.DOM.el.getBoundingClientRect();
            this.gl.uniforms.uTurn.value = ev.clientX < rect.left + rect.width / 2 ? -1 : 1;
        }

        this.enterTimeout = this.twistTo(SETTINGS.zoom, 1.2);

    }
    mouseleave() {

        if ( this.enterTimeout ) {
            this.enterTimeout.kill();
        }

        // it twists on the same way round, back to the image as it was
        this.leaveTimeout = this.twistTo(1, 0.8);

    }
}
