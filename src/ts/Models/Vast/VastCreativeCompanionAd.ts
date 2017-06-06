import { Model } from 'Models/Model';

interface IVastCreativeCompanionAd {
    id: string | null;
    width: number;
    height: number;
    type: string;
    staticResourceURL: string | null;
    creativeType: string | null;
    companionClickThroughURLTemplate: string | null;
}

export class VastCreativeCompanionAd extends Model<IVastCreativeCompanionAd> {
    constructor(id: string, creativeType: string, height: number, width: number, staticResourceURL: string, companionClickThroughURLTemplate: string) {
        super('VastCreativeCompanionAd', {
            id: ['string', 'null'],
            width: ['number'],
            height: ['number'],
            type: ['string'],
            staticResourceURL: ['string', 'null'],
            creativeType: ['string', 'null'],
            companionClickThroughURLTemplate: ['string', 'null']
        });

        this.set('id', id || null);
        this.set('width', width || 0);
        this.set('height', height || 0);
        this.set('type', '');
        this.set('creativeType', creativeType || null);
        this.set('staticResourceURL', staticResourceURL || null);
        this.set('companionClickThroughURLTemplate', companionClickThroughURLTemplate || null);
    }

    public getId(): string | null {
        return this.get('id');
    }

    public getCreativeType(): string | null {
        return this.get('creativeType');
    }

    public getType(): string {
        return this.get('type');
    }

    public getStaticResourceURL(): string | null {
        return this.get('staticResourceURL');
    }

    public getCompanionClickThroughURLTemplate(): string | null {
        return this.get('companionClickThroughURLTemplate');
    }

    public getHeight(): number {
        return this.get('height');
    }

    public getWidth(): number {
        return this.get('width');
    }

    public getDTO(): { [key: string]: any } {
        return {
            'id': this.getId(),
            'width': this.getWidth(),
            'height': this.getHeight(),
            'type': this.getType(),
            'staticResourceURL': this.getStaticResourceURL(),
            'creativeType': this.getCreativeType(),
            'companionClickThroughURLTemplate': this.getCompanionClickThroughURLTemplate()
        };
    }
}
