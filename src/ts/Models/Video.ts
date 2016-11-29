import { Asset } from 'Models/Asset';

export class Video extends Asset {

    private _size: number | undefined;

    constructor(url: string, size?: number) {
        super(url);
        this._size = size;
    }

}
