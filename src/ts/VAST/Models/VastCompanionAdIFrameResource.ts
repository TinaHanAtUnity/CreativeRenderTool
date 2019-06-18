import { IVastCreativeCompanionAd, VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';
import { Model } from 'Core/Models/Model';

interface IVastCompanionAdIFrameResource extends IVastCreativeCompanionAd {
    iframeResourceURL: string | null;
}

export class VastCompanionAdIFrameResource extends Model<IVastCompanionAdIFrameResource> {

    constructor(id: string | null, height: number, width: number, iframeResourceURL?: string | null) {
        super('VastCompanionAdIFrameResource', {
            id: ['string', 'null'],
            type: ['string'],
            width: ['number'],
            height: ['number'],
            iframeResourceURL: ['string', 'null']
        });

        this.set('id', id || null);
        this.set('type', VastCompanionAdType.IFRAME);
        this.set('width', width);
        this.set('height', height);
        this.set('iframeResourceURL', iframeResourceURL || null);
    }

    public getId(): string | null {
        return this.get('id');
    }

    public getType(): VastCompanionAdType {
        return this.get('type');
    }

    public setIframeResourceURL(url: string) {
        this.set('iframeResourceURL', url);
    }

    public getIframeResourceURL(): string | null {
        return this.get('iframeResourceURL');
    }

    public getHeight(): number {
        return this.get('height');
    }

    public getWidth(): number {
        return this.get('width');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'id': this.getId(),
            'type': this.getType(),
            'iframeResourceURL': this.getIframeResourceURL()
        };
    }
}
