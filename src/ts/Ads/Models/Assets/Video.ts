import { Asset, IAsset } from 'Ads/Models/Assets/Asset';
import { Session } from 'Ads/Models/Session';

export interface IVideo extends IAsset {
    fileSize: number | undefined;
    width: number;
    height: number;
    duration: number;
    position: number;
    positionRepeats: number;
    quartile: number;
    started: boolean;
}

export class Video extends Asset<IVideo> {
    constructor(url: string, session: Session, size?: number, creativeId?: string, width?: number, height?: number) {
        super('Video', session, {
            ... Asset.Schema,
            fileSize: ['number', 'undefined'],
            width: ['number'],
            height: ['number'],
            duration: ['number'],
            position: ['number'],
            positionRepeats: ['number'],
            quartile: ['number'],
            started: ['boolean'],
            creativeId: ['string', 'undefined']
        });

        this.set('url', url);
        this.set('fileSize', size);
        this.set('width', 0);
        this.set('height', 0);
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

    public getFileSize(): number | undefined {
        return this.get('fileSize');
    }

    public getWidth(): number {
        return this.get('width');
    }

    public getHeight(): number {
        return this.get('height');
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

    public getDTO(): { [key: string]: unknown } {
        return {
            'asset': super.getDTO(),
            'fileSize': this.getFileSize(),
            'width': this.getWidth(),
            'height': this.getHeight(),
            'duration': this.getDuration(),
            'position': this.getPosition(),
            'positionRepeats': this.getPositionRepeats(),
            'quartile': this.getQuartile()
        };
    }
}
