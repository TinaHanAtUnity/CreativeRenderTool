import 'es6-promise';

/* tslint:disable:no-unused-expression */

if(!('classList' in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function(this: HTMLElement) {
            const self = this;

            function update(fn: Function) {
                return function(value: string) {
                    const classes = self.className.split(/\s+/);
                    const index = classes.indexOf(value);
                    fn(classes, index, value);
                    self.className = classes.join(' ');
                };
            }

            const ret = {
                add: update(function(classes: string[], index: number, value: string) {
                    ~index || classes.push(value);
                }),

                remove: update(function(classes: string[], index: number) {
                    ~index && classes.splice(index, 1);
                }),

                toggle: update(function(classes: string[], index: number, value: string) {
                    ~index ? classes.splice(index, 1) : classes.push(value);
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

/* tslint:enable:no-unused-expression */
