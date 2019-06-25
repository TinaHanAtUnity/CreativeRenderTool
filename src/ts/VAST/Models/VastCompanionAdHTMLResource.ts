import { IVastCreativeCompanionAd, VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';
import { Model } from 'Core/Models/Model';

interface IVastCompanionAdHTMLResource extends IVastCreativeCompanionAd {
    htmlResourceContent: string | null;
}

export class VastCompanionAdHTMLResource extends Model<IVastCompanionAdHTMLResource> {

    constructor(id: string | null, height: number, width: number, htmlResourceURL?: string | null) {
        super('VastCompanionAdHTMLResource', {
            id: ['string', 'null'],
            type: ['string'],
            width: ['number'],
            height: ['number'],
            htmlResourceContent: ['string', 'null']
        });

        this.set('id', id || null);
        this.set('type', VastCompanionAdType.HTML);
        this.set('width', width);
        this.set('height', height);
        this.set('htmlResourceContent', htmlResourceURL || null);
    }

    public getId(): string | null {
        return this.get('id');
    }

    public getType(): VastCompanionAdType {
        return this.get('type');
    }

    public setHtmlResourceContent(htmlContent: string) {
        this.set('htmlResourceContent', htmlContent);
    }

    public getHtmlResourceContent(): string | null {
        return this.get('htmlResourceContent');
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
            'width': this.getWidth(),
            'height': this.getHeight(),
            'type': this.getType(),
            'htmlResourceContent': this.getHtmlResourceContent()
        };
    }
}
