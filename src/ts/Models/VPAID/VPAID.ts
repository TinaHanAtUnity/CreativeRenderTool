import { Vast } from "Models/Vast/Vast";
import { VastMediaFile } from "Models/Vast/VastMediaFile";
import { VastCreativeLinear } from "Models/Vast/VastCreativeLinear";

export class VPAID {
    private vast: Vast;
    private mediaFile: VastMediaFile;

    constructor(mediaFile: VastMediaFile, vast: Vast) {
        this.vast = vast;
        this.mediaFile = mediaFile;
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
