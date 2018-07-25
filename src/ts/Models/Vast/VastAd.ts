import { IVastCreative, VastCreative } from 'Models/Vast/VastCreative';
import { VastCreativeLinear } from 'Models/Vast/VastCreativeLinear';
import { VastCreativeCompanionAd } from 'Models/Vast/VastCreativeCompanionAd';
import { Model } from 'Models/Model';

interface IVastAd {
    id: string | null;
    creatives: Array<VastCreative>;
    companionAds: VastCreativeCompanionAd[];
    errorURLTemplates: string[];
    impressionURLTemplates: string[];
    wrapperURLs: string[];
}

export class VastAd extends Model<IVastAd> {

    constructor();
    constructor(id?: string, creatives?: Array<VastCreative>, errorURLTemplates?: string[], impressionURLTemplates?: string[], wrapperURLs?: string[], companionAds?: VastCreativeCompanionAd[]) {
        super('VastAd', {
            id: ['string', 'null'],
            creatives: ['array'],
            companionAds: ['array'],
            errorURLTemplates: ['array'],
            impressionURLTemplates: ['array'],
            wrapperURLs: ['array']
        });

        this.set('id', id || null);
        this.set('creatives', creatives || []);
        this.set('companionAds', companionAds || []);
        this.set('errorURLTemplates', errorURLTemplates || []);
        this.set('impressionURLTemplates', impressionURLTemplates || []);
        this.set('wrapperURLs', wrapperURLs || []);
    }

    public getId(): string | null {
        return this.get('id');
    }

    public setId(id: string | null) {
        this.set('id', id);
    }

    public getCreatives(): Array<VastCreative> {
        return this.get('creatives');
    }

    public getCreative(): VastCreative | null {
        if (this.getCreatives() && this.getCreatives().length > 0) {
            return this.getCreatives()[0];
        }

        return null;
    }

    public addCreative(creative: VastCreative) {
        this.get('creatives').push(creative);
    }

    public getCompanionAds(): VastCreativeCompanionAd[] {
        return this.get('companionAds');
    }

    public addCompanionAd(companionAd: VastCreativeCompanionAd) {
        this.get('companionAds').push(companionAd);
    }

    public getErrorURLTemplates(): string[] {
        return this.get('errorURLTemplates');
    }

    public addErrorURLTemplate(errorURLTemplate: string) {
        this.get('errorURLTemplates').push(errorURLTemplate);
    }

    public getImpressionURLTemplates(): string[] {
        return this.get('impressionURLTemplates');
    }

    public addImpressionURLTemplate(impressionURLTemplate: string) {
        this.get('impressionURLTemplates').push(impressionURLTemplate);
    }

    public getWrapperURL(): string {
        return this.get('wrapperURLs')[0];
    }

    public getWrapperURLs(): string[] {
        return this.get('wrapperURLs');
    }

    public addWrapperURL(url: string) {
        this.get('wrapperURLs').push(url);
    }

    public getTrackingEventUrls(eventName: string) {
        const creative = this.getCreative();
        if (creative) {
            if (creative.getTrackingEvents()) {
                return creative.getTrackingEvents()[eventName];
            }
        }
        return null;
    }

    public getDuration(): number | null {
        const creative = this.getCreative();
        if (creative) {
            return creative.getDuration();
        } else {
            return null;
        }
    }

    public getVideoClickThroughURLTemplate(): string | null {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            return creative.getVideoClickThroughURLTemplate();
        }
        return null;
    }

    public getVideoClickTrackingURLTemplates(): string[] {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            return creative.getVideoClickTrackingURLTemplates();
        }
        return [];
    }

    public addVideoClickTrackingURLTemplate(videoClickTrackingURL: string) {
        const creative = this.getCreative();
        if (creative instanceof VastCreativeLinear) {
            creative.addVideoClickTrackingURLTemplate(videoClickTrackingURL);
        }
    }

    public getDTO(): { [key: string]: any } {
        const vastCreatives = [];
        for (const vastCreative of this.get('creatives')) {
            vastCreatives.push(vastCreative.getDTO());
        }

        const companionAds = [];
        for (const companionAd of this.get('companionAds')) {
            companionAds.push(companionAd.getDTO());
        }

        return {
            'id': this.getId(),
            'errorURLTemplates': this.getErrorURLTemplates(),
            'impressionURLTemplates': this.getImpressionURLTemplates(),
            'wrapperURLs': this.getWrapperURLs(),
            'vastCreatives': vastCreatives,
            'companionAds': companionAds
        };
    }

    public getCompanionCreativeViewTrackingUrls(): string[] {
        return this.getCompanionEventTrackingUrls('creativeView');
    }

    private getCompanionEventTrackingUrls(eventType: string): string[] {
        let urls: string[] = [];
        const companions = this.getCompanionAds();

        for (const companion of companions) {
            urls = urls.concat(companion.getEventTrackingUrls(eventType));
        }

        return urls;
    }
}
