import { Asset, IAsset } from 'Models/Assets/Asset';
import { Session } from 'Models/Session';

export interface IVideo extends IAsset {
    size: number | undefined;
    duration: number;
    position: number;
    positionRepeats: number;
    quartile: number;
    started: boolean;
    creativeId: string | undefined;
}

export class Video extends Asset<IVideo> {
    constructor(url: string, session: Session, size?: number, creativeId?: string) {
        super('Video', session, {
            ... Asset.Schema,
            size: ['number', 'undefined'],
            duration: ['number'],
            position: ['number'],
            positionRepeats: ['number'],
            quartile: ['number'],
            started: ['boolean'],
            creativeId: ['string', 'undefined']
        });

        this.set('url', url);
        this.set('size', size);
        this.set('duration', 0);
        this.set('position', 0);
        this.set('positionRepeats', 0);
        this.set('quartile', 0);
        this.set('started', false);
        this.set('creativeId', creativeId);
    }

    public getDescription(): string {
        return 'VIDEO';
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
        const duration = this.get('duration');
        if(duration) {
            this.set('quartile', Math.floor((this.get('position') * 4) / duration));
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

    public getCreativeId(): string | undefined {
        return this.get('creativeId');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'asset': super.getDTO(),
            'size': this.getSize(),
            'duration': this.getDuration(),
            'position': this.getPosition(),
            'positionRepeats': this.getPositionRepeats(),
            'quartile': this.getQuartile()
        };
    }
}
