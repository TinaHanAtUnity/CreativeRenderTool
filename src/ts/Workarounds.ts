/* tslint:disable */

if(!Function.prototype.bind) {
    Function.prototype.bind = function (self: Object): Function {
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        let args: any[] = Array.prototype.slice.call(arguments, 1);
        let toBind: any = this;
        let noop: Function = (): void => {};
        let bound: Function = () => {
            return toBind.apply(this instanceof noop ? this : self, args.concat(Array.prototype.slice.call(arguments)));
        };
        if (this.prototype) {
            noop.prototype = this.prototype;
        }
        bound.prototype = new noop();
        return bound;
    };
}
