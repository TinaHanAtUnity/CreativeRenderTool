import { Vast } from 'Models/Vast/Vast';
import { Video } from 'Models/Assets/Video';
import { Asset } from 'Models/Assets/Asset';
import { Campaign, ICampaign } from 'Models/Campaign';
import { Image } from 'Models/Assets/Image';
import { Session } from 'Models/Session';

interface IVastCampaign extends ICampaign {
    vast: Vast;
    video: Video;
    hasEndscreen: boolean;
    portrait: Image | undefined;
    landscape: Image | undefined;
}

export class VastCampaign extends Campaign<IVastCampaign> {
    constructor(vast: Vast, campaignId: string, session: Session, gamerId: string, abGroup: number, cacheTTL?: number, tracking?: any, adType?: string, creativeId?: string, seatId?: number, correlationId?: string, advertiserCampaignId?: string, advertiserBundleId?: string, advertiserDomain?: string, appCategory?: string, appSubCategory?: string, useWebViewUserAgentForTracking?: boolean) {
        super('VastCampaign', {
            ... Campaign.Schema,
            vast: ['object'],
            video: ['object'],
            hasEndscreen: ['boolean'],
            portrait: ['object', 'undefined'],
            landscape: ['object', 'undefined']
        });

        const portraitUrl = vast.getCompanionPortraitUrl();
        let portraitAsset;
        if(portraitUrl) {
            portraitAsset = new Image(portraitUrl, session);
        }

        const landscapeUrl = vast.getCompanionLandscapeUrl();
        let landscapeAsset;
        if(landscapeUrl) {
            landscapeAsset = new Image(landscapeUrl, session);
        }
        this.set('vast', vast);
        this.set('video', new Video(vast.getVideoUrl(), session));
        this.set('hasEndscreen', !!vast.getCompanionPortraitUrl() || !!vast.getCompanionLandscapeUrl());
        this.set('portrait', portraitAsset);
        this.set('landscape', landscapeAsset);

        this.set('id', campaignId);
        this.set('session', session);
        this.set('gamerId', gamerId);
        this.set('abGroup', abGroup);
        this.set('useWebViewUserAgentForTracking', useWebViewUserAgentForTracking);
        const timeout = cacheTTL || 3600;
        this.set('willExpireAt', Date.now() + timeout * 1000);
        this.set('adType', adType || undefined);
        this.set('correlationId', correlationId || undefined);
        this.set('creativeId', creativeId || undefined);
        this.set('appCategory', appCategory || undefined);
        this.set('appSubCategory', appSubCategory || undefined);
        this.set('seatId', seatId || undefined);
        this.set('advertiserDomain', advertiserDomain || undefined);
        this.set('advertiserCampaignId', advertiserCampaignId || undefined);
        this.set('advertiserBundleId', advertiserBundleId || undefined);

        this.processCustomTracking(tracking);
    }

    public getVast(): Vast {
        return this.get('vast');
    }

    public getVideo() {
        if(!this.get('video')) {
            this.set('video', new Video(this.get('vast').getVideoUrl(), this.getSession()));
        }
        return this.get('video');
    }

    public getOriginalVideoUrl(): string {
        return this.get('vast').getVideoUrl() || '';
    }

    public getRequiredAssets(): Asset[] {
        return [
            this.get('video')
        ];
    }

    public getOptionalAssets(): Asset[] {
        return [];
    }

    public hasEndscreen(): boolean {
        return this.get('hasEndscreen');
    }

    public getLandscape(): Asset | undefined {
        return this.get('landscape');
    }

    public getPortrait(): Asset | undefined {
        return this.get('portrait');
    }

    public isConnectionNeeded(): boolean {
        return false;
    }

    public getDTO(): { [key: string]: any } {
        let portrait;
        const portraitAsset = this.get('portrait');
        if (portraitAsset) {
            portrait = portraitAsset.getDTO();
        }

        let landscape;
        const landscapeAsset = this.get('landscape');
        if (landscapeAsset) {
            landscape = landscapeAsset.getDTO();
        }

        return {
            'campaign': super.getDTO(),
            'vast': this.getVast().getDTO(),
            'video': this.getVast().getDTO(),
            'hasEndscreen': this.hasEndscreen(),
            'portrait': portrait,
            'landscape': landscape,
        };
    }

    private processCustomTracking(tracking: any) {
        if (tracking) {
            for (const trackingEventName in tracking) {
                if (tracking.hasOwnProperty(trackingEventName)) {
                    const urls = tracking[trackingEventName];
                    if (urls) {
                        urls.forEach((url: string) => {
                            this.getVast().addTrackingEventUrl(trackingEventName, url);
                        });
                    }
                }
            }
        }
    }
}
