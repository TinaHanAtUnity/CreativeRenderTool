import { Vast } from 'VAST/Models/Vast';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';

export class VPAID {
    private vast: Vast;
    private mediaFile: VastMediaFile;

    constructor(mediaFile: VastMediaFile, vast: Vast) {
        this.vast = vast;
        this.mediaFile = mediaFile;
    }

    public getCompanionClickThroughURL(): string | null {
        const companion = this.getCompanion();
        if (companion) {
            return companion.getCompanionClickThroughURLTemplate();
        }
        return null;
    }

    public hasEndScreen(): boolean {
        return !!this.getCompanionLandscapeUrl() || !!this.getCompanionPortraitUrl();
    }

    public hasCompanionAd(): boolean {
        const ad = this.vast.getAd();
        if (ad) {
            const companions = ad.getCompanionAdsStatic();
            return companions.length !== 0;
        }
        return false;
    }

    public getCompanion(): VastCompanionAdStaticResource | null {
        const ad = this.vast.getAd();
        if (ad) {
            const companions = ad.getCompanionAdsStatic();
            if (companions.length) {
                return companions[0];
            }
        }
        return null;
    }

    public getCompanionPortraitUrl(): string | null {
        return this.vast.getCompanionPortraitUrl();
    }
    public getCompanionLandscapeUrl(): string | null {
        return this.vast.getCompanionLandscapeUrl();
    }

    public getScriptUrl(): string {
        return this.mediaFile.getFileURL()!;
    }

    public getCreativeParameters(): string | null | {} {
        const ad = this.vast.getAd();
        if (ad) {
            const creative = <VastCreativeLinear>ad.getCreative();
            if (creative) {
                return creative.getAdParameters() || {};
            }
        }
        return {};
    }

    public getVideoClickTrackingURLs(): string[] {
        return this.vast.getVideoClickTrackingURLs() || [];
    }

    public getTrackingEventUrls(eventName: TrackingEvent) {
        return this.vast.getTrackingEventUrls(eventName);
    }

    public getImpressionUrls(): string[] {
        return this.vast.getImpressionUrls();
    }

    public addTrackingEventUrl(eventName: string, url: string) {
        this.vast.addTrackingEventUrl(eventName, url);
    }

    public getVideoClickThroughURL(): string | null {
        const url = this.vast.getVideoClickThroughURL();
        if (this.isValidURL(url)) {
            return url;
        } else {
            return null;
        }
    }

    private isValidURL(url: string | null): boolean {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }
}
