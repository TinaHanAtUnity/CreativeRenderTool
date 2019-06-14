import { IVastCreativeCompanionAd, VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';
import { Model } from 'Core/Models/Model';

interface IVastCompanionAdIFrameResource extends IVastCreativeCompanionAd {
    iframeResourceURL: string | null;
}

export class VastCompanionAdIFrameResource extends Model<IVastCompanionAdIFrameResource> {

    constructor(id: string | null, iframeResourceURL?: string | null) {
        super('VastCreativeCompanionAd', {
            id: ['string', 'null'],
            type: ['string'],
            iframeResourceURL: ['string']
        });

        this.set('id', id || null);
        this.set('type', VastCompanionAdType.IFRAME);
        this.set('iframeResourceURL', iframeResourceURL || null);
    }

    public getId(): string | null {
        return this.get('id');
    }

    public getType(): VastCompanionAdType {
        return this.get('type');
    }

    public getIframeResourceURL(): string | null {
        return this.get('iframeResourceURL');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'id': this.getId(),
            'type': this.getType(),
            'iframeResourceURL': this.getIframeResourceURL()
        };
    }
}
