import { Asset, IAsset } from 'Ads/Models/Assets/Asset';
import { Session } from 'Ads/Models/Session';

export interface IFont extends IAsset {
    family: string;
    color: string;
    size: number;
}

export class Font extends Asset<IFont> {
    constructor(url: string, session: Session, family: string, color: string, size: number, creativeId?: string) {
        super('Font', session, {
            ... Asset.Schema,
            family: ['string'],
            color: ['string'],
            size: ['number']
        });

        this.set('url', url);
        this.set('creativeId', creativeId);
        this.set('family', family);
        this.set('color', color);
        this.set('size', size);
    }

    public getDescription(): string {
        return 'FONT';
    }

    public getFamily(): string {
        return this.get('family');
    }

    public getColor(): string {
        return this.get('color');
    }

    public getSize(): number {
        return this.get('size');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'family': this.getFamily(),
            'color': this.getColor(),
            'size': this.getSize(),
            'url': this.getUrl()
        };
    }
}
