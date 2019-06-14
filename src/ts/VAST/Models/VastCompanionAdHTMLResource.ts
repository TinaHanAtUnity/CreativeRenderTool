import { IVastCreativeCompanionAd, VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';
import { Model } from 'Core/Models/Model';

interface IVastCompanionAdHTMLResource extends IVastCreativeCompanionAd {
    htmlResourceContent: string | null;
}

export class VastCompanionAdHTMLResource extends Model<IVastCompanionAdHTMLResource> {

    constructor(id: string | null, htmlResourceURL?: string | null) {
        super('VastCreativeCompanionAd', {
            id: ['string', 'null'],
            type: ['string'],
            htmlResourceContent: ['string', 'null']
        });

        this.set('id', id || null);
        this.set('type', VastCompanionAdType.HTML);
        this.set('htmlResourceContent', htmlResourceURL || null);
    }

    public getId(): string | null {
        return this.get('id');
    }

    public getType(): VastCompanionAdType {
        return this.get('type');
    }

    public getHtmlResourceContent(): string | null {
        return this.get('htmlResourceContent');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'id': this.getId(),
            'type': this.getType(),
            'htmlResourceContent': this.getHtmlResourceContent()
        };
    }
}
