import 'es6-promise';
import { DOMUtils } from 'Utilities/DOMUtils';

/* tslint:disable:no-unused-expression */

if(!Array.prototype.forEach) {
    Array.prototype.forEach = <any>function(this: any, callback: () => any, thisArg: any) {
        if(typeof(callback) !== 'function') {
            throw new TypeError(callback + ' is not a function!');
        }
        const len = this.length;
        for(let i = 0; i < len; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

if(!Number.isInteger) {
    Number.isInteger = function(value: any) {
        return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
    };
}

if(!('classList' in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function(this: HTMLElement) {
            const self = this;

            function update(fn: (classes: string[], index: number, value?: string) => any) {
                return function(value: string) {
                    const classes = self.className.split(/\s+/);
                    const index = classes.indexOf(value);
                    fn(classes, index, value);
                    self.className = classes.join(' ');
                };
            }

            const ret = {
                add: update(function(classes: string[], index: number, value?: string) {
                    ~index || value && classes.push(value);
                }),

                remove: update(function(classes: string[], index: number) {
                    ~index && classes.splice(index, 1);
                }),

                toggle: update(function(classes: string[], index: number, value?: string) {
                    ~index ? classes.splice(index, 1) : value && classes.push(value);
                }),

                contains: function(value: string) {
                    return !!~self.className.split(/\s+/).indexOf(value);
                },

                item: function(i: number) {
                    return self.className.split(/\s+/)[i] || null;
                }
            };

            Object.defineProperty(ret, 'length', {
                get: function() {
                    return self.className.split(/\s+/).length;
                }
            });

            return ret;
        }
    });
}

// In certain versions of Android, we found that DOMParser might not support
// parsing text/html mime types.

// tslint:disable:no-empty

(function(DOMParser) {

    // Firefox/Opera/IE throw errors on unsupported types
    try {
        // WebKit returns null on unsupported types
        if ((new DOMParser()).parseFromString('', 'text/html')) {
            // text/html parsing is natively supported
            return;
        }
    } catch (ex) {
    }

    DOMParser.prototype.parseFromString = DOMUtils.parseFromString;

}(DOMParser));

// tslint:enable:no-empty

/* tslint:enable:no-unused-expression */
