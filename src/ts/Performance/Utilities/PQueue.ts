//
// NOTE! for the color tinting experiment only
//

export class PQueue<T> {
    private _arr: T[];
    private _comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this._arr = [];
        this._comparator = comparator;
    }

    public push(elem: T) {
        this._arr.push(elem);
        this._arr.sort(this._comparator);
    }

    public pop(): T | undefined {
        return this._arr.shift();
    }

    public size(): number {
        return this._arr.length;
    }
}
