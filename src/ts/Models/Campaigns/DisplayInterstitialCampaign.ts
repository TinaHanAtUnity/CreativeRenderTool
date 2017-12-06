import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import {ISchema} from "../Model";
import {Session} from "../Session";

export interface IDisplayInterstitialCampaign extends ICampaign {
    clickThroughUrl: string | undefined;
    tracking: object | undefined;
}

export class DisplayInterstitialCampaign<V extends IDisplayInterstitialCampaign> extends Campaign<V> {
    public static Schema: ISchema<IDisplayInterstitialCampaign> = {
        ... Campaign.Schema,
        clickThroughUrl: ['string', 'undefined'],
        tracking: ['object', 'undefined']
    };

    constructor(clazz: string, schema: ISchema<V>, session: Session, gamerId: string, abGroup: number, cacheTTL: number | undefined, tracking?: { [eventName: string]: string[] }, adType?: string, creativeId?: string, seatId?: number, correlationId?: string) {
        super(clazz, schema);
        if(cacheTTL) {
            this.set('willExpireAt', Date.now() + cacheTTL * 1000);
        }
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('seatId', seatId || undefined);
        this.set('tracking', tracking || undefined);
        this.set('session', session);
    }

    public getClickThroughUrl(): string | undefined {
        return this.get('clickThroughUrl');
    }

    public setClickThroughUrl(clickThroughUrl: string) {
        this.set('clickThroughUrl', clickThroughUrl);
    }

    public getTrackingUrlsForEvent(eventName: string): string[] {
        const tracking = this.get('tracking');
        if (tracking) {
            return tracking[eventName] || [];
        }
        return [];
    }

    public getRequiredAssets(): Asset[] {
        return [];
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }

    public isConnectionNeeded(): boolean {
        return false;
    }
}
