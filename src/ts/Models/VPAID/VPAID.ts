import { Vast } from 'Models/Vast/Vast';
import { VastMediaFile } from 'Models/Vast/VastMediaFile';
import { VastCreativeLinear } from 'Models/Vast/VastCreativeLinear';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';

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
        return !!this.getCompanionLandscapeUrl() && !!this.getCompanionPortraitUrl();
    }

    public hasCompanionAd(): boolean {
        const ad = this.vast.getAd();
        if (ad) {
            const companions = ad.getCompanionAds();
            return companions.length !== 0;
        }
        return false;
    }

    public getCompanion(): VastCreativeCompanionAd | null {
        const ad = this.vast.getAd();
        if (ad) {
            const companions = ad.getCompanionAds();
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

    public getCreativeParameters(): any {
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

    public getTrackingEventUrls(eventName: string) {
        return this.vast.getTrackingEventUrls(eventName);
    }

    public getImpressionUrls(): string[] | null {
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
