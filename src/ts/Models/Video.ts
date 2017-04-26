import { IAsset, Asset } from 'Models/Asset';

export interface IVideo extends IAsset {
    size: number | undefined;
    started: boolean;
    errorStatus: boolean;
    duration: number;
    position: number;
    positionRepeats: number;
    quartile: number;
    active: boolean;
}

export class Video extends Asset<IVideo> {

    constructor(url: string, size?: number) {
        super({
            url: ['string'],
            cachedUrl: ['string', 'undefined'],
            fileId: ['string', 'undefined'],
            size: ['number', 'undefined'],
            started: ['boolean'],
            errorStatus: ['boolean'],
            duration: ['number'],
            position: ['number'],
            positionRepeats: ['number'],
            quartile: ['number'],
            active: ['boolean']
        }, url);
    }

    public getSize() {
        return this.get('size');
    }

    public hasStarted() {
        return this.get('started');
    }

    public setStarted(started: boolean) {
        this.set('started', started);
    }

    public getErrorStatus() {
        return this.get('errorStatus');
    }

    public setErrorStatus(status: boolean) {
        this.set('errorStatus', status);
    }

    public getDuration() {
        return this.get('duration');
    }

    public setDuration(duration: number) {
        this.set('duration', duration);
    }

    public getPosition() {
        return this.get('position');
    }

    public setPosition(position: number) {
        this.set('position', position);
        if(this.get('duration')) {
            this.set('quartile', Math.floor((this.get('position') * 4) / this.get('duration')));
        }
    }

    public getPositionRepeats() {
        return this.get('positionRepeats');
    }

    public setPositionRepeats(repeats: number) {
        this.set('positionRepeats', repeats);
    }

    public getQuartile() {
        return this.get('quartile');
    }

    public setQuartile(quartile: number) {
        this.set('quartile', quartile);
    }

    public isActive() {
        return this.get('active');
    }

    public setActive(active: boolean) {
        this.set('active', active);
    }

    public getDTO(): { [key: string]: any } {
        return {
            'asset': super.getDTO(),
            'size': this.get('size'),
            'started': this.get('started'),
            'errorStatus': this.get('errorStatus'),
            'duration': this.get('duration'),
            'position': this.get('position'),
            'positionRepeats': this.get('positionRepeats'),
            'quartile': this.get('quartile'),
            'active': this.get('active')
        };
    }
}
