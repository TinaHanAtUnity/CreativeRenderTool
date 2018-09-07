export class CallbackContainer<T> {

    public readonly resolve: (value?: T | PromiseLike<T>) => void;
    public readonly reject: (reason?: any) => void;

    constructor(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) {
        this.resolve = resolve;
        this.reject = reject;
    }

}
