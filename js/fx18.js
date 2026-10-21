import { GLImage, COVER } from './webgl/glImage.js';

// The look of the effect. Change a value, save and reload; the shader reads each one as a uniform (bend → uBend)
const SETTINGS = {
  // how much the image bends at the height of the wave (0.03 is subtle; from about 0.12 the mirrored edges show)
  bend: 0.02,
  // how far the waves travel during one hover
  waveSpeed: 3,
  // how many big swells cross the image (higher: more and tighter waves, lower: broader and lazier)
  swells: 2.1,
  // the small ripples on top of the swells: how many, and how strong (0 for none)
  ripples: 6.3,
  rippleStrength: 0.45,
  // how wide the band is where the image stretches to its new size (in heights of the image)
  stretchBand: 0.55,
  // the image's size at the end
  zoom: 1.25,
  // how far red and blue come apart where it bends (0 for none)
  colorSplit: 0.035,
};

// The image waves: two slow swells cross it, with smaller ripples on top, building up and dying down. While it waves,
// the image stretches to its new size along a band that crosses from where the pointer came in, bent by the same
// waves, with red and blue a touch apart where it bends most. Nothing waves at the first and last frames
const fragmentShader = /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uProgress;
    uniform vec2 uDirection;
    uniform float uBend;
    uniform float uWaveSpeed;
    uniform float uSwells;
    uniform float uRipples;
    uniform float uRippleStrength;
    uniform float uStretchBand;
    uniform float uZoom;
    uniform float uColorSplit;
    varying vec2 vUv;

    ${COVER}

    const float PI = 3.14159265;

    void main() {
        float progress = uProgress;
        float aspect = uResolution.x / uResolution.y;
        vec2 direction = uDirection;

        // positions in the box's own units (its height is 1), from its center
        vec2 position = (vUv - 0.5) * vec2(aspect, 1.0);

        // the waves: strongest halfway, still at both ends, travelling as the hover goes on
        // (each pair runs in its own direction, the second of each a little broader)
        float strength = uBend * sin(PI * progress);
        float time = progress * uWaveSpeed;
        vec2 wave = vec2(
            sin(position.y * uSwells + time) + uRippleStrength * sin((position.x + position.y) * uRipples - time * 1.3),
            sin(position.x * uSwells * 0.84 - time * 0.8) + uRippleStrength * cos((position.x - position.y) * uRipples * 0.81 + time * 1.1)
        );
        vec2 offset = wave * strength;

        // behind the band the image is at its new size, ahead of it as it was; the band starts outside one edge and
        // ends outside the other, so the first frame is all at 1 and the last all at the new size
        float reach = 0.5 * (abs(direction.x) * aspect + abs(direction.y)) + uStretchBand + 0.05;
        float front = mix(-reach, reach, progress);
        float x = dot(position + offset * 2.0, direction) - front;
        float zoom = mix(1.0, uZoom, smoothstep(uStretchBand, -uStretchBand, x));

        vec2 shift = offset / vec2(aspect, 1.0);
        vec3 color = vec3(
            texture2D(uTexture, coverUv(vUv + shift * (1.0 + uColorSplit), zoom)).r,
            texture2D(uTexture, coverUv(vUv + shift, zoom)).g,
            texture2D(uTexture, coverUv(vUv + shift * (1.0 - uColorSplit), zoom)).b
        );
        gl_FragColor = vec4(color, 1.0);
    }
`;

export class Fx18 {
  DOM = {
    el: null,
  };
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
    gsap.set(this.DOM.el, { backgroundImage: 'none' });

    this.DOM.el.innerHTML = `<div class="double__img" style="background-image:url(${url})"></div>`;
    this.gl = new GLImage(this.DOM.el, url, fragmentShader, SETTINGS, {
      uDirection: { value: { x: 1, y: 0 } },
    });
  }
  mouseenter(ev) {
    if (this.leaveTimeout) {
      this.leaveTimeout.kill();
    }

    // a new wave travels away from where the pointer came in (left to right for a keyboard focus)
    if (this.gl.uniforms.uProgress.value === 0 && ev) {
      const rect = this.DOM.el.getBoundingClientRect();
      const x = (rect.left + rect.width / 2 - ev.clientX) / rect.height;
      const y = (ev.clientY - rect.top - rect.height / 2) / rect.height;
      const length = Math.hypot(x, y) || 1;
      this.gl.uniforms.uDirection.value = { x: x / length, y: y / length };
    }

    this.enterTimeout = gsap
      .timeline({
        defaults: {
          duration: 1.2,
          ease: 'power3.inOut',
        },
      })
      .to(
        this.gl.uniforms.uProgress,
        {
          value: 1,
          onUpdate: () => this.gl.render(),
        },
        0,
      );
  }
  mouseleave() {
    if (this.enterTimeout) {
      this.enterTimeout.kill();
    }

    // the wave goes back the way it came
    this.leaveTimeout = gsap
      .timeline({
        defaults: {
          duration: 0.8,
          ease: 'power3.inOut',
        },
      })
      .to(
        this.gl.uniforms.uProgress,
        {
          value: 0,
          onUpdate: () => this.gl.render(),
        },
        0,
      );
  }
}
