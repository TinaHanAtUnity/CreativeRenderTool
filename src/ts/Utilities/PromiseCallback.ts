export class PromiseCallback {

    public resolve: Function;
    public reject: Function;

    constructor(resolve: Function, reject: Function) {
        this.resolve = resolve;
        this.reject = reject;
    }
}
