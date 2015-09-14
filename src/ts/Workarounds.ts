/* tslint:disable */

if(!Function.prototype.bind) {
    Function.prototype.bind = function (self: Object): Function {
        let args: any[] = Array.prototype.slice.call(arguments, 1);
        let toBind: any = this;
        let noop: any = function() {};
        let bound: Function = function() {
            return toBind.apply(this instanceof noop ? this : self, args.concat(Array.prototype.slice.call(arguments)));
        };
        if (this.prototype) {
            noop.prototype = this.prototype;
        }
        bound.prototype = new noop();
        return bound;
    };
}
