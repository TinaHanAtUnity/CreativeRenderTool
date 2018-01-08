import { Campaign, ICampaign } from 'Models/Campaign';
import { Asset } from 'Models/Assets/Asset';
import { ISchema } from 'Models/Model';

export interface IDisplayInterstitialCampaign extends ICampaign {
    clickThroughUrl: string | undefined;
    tracking: object | undefined;
}

export abstract class DisplayInterstitialCampaign<T extends IDisplayInterstitialCampaign = IDisplayInterstitialCampaign> extends Campaign<T> {
    public static Schema: ISchema<IDisplayInterstitialCampaign> = {
        ... Campaign.Schema,
        clickThroughUrl: ['string', 'undefined'],
        tracking: ['object', 'undefined']
    };

    constructor(classname: string, schema: ISchema<T>, campaign: IDisplayInterstitialCampaign) {
        super(classname, schema);

        this.set('willExpireAt', campaign.willExpireAt);
        this.set('gamerId', campaign.gamerId);
        this.set('abGroup', campaign.abGroup);
        this.set('adType', campaign.adType);
        this.set('correlationId', campaign.correlationId);
        this.set('creativeId', campaign.creativeId);
        this.set('seatId', campaign.seatId);
        this.set('tracking', campaign.tracking);
        this.set('session', campaign.session);
        this.set('useWebViewUserAgentForTracking', campaign.useWebViewUserAgentForTracking);
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
            return (<any>tracking)[eventName] || [];
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
