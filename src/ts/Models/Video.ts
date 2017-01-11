import { Asset } from 'Models/Asset';

export class Video extends Asset {

    private _size: number | undefined;
    private _started: boolean;
    private _errorStatus: boolean;
    private _duration: number;
    private _position: number;
    private _positionRepeats: number;
    private _quartile: number;
    private _active: boolean;

    constructor(url: string, size?: number) {
        super(url);
        this._size = size;
        this._started = false;
        this._errorStatus = false;
        this._duration = 0;
        this._position = 0;
        this._positionRepeats = 0;
        this._quartile = 0;
        this._active = true;
    }

}
