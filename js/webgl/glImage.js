import * as THREE from 'three';

// GLSL shared by the WebGL effects: the image as the HTML shows it (background-size: cover, centered), zoomed by zoom
export const COVER = /* glsl */ `
    uniform vec2 uResolution;
    uniform vec2 uImageResolution;

    vec2 coverUv(vec2 uv, float zoom) {
        float boxRatio = uResolution.x / uResolution.y;
        float imageRatio = uImageResolution.x / uImageResolution.y;
        vec2 scale = boxRatio > imageRatio ? vec2(1.0, imageRatio / boxRatio) : vec2(boxRatio / imageRatio, 1.0);
        return (uv - 0.5) * scale / zoom + 0.5;
    }
`;

const vertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

// One image drawn by a fragment shader, in a canvas laid over the .double__img (which stays as the fallback).
// It only draws when asked: on load, on resize and from the effect's tweens, never in a loop of its own.
// Each of the effect's settings becomes a uniform named after it (bend → uBend); uniforms adds any others
export class GLImage {
    constructor(el, url, fragmentShader, settings = {}, uniforms = {}) {
        this.el = el;

        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        // no color management: the picture's own values in and out, so it matches the HTML image exactly
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.domElement.classList.add('double__gl');
        this.el.appendChild(this.renderer.domElement);

        this.uniforms = {
            uTexture: { value: null },
            uResolution: { value: new THREE.Vector2() },
            uImageResolution: { value: new THREE.Vector2(1, 1) },
            uPixelRatio: { value: this.renderer.getPixelRatio() },
            uProgress: { value: 0 },
            ...Object.fromEntries(Object.entries(settings).map(([name, value]) => [`u${name[0].toUpperCase()}${name.slice(1)}`, { value }])),
            ...uniforms
        };
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.scene.add(new THREE.Mesh(
            new THREE.PlaneGeometry(2, 2),
            new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms: this.uniforms })
        ));

        new THREE.TextureLoader().load(url, texture => {
            texture.minFilter = THREE.LinearFilter;
            // a warp that reaches past the image's edges finds the image mirrored there, not a smear
            texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
            texture.generateMipmaps = false;
            this.uniforms.uTexture.value = texture;
            this.uniforms.uImageResolution.value.set(texture.image.width, texture.image.height);
            this.ready = true;
            this.render();
        });

        new ResizeObserver(() => this.resize()).observe(this.el);
    }
    resize() {
        const { width, height } = this.el.getBoundingClientRect();
        this.renderer.setSize(width, height, false);
        this.renderer.getDrawingBufferSize(this.uniforms.uResolution.value);
        this.render();
    }
    render() {
        if ( this.ready ) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}
