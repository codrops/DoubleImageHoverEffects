# AGENTS.md

Notes for coding agents working on this repo. Read [README.md](README.md) first for what the demo is.

## Setup

- There is no build step, no package.json and nothing to install. Plain HTML, CSS and ES modules.
- Serve the root with any static server (`npx serve .` or `python3 -m http.server`). ES modules don't load from `file://`.
- GSAP (3.15.0, cdnjs) and Lenis (1.3.27, jsDelivr, with its `lenis.css`) load from CDNs as classic scripts before the module, so `gsap` and `Lenis` are globals. Don't import them. three.js (0.186.1, jsDelivr) is an ES module, mapped as `three` by the import map in `index.html`; only the WebGL effects import it. The font is the Adobe Fonts kit `xgl3olk` (Sigurd Variable).
- The analytics and sponsor scripts stay commented out in the repo; they're added on the live server only.
- There are no automated tests. Check a change in a browser: hover each effect in and out, slowly and quickly, Tab through the page, turn on reduced motion, try a phone width, and look at the console.

## Map

| Path                        | What it is                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `index.html`                | The only page: the intro with the frame, one `.content` row per effect (a numeral and a `.double`), then every effect again in a `.grid` of smaller images. |
| `js/index.js`               | Start-up: creates a `DoubleImageEffect` per `.double`, preloads the images, removes the loader, starts Lenis. |
| `js/doubleImageEffect.js`   | Picks the effect class from `data-effect`, and handles hover, keyboard focus and reduced motion for all of them. |
| `js/fx1.js`…`js/fx18.js`    | One effect per file (`Fx1`…`Fx18`). XVIII on are WebGL.                                              |
| `js/webgl/glImage.js`       | `GLImage`, shared by the WebGL effects: draws one image with a fragment shader in a canvas over the `.double`, and `COVER`, the GLSL that frames it like `background-size: cover`. |
| `css/base.css`              | All styles: loader, frame, intro, rows, the `.double` box and its `.double__img` layers.             |
| `img/`                      | The images (`1.jpg`–`12.jpg`, 800×610), generated with Midjourney. Effects from XII on reuse the earlier rows' images, from the top. |

## How a page works

Each effect is a `<div class="double" data-effect="N" style="background-image:url(img/X.jpg)">`. The effect class reads that background image, clears it, and fills the div with stacked `.double__img` copies of the same image (2 to 9; the WebGL effects use one copy and a canvas, see below) (all in grid area `1 / 1 / -1 / -1`). The last copy is on top and covers the rest; hovering clips it away to show the copies underneath, which usually have their own transform or filter.

An effect class looks like this:

```js
export class FxN {
    DOM = {
        el: null
    }
    constructor(DOM_el) {
        this.DOM.el = DOM_el;
        this.layout();
    }
    layout() {
        // read the background image, build `iterations` copies, keep references, set the copies' starting state
    }
    mouseenter(ev) {
        // kill this.leaveTimeout, then build this.enterTimeout
    }
    mouseleave(ev) {
        // kill this.enterTimeout, then build this.leaveTimeout, ending with willChange: 'auto'
    }
}
```

- In the newer effects (XII on), every part of a timeline shares the same start, end and ease. Their richness comes from layers and shapes, not from staggering.
- `mouseenter()` and `mouseleave()` each kill the other's timeline first, so a quick in and out never leaves a copy stuck halfway. The original effects (I–XI) restart from their `fromTo` values; the newer ones (XII on) use `.to()` from wherever the other timeline stopped, so they never jump.
- A clip that can't be written as a CSS string tween (XII's turning rectangle, XIII's hole and XV's rings, cut out with `polygon(evenodd, …)`) is a plain object tweened by GSAP, with an `onUpdate` that writes a px `polygon()`. The leave timeline sets `clipPath: 'none'` at the end, so a resize can't leave a stale px shape.
- Timelines set `willChange` (`clip-path` or `filter`) at the start, and the leave timeline resets it to `'auto'` on everything it touched as its last step.
- Effects don't handle input themselves. `DoubleImageEffect` calls them on `mouseenter`/`mouseleave` (passing the mouse event, which XIII uses for the pointer's position) and on keyboard focus (no event; `:focus-visible` only, so a click doesn't replay it) and `blur`, and an `isActive` flag stops a hover and a focus from playing it twice.
- With `prefers-reduced-motion: reduce`, `DoubleImageEffect` doesn't call the effect at all: it fades every copy above the first to opacity 0 (and back) in 0.3s. `js/index.js` also skips Lenis then, so scrolling is native.
- If an effect's copy underneath would look wrong in that crossfade (XV's over-bright glow), its `layout()` checks reduced motion once and rests that copy at the effect's final state instead.
- To add an effect: write `js/fx<N>.js` with that shape, import it in `js/doubleImageEffect.js` and add it to `classMap`, then add a `.content` row to `index.html` with `data-effect="<N>"`, the next numeral, and `tabindex="0" role="img" aria-label="Hover effect <numeral>"` on the `.double`, and the same `.double` (same image) at the end of the `.grid` below the rows. Every effect works at any size: keep the box at `aspect-ratio: 4 / 2.5` (XV's rings rely on it).

| #   | File       | Copies | What it does                                                                                              |
| --- | ---------- | ------ | --------------------------------------------------------------------------------------------------------- |
| I   | `fx1.js`   | 2      | The top copy wipes off to the left; the one underneath (scaled 1.15) settles from a bright, hue-shifted flash. |
| II  | `fx2.js`   | 2      | Wipes off to the right; the copy underneath zooms from 1 to 1.3 out of a bright hue-shifted flash.        |
| III | `fx3.js`   | 2      | Collapses down to its bottom edge in six steps (`steps(6)`), showing a mirrored, saturated copy at 0.97.  |
| IV  | `fx4.js`   | 3      | Collapses upwards while a blurred, saturated middle copy and the bottom copy shake (`elastic.inOut(5)`): the glitch. |
| V   | `fx5.js`   | 2      | A circle closes to the center; the copy underneath scales from 1.5 to 1.3 out of a bright flash.          |
| VI  | `fx6.js`   | 2      | A circle closes (`expo`); the copy underneath zooms from a dark, high-contrast hue shift. Leaving turns it black at scale 3.3. |
| VII | `fx7.js`   | 2      | A circle closes into the top-right corner; the copy underneath rotates back from 3° and comes out of black.   |
| VIII| `fx8.js`   | 3      | The top copy, then a mirrored middle copy, wipe off to the left, each copy flashing bright as it's revealed. |
| IX  | `fx9.js`   | 2      | Cut away along the diagonal; the copy underneath unskews from 15° and scales from 2 to 1.1 out of a flash. |
| X   | `fx10.js`  | 5      | Four quarter copies wipe away one after another, showing a saturated copy at 1.3.                |
| XI  | `fx11.js`  | 5      | The same quarters in `steps(3)` and another order, showing a hue-rotated copy at 0.9.                     |
| XII | `fx12.js`  | 2      | The top copy turns 60° and shrinks into the center; the copy underneath turns back from −10° and from a bronze tone into color, settling at 1.15. Every part starts and ends together. |
| XIII| `fx13.js`  | 2      | A soft-edged hole opens from where the pointer comes in (the center for a keyboard focus) and grows until the cover is gone; through it the copy underneath zooms from 1.3 to 1.15 around that point and settles from a light-washed tone. It closes on the point where the pointer leaves. |
| XIV | `fx14.js`  | 3      | The cover narrows from both sides to a vertical line at the center; underneath, a gray and a bronze copy (60% over it) start 6% out of register and slide together, the bronze one fading and the gray one regaining its color, at 1.15. |
| XV  | `fx15.js`  | 5      | Three ring copies (the center disc and two rings) turn against each other (150°, −100°, 60°) and thin away from their inner edges while fading, over a cover that opens from the center; underneath, a glowing copy (brightness 180%) settles into the picture at 1.15. |
| XVI | `fx16.js`  | 9      | The cover breaks along its diagonals into four triangles that slide out (up, right, down, left), darkening; underneath, four triangle facets each zoom, shift and tone their copy on their own (through `background-size`/`-position`, so the triangles stay put) and converge into the picture at 1.15. A hidden full copy at the bottom is what the reduced motion crossfade shows. |
| XVII| `fx17.js`  | 3      | Five soft-edged cells open across the picture and grow into each other (one `polygon()` for all of them, joined by out-and-back lines, so they add up); inside, the picture settles from a bright flash to 1.15, ringed by a bronze copy just outside each cell's edge; the cover recedes, darkening. |
| XVIII| `fx18.js` | WebGL  | The picture waves (two slow swells with smaller ripples on top, strongest halfway) while it stretches to 1.15 along a band that crosses from where the pointer came in, bent by the same waves; red and blue come slightly apart where it bends. |

## WebGL conventions (XVIII on)

- Each WebGL effect keeps one `.double__img` (the fallback, and what shows if WebGL fails) and adds a `GLImage`, whose canvas (`.double__gl`) sits over it in the same grid area.
- The canvas draws only when asked: once the texture loads, on resize (a `ResizeObserver`) and from the effect's GSAP tweens (`onUpdate: () => this.gl.render()`). There's no render loop.
- One uniform, `uProgress` (0 to 1), drives the whole effect, tweened in `mouseenter`/`mouseleave` with one duration and ease, so every part moves together. At 0 the shader must draw the picture exactly as the HTML does (no color management: `LinearSRGBColorSpace` in and out), and at 1 the picture at its end size (1.15).
- The look lives in a `SETTINGS` object at the top of the effect's file, one commented value per line. `GLImage` turns each into a uniform named after it (`bend` → `uBend`), which the shader declares. Durations and eases stay in the timelines, as in I–XVII.
- The texture mirrors at its edges (`MirroredRepeatWrapping`), so a warp that reaches past them finds the image mirrored, not a smear. Sample through `coverUv(uv, zoom)`.
- Where the effect changes size, it does it through a smooth field (a band or a radius that crosses the image), never a hard edge, so no seam shows.

## Style

- JavaScript: four-space indentation, ES classes with class fields (`DOM = { … }`), references kept on `this.DOM`, spaces inside `if ( … )` parentheses. Timelines are one chain: `gsap.timeline({ defaults })` then `.set(…)` for `willChange`, then `.fromTo`/`.to` with numeric or label positions. Mostly single quotes. Comments are short and sparse.
- HTML and CSS use tabs. The CSS is flat (no nesting), with the colors and padding as custom properties on `:root`.
- No build tooling and no new dependencies unless asked.

## Ask before changing

- The page's `<title>`, meta description, keywords and the social tags.
- The frame's Article and GitHub links and its tags, and the credits.
- The images, and the eleven effects, which are the author's own.
