export class TimeoutError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class Promises {
    public static withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
        let timeoutID: number;
        const rejection = new Promise((resolve, reject) => {
            timeoutID = window.setTimeout(() => {
                reject(new TimeoutError(`Operation timed out after ${timeout} ms`));
            }, timeout);
        });
        return <Promise<T>>Promise.race([
            promise,
            rejection
        ]).then((result) => {
            window.clearTimeout(timeoutID);
            return result;
        });
    }

    /**
     * Converts a Promise<T> to Promise<void> because sometimes TypeScript types are a little
     * too strict.
     */
    public static voidResult<T>(promise: Promise<T>): Promise<void> {
        return promise.then(() => {return;});
    }
}
