import { Model } from 'Core/Models/Model';
import { VastCreative } from 'VAST/Models/VastCreative';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastCompanionAdIframeResource } from 'VAST/Models/VastCompanionAdIframeResource';
import { VastCompanionAdHTMLResource } from 'VAST/Models/VastCompanionAdHTMLResource';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';

interface IVastAd {
    id: string | null;
    creatives: VastCreative[];
    unsupportedCompanionAds: string[];
    staticCompanionAds: VastCompanionAdStaticResource[];
    iframeCompanionAds: VastCompanionAdIframeResource[];
    htmlCompanionAds: VastCompanionAdHTMLResource[];
    errorURLTemplates: string[];
    impressionURLTemplates: string[];
    wrapperURLs: string[];
    adVerifications: VastAdVerification[];
}

export class VastAd extends Model<IVastAd> {

    constructor();
    constructor(id: string, creatives: VastCreative[], errorURLTemplates: string[], impressionURLTemplates: string[], wrapperURLs: string[], staticCompanionAds: VastCompanionAdStaticResource[], unsupportedCompanionAds: string[], adVerifications: VastAdVerification[], iframeCompanionAds?: VastCompanionAdIframeResource[], htmlCompanionAds?: VastCompanionAdHTMLResource[]);
    constructor(id?: string, creatives?: VastCreative[], errorURLTemplates?: string[], impressionURLTemplates?: string[], wrapperURLs?: string[], staticCompanionAds?: VastCompanionAdStaticResource[], unsupportedCompanionAds?: string[], adVerifications?: VastAdVerification[], iframeCompanionAds?: VastCompanionAdIframeResource[], htmlCompanionAds?: VastCompanionAdHTMLResource[]) {
        super('VastAd', {
            id: ['string', 'null'],
            creatives: ['array'],
            staticCompanionAds: ['array'],
            iframeCompanionAds: ['array'],
            htmlCompanionAds: ['array'],
            errorURLTemplates: ['array'],
            impressionURLTemplates: ['array'],
            wrapperURLs: ['array'],
            unsupportedCompanionAds: ['array'],
            adVerifications: ['array']
        });

        this.set('id', id || null);
        this.set('creatives', creatives || []);
        this.set('staticCompanionAds', staticCompanionAds || []);
        this.set('iframeCompanionAds', iframeCompanionAds || []);
        this.set('htmlCompanionAds', htmlCompanionAds || []);
        this.set('errorURLTemplates', errorURLTemplates || []);
        this.set('impressionURLTemplates', impressionURLTemplates || []);
        this.set('wrapperURLs', wrapperURLs || []);
        this.set('unsupportedCompanionAds', unsupportedCompanionAds || []);
        this.set('adVerifications', adVerifications || []);
    }

    public getId(): string | null {
        return this.get('id');
    }

    public setId(id: string | null) {
        this.set('id', id);
    }

    public getCreatives(): VastCreative[] {
        return this.get('creatives');
    }

    public getCreative(): VastCreative | null {
        if (this.getCreatives() && this.getCreatives().length > 0) {
            return this.getCreatives()[0];
        }

        return null;
    }

    public getAdVerifications(): VastAdVerification[] {
        return this.get('adVerifications');
    }

    public getAdVerification(): VastAdVerification | null {
        if (this.getAdVerifications() && this.getAdVerifications().length > 0) {
            return this.getAdVerifications()[0];
        }
        return null;
    }

    public addCreative(creative: VastCreative) {
        this.get('creatives').push(creative);
    }

    public getStaticCompanionAds(): VastCompanionAdStaticResource[] {
        return this.get('staticCompanionAds');
    }

    public addStaticCompanionAd(companionAd: VastCompanionAdStaticResource) {
        this.get('staticCompanionAds').push(companionAd);
    }

    public getIframeCompanionAds(): VastCompanionAdIframeResource[] {
        return this.get('iframeCompanionAds');
    }

    public addIframeCompanionAd(companionAd: VastCompanionAdIframeResource) {
        this.get('iframeCompanionAds').push(companionAd);
    }

    public getHtmlCompanionAds(): VastCompanionAdHTMLResource[] {
        return this.get('htmlCompanionAds');
    }

    public addHtmlCompanionAd(companionAd: VastCompanionAdHTMLResource) {
        this.get('htmlCompanionAds').push(companionAd);
    }

    public getUnsupportedCompanionAds(): string[] {
        return this.get('unsupportedCompanionAds');
    }

    public addUnsupportedCompanionAd(unsupportedItem: string) {
        this.get('unsupportedCompanionAds').push(unsupportedItem);
    }

    public addAdVerifications(verfications: VastAdVerification[]) {
        this.set('adVerifications', this.get('adVerifications').concat(verfications));
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

    public getDTO(): { [key: string]: unknown } {
        const vastCreatives = [];
        for (const vastCreative of this.getCreatives()) {
            vastCreatives.push(vastCreative.getDTO());
        }

        const staticCompanionAds = [];
        for (const companionAd of this.getStaticCompanionAds()) {
            staticCompanionAds.push(companionAd.getDTO());
        }

        const iframeCompanionAds = [];
        for (const companionAd of this.getIframeCompanionAds()) {
            iframeCompanionAds.push(companionAd.getDTO());
        }

        const htmlCompanionAds = [];
        for (const companionAd of this.getHtmlCompanionAds()) {
            htmlCompanionAds.push(companionAd.getDTO());
        }

        return {
            'id': this.getId(),
            'errorURLTemplates': this.getErrorURLTemplates(),
            'impressionURLTemplates': this.getImpressionURLTemplates(),
            'wrapperURLs': this.getWrapperURLs(),
            'vastCreatives': vastCreatives,
            'staticCompanionAds': staticCompanionAds,
            'iframeCompanionAds': iframeCompanionAds,
            'htmlCompanionAds': htmlCompanionAds,
            'unsupportedItems': this.getUnsupportedCompanionAds()
        };
    }

    public getCompanionCreativeViewTrackingUrls(): string[] {
        return this.getCompanionEventTrackingUrls(TrackingEvent.CREATIVE_VIEW);
    }

    private getCompanionEventTrackingUrls(eventType: string): string[] {
        let urls: string[] = [];
        const companions = this.getStaticCompanionAds();

        for (const companion of companions) {
            urls = urls.concat(companion.getEventTrackingUrls(eventType));
        }

        return urls;
    }
}
