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

export class DoubleImageEffect {
    DOM = {
        el: null
    }
    effects = {
        '1': 'Fx1',
        '2': 'Fx2',
        '3': 'Fx3',
        '4': 'Fx4',
        '5': 'Fx5',
        '6': 'Fx6',
        '7': 'Fx7',
        '8': 'Fx8',
        '9': 'Fx9',
        '10': 'Fx10',
        '11': 'Fx11',
    };
    classMap = {Fx1,Fx2,Fx3,Fx4,Fx5,Fx6,Fx7,Fx8,Fx9,Fx10,Fx11};

    constructor(DOM_el) {
        this.DOM.el = DOM_el;
        this.effectName = this.effects[this.DOM.el.dataset.effect] || 'Fx1';
        this.effect = new this.classMap[this.effectName](this.DOM.el);
        this.initEvents();
    }
    initEvents() {
        this.DOM.el.addEventListener('mouseenter', () => { 
            this.effect.mouseenter();
        });

        this.DOM.el.addEventListener('mouseleave', () => {
            this.effect.mouseleave();
        });
    }
}