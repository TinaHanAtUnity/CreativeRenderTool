import { Asset } from 'Models/Asset';

export class Video extends Asset {

    private readonly _size: number | undefined;
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

    public getSize() {
        return this._size;
    }

    public hasStarted() {
        return this._started;
    }

    public setStarted(started: boolean) {
        this._started = started;
    }

    public getErrorStatus() {
        return this._errorStatus;
    }

    public setErrorStatus(status: boolean) {
        this._errorStatus = status;
    }

    public getDuration() {
        return this._duration;
    }

    public setDuration(duration: number) {
        this._duration = duration;
    }

    public getPosition() {
        return this._position;
    }

    public setPosition(position: number) {
        this._position = position;
        if(this._duration) {
            this._quartile = Math.floor((this._position * 4) / this._duration);
        }
    }

    public getPositionRepeats() {
        return this._positionRepeats;
    }

    public setPositionRepeats(repeats: number) {
        this._positionRepeats = repeats;
    }

    public getQuartile() {
        return this._quartile;
    }

    public setQuartile(quartile: number) {
        this._quartile = quartile;
    }

    public isActive() {
        return this._active;
    }

    public setActive(active: boolean) {
        this._active = active;
    }

    public getDTO(): { [key: string]: any } {
        return {
            'asset': super.getDTO(),
            'size': this._size,
            'started': this._started,
            'errorStatus': this._errorStatus,
            'duration': this._duration,
            'position': this._position,
            'positionRepeats': this._positionRepeats,
            'quartile': this._quartile,
            'active': this._active
        };
    }
}
