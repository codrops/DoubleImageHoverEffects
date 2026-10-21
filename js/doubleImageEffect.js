import { Fx1 } from './fx1.js';
import { Fx2 } from './fx2.js';
import { Fx3 } from './fx3.js';
import { Fx4 } from './fx4.js';
import { Fx5 } from './fx5.js';
import { Fx6 } from './fx6.js';
import { Fx7 } from './fx7.js';
import { Fx8 } from './fx8.js';
import { Fx9 } from './fx9.js';
import { Fx10 } from './fx10.js';
import { Fx11 } from './fx11.js';
import { Fx12 } from './fx12.js';
import { Fx13 } from './fx13.js';
import { Fx14 } from './fx14.js';
import { Fx15 } from './fx15.js';
import { Fx16 } from './fx16.js';
import { Fx17 } from './fx17.js';
import { Fx18 } from './fx18.js';
import { Fx19 } from './fx19.js';

export class DoubleImageEffect {
    DOM = {
        el: null
    }
    classMap = {Fx1,Fx2,Fx3,Fx4,Fx5,Fx6,Fx7,Fx8,Fx9,Fx10,Fx11,Fx12,Fx13,Fx14,Fx15,Fx16,Fx17,Fx18,Fx19};
    // Whether the effect is showing, so a hover and a focus don't play it twice
    isActive = false;

    constructor(DOM_el) {
        this.DOM.el = DOM_el;
        const EffectClass = this.classMap[`Fx${this.DOM.el.dataset.effect}`] || Fx1;
        this.effect = new EffectClass(this.DOM.el);
        this.initEvents();
    }
    // ev: the mouse event, if there is one (a keyboard focus has none)
    enter(ev) {
        if ( this.isActive ) return;
        this.isActive = true;

        // Reduced motion: a short crossfade to the image underneath instead of the effect
        if ( window.matchMedia('(prefers-reduced-motion: reduce)').matches ) {
            gsap.to(this.DOM.el.querySelectorAll('.double__img:not(:first-child)'), {
                duration: 0.3,
                opacity: 0,
                overwrite: true
            });
            return;
        }
        this.effect.mouseenter(ev);
    }
    leave(ev) {
        if ( !this.isActive ) return;
        this.isActive = false;

        if ( window.matchMedia('(prefers-reduced-motion: reduce)').matches ) {
            gsap.to(this.DOM.el.querySelectorAll('.double__img:not(:first-child)'), {
                duration: 0.3,
                opacity: 1,
                overwrite: true
            });
            return;
        }
        this.effect.mouseleave(ev);
    }
    initEvents() {
        this.DOM.el.addEventListener('mouseenter', ev => {
            this.enter(ev);
        });

        this.DOM.el.addEventListener('mouseleave', ev => {
            this.leave(ev);
        });

        // Keyboard: the same effect while the image has focus (a click focuses it too, so only keyboard focus counts)
        this.DOM.el.addEventListener('focus', () => {
            if ( this.DOM.el.matches(':focus-visible') ) {
                this.enter();
            }
        });

        this.DOM.el.addEventListener('blur', () => {
            this.leave();
        });
    }
}