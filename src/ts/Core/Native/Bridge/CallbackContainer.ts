export class CallbackContainer<T> {

    public readonly resolve: (value?: T | PromiseLike<T>) => void;
    public readonly reject: (reason?: unknown) => void;

    constructor(resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: unknown) => void) {
        this.resolve = resolve;
        this.reject = reject;
    }

}
