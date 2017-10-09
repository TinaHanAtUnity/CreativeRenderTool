
export class Timer {
    private _func: () => void;
    private _duration: number;
    private _handle: number = -1;

    constructor(func: () => void, duration: number) {
        this._func = func;
        this._duration = duration;
    }

    public start() {
        if (this._handle === -1) {
            this._handle = window.setTimeout(() => {
                this._func();
            }, this._duration);
        }
    }

    public reset() {
        this.stop();
        this.start();
    }

    public stop() {
        window.clearTimeout(this._handle);
        this._handle = -1;
    }
}
