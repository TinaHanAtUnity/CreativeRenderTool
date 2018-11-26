import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Vast } from 'VAST/Models/Vast';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCreative } from 'VAST/Models/VastCreative';
import { VastCreativeCompanionAd } from 'VAST/Models/VastCreativeCompanionAd';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { Url } from 'Core/Utilities/Url';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';

export class VastParser {

    private static DEFAULT_MAX_WRAPPER_DEPTH = 8;

    private static createDOMParser() {
        return new DOMParser();
    }

    private _domParser: DOMParser;
    private _maxWrapperDepth: number;
    private _rootWrapperVast: unknown;

    constructor(domParser?: DOMParser, maxWrapperDepth: number = VastParser.DEFAULT_MAX_WRAPPER_DEPTH) {
        this._domParser = domParser || VastParser.createDOMParser();
        this._maxWrapperDepth = maxWrapperDepth;
    }

    public setMaxWrapperDepth(maxWrapperDepth: number) {
        this._maxWrapperDepth = maxWrapperDepth;
    }

    public parseMediaFileSize(duration: number, kbitrate: number): number {
        // returning file size in byte from bit
        return (duration * kbitrate * 1000) / 8;
    }

    public parseVast(vast: string | null): Vast {
        if (!vast) {
            throw new Error('VAST data is missing');
        }

        const xml = (this._domParser).parseFromString(vast, 'text/xml');
        const ads: VastAd[] = [];
        const errorURLTemplates: (string | null)[] = [];

        if (!xml || !xml.documentElement || xml.documentElement.nodeName !== 'VAST') {
            throw new Error('VAST xml data is missing');
        }

        const childNodes = <Node[]><unknown>xml.documentElement.childNodes;

        // collect error URLs before moving on to ads
        for(const node of childNodes) {
            if (node.nodeName === 'Error') {
                errorURLTemplates.push(this.parseNodeText(node));
            }
        }

        for(const node of childNodes) {
            if (ads.length === 0 && node.nodeName === 'Ad') {
                const ad = this.parseAdElement(<Element>node);
                if (ad != null) {
                    ads.push(ad);
                }
            }
        }

        if (ads.length === 0) {
            throw new Error('VAST Ad tag is missing');
        }

        return new Vast(ads, errorURLTemplates);
    }

    public retrieveVast(vast: string, core: ICoreApi, request: RequestManager, parent?: Vast, depth: number = 0): Promise<Vast> {
        let parsedVast: Vast;

        if (depth === 0) {
            this._rootWrapperVast = vast;
        }

        try {
            parsedVast = this.parseVast(vast);
        } catch (e) {
            const error = new DiagnosticError(e, { vast: vast, wrapperDepth: depth });
            if (depth > 0) {
                // tslint:disable:no-string-literal
                error.diagnostic['rootWrapperVast'] = this._rootWrapperVast;
                // tslint:enable
            }
            throw error;
        }

        this.applyParentURLs(parsedVast, parent);

        const wrapperURL = parsedVast.getWrapperURL();
        if (!wrapperURL) {
            return Promise.resolve(parsedVast);
        } else if (depth >= this._maxWrapperDepth) {
            throw new Error(VastErrorInfo.errorMap[VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED]);
        }

        const encodedWrapperURL = Url.encodeUrlWithQueryParams(wrapperURL);
        core.Sdk.logDebug('Unity Ads is requesting VAST ad unit from ' + encodedWrapperURL);

        return request.get(encodedWrapperURL, [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).then(response => {
            return this.retrieveVast(response.response, core, request, parsedVast, depth + 1);
        });
    }

    private applyParentURLs(parsedVast: Vast, parent?: Vast) {
        if (parent) {
            const ad = parent.getAd();
            const parsedAd = parsedVast.getAd();
            if(ad && parsedAd) {
                for (const errorUrl of ad.getErrorURLTemplates()) {
                    parsedAd.addErrorURLTemplate(errorUrl);
                }
                for (const impressionUrl of ad.getImpressionURLTemplates()) {
                    parsedAd.addImpressionURLTemplate(impressionUrl);
                }
                for (const clickTrackingUrl of ad.getVideoClickTrackingURLTemplates()) {
                    parsedAd.addVideoClickTrackingURLTemplate(clickTrackingUrl);
                }
                for (const eventName of ['creativeView', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'mute', 'unmute']) {
                    for (const url of parent.getTrackingEventUrls(eventName)) {
                        parsedVast.addTrackingEventUrl(eventName, url);
                    }
                }
            }
        }
    }

    private parseNodeText(node: Node): string | null {
        let parsedText = node && node.textContent;

        if (parsedText) {
            parsedText = parsedText.trim();
        }

        return parsedText;
    }

    private parseAdElement(adElement: Element): VastAd | undefined {
        let ad: VastAd | undefined;
        const childNodes = adElement.childNodes;
        for(const adTypeElement of childNodes) {
            if (adTypeElement.nodeName === 'Wrapper') {
                ad = this.parseWrapperElement(adTypeElement);
                break;
            }
            if (adTypeElement.nodeName === 'InLine') {
                ad = this.parseInLineElement(adTypeElement);
                break;
            }
        }
        if (ad) {
            ad.setId(adElement.getAttribute('id'));
        }
        return ad;
    }

    private parseWrapperElement(wrapperElement: Node): VastAd {
        return this.parseInLineElement(wrapperElement);
    }

    private parseInLineElement(inLineElement: Node): VastAd {
        const ad = new VastAd();
        const childNodes = inLineElement.childNodes;
        for(const node of childNodes) {
            const url = this.parseNodeText(node);
            switch (node.nodeName) {
                case 'Error':
                    if (url) {
                        ad.addErrorURLTemplate(url);
                    }
                    break;
                case 'Impression':
                    if (url) {
                        ad.addImpressionURLTemplate(url);
                    }
                    break;
                case 'Creatives':
                    const childCreatives = this.childsByName(node, 'Creative');
                    for(const creativeElement of childCreatives) {
                        const creativeChildren = creativeElement.childNodes;
                        for(const creativeTypeElement of creativeChildren) {
                            let creative: VastCreative | null;
                            switch (creativeTypeElement.nodeName) {
                                case 'Linear':
                                    if (ad.getCreatives().length === 0) {
                                        creative = this.parseCreativeLinearElement(<Element>creativeTypeElement);
                                        if (creative) {
                                            ad.addCreative(creative);
                                        }
                                    }
                                    break;
                                case 'CompanionAds':
                                    const companionAdElements = this.childsByName(creativeTypeElement, 'Companion');
                                    for(const companionAdElement of companionAdElements) {
                                        const companionAd = this.parseCreativeCompanionAdElement(<Element>companionAdElement);
                                        if (companionAd) {
                                            ad.addCompanionAd(companionAd);
                                        }
                                    }
                                    break;
                                default:
                            }
                        }
                    }
                    break;
                case 'VASTAdTagURI':
                    if (url) {
                        ad.addWrapperURL(url);
                    }
                    break;
                default:
            }
        }
        return ad;
    }

    private parseCreativeLinearElement(creativeElement: Element): VastCreative | null {
        const creative = new VastCreativeLinear();

        creative.setDuration(this.parseDuration(this.parseNodeText(this.childByName(creativeElement, 'Duration')!)!));
        if (creative.getDuration() === -1 && creativeElement.parentNode!.parentNode!.parentNode!.nodeName !== 'Wrapper') {
            return null;
        }

        const mediaDuration = creative.getDuration();
        const skipOffset = creativeElement.getAttribute('skipoffset');
        if (skipOffset == null) {
            creative.setSkipDelay(null);
        } else if (skipOffset.charAt(skipOffset.length - 1) === '%') {
            const percent = parseInt(skipOffset, 10);
            creative.setSkipDelay(creative.getDuration() * (percent / 100));
        } else {
            creative.setSkipDelay(this.parseDuration(skipOffset));
        }

        const videoClicksElement = this.childByName(creativeElement, 'VideoClicks');
        if (videoClicksElement != null) {
            creative.setVideoClickThroughURLTemplate(this.parseNodeText(this.childByName(videoClicksElement, 'ClickThrough')!)!);
            const trackingVideoClickEventsElements = this.childsByName(videoClicksElement, 'ClickTracking');
            for(const trackingVideoClickEventsElement of trackingVideoClickEventsElements) {
                const trackingVideoClickURLTemplate = this.parseNodeText(trackingVideoClickEventsElement);
                if (trackingVideoClickURLTemplate != null) {
                    creative.addVideoClickTrackingURLTemplate(trackingVideoClickURLTemplate);
                }
            }
        }

        const trackingEventsElements = this.childsByName(creativeElement, 'TrackingEvents');
        for(const trackingEventsElement of trackingEventsElements) {
            const trackingElements = <Element[]>this.childsByName(trackingEventsElement, 'Tracking');
            for(const trackingElement of trackingElements) {
                const eventName = trackingElement.getAttribute('event');
                const trackingURLTemplate = this.parseNodeText(trackingElement);
                if ((eventName != null) && (trackingURLTemplate != null)) {
                    creative.addTrackingEvent(eventName, trackingURLTemplate);
                }
            }
        }

        const mediaFilesElements = this.childsByName(creativeElement, 'MediaFiles');
        if (mediaFilesElements.length > 0) {
            const mediaFilesElement = mediaFilesElements[0];
            const mediaFileElements = <Element[]>this.childsByName(mediaFilesElement, 'MediaFile');
            for(const mediaFileElement of mediaFileElements) {
                const mediaFile = new VastMediaFile(
                    this.parseNodeText(mediaFileElement)!,
                    mediaFileElement.getAttribute('delivery')!,
                    mediaFileElement.getAttribute('codec')!,
                    mediaFileElement.getAttribute('type')!,
                    parseInt(mediaFileElement.getAttribute('bitrate') || '0', 10),
                    parseInt(mediaFileElement.getAttribute('minBitrate') || '0', 10),
                    parseInt(mediaFileElement.getAttribute('maxBitrate') || '0', 10),
                    parseInt(mediaFileElement.getAttribute('width') || '0', 10),
                    parseInt(mediaFileElement.getAttribute('height') || '0', 10),
                    mediaFileElement.getAttribute('apiFramework')!,
                    this.parseMediaFileSize(mediaDuration, parseInt(mediaFileElement.getAttribute('bitrate') || '0', 10)));
                creative.addMediaFile(mediaFile);
            }
        }

        const adParametersElement = this.childByName(creativeElement, 'AdParameters');
        if (adParametersElement) {
            const adParameters = this.parseNodeText(adParametersElement);
            if (adParameters) {
                creative.setAdParameters(adParameters);
            }
        }

        return creative;
    }

    private parseCreativeCompanionAdElement(companionAdElement: Element): VastCreativeCompanionAd | null {
        const staticResourceElement = <Element>this.childByName(companionAdElement, 'StaticResource');
        const companionClickThroughElement = this.childByName(companionAdElement, 'CompanionClickThrough');

        if (companionAdElement && staticResourceElement) {
            const id = companionAdElement.getAttribute('id');
            const height = parseInt(companionAdElement.getAttribute('height') || '0', 10);
            const width = parseInt(companionAdElement.getAttribute('width') || '0', 10);
            const creativeType = staticResourceElement.getAttribute('creativeType');
            const staticResourceURL = this.parseNodeText(staticResourceElement);
            const companionClickThroughURLTemplate = this.parseNodeText(companionClickThroughElement!);

            const trackingEvents = this.getTrackingEventsFromElement(companionAdElement);

            return new VastCreativeCompanionAd(id!, creativeType!, height, width, staticResourceURL!, companionClickThroughURLTemplate!, trackingEvents);
        } else {
            return null;
        }
    }

    private getTrackingEventsFromElement(el: Node): { [eventType: string]: string[] } {
        const events: { [eventType: string]: string[] } = {};

        const trackingEventsElements = this.childsByName(el, 'TrackingEvents');
        for(const trackingEventsElement of trackingEventsElements) {
            const trackingElements = <Element[]>this.childsByName(trackingEventsElement, 'Tracking');
            for(const trackingElement of trackingElements) {
                const eventName = trackingElement.getAttribute('event');
                const trackingURLTemplate = this.parseNodeText(trackingElement);
                if ((eventName != null) && (trackingURLTemplate != null)) {
                    if (events[eventName] !== undefined) {
                        events[eventName].push(trackingURLTemplate);
                    } else {
                        events[eventName] = [trackingURLTemplate];
                    }
                }
            }
        }

        return events;
    }

    private parseDuration(durationString: string): number {
        if (!(durationString != null)) {
            return -1;
        }

        const durationComponents = durationString.split(':');
        if (durationComponents.length !== 3) {
            return -1;
        }

        const secondsAndMS = durationComponents[2].split('.');
        let seconds = parseInt(secondsAndMS[0], 10);
        if (secondsAndMS.length === 2) {
            seconds += parseFloat('0.' + secondsAndMS[1]);
        }

        const minutes = parseInt(durationComponents[1], 10) * 60;

        const hours = parseInt(durationComponents[0], 10) * 60 * 60;

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || (minutes > 60 * 60) || (seconds > 60)) {
            return -1;
        }

        return hours + minutes + seconds;
    }

    private childByName(node: Node, name: string): Node | undefined {
        const childNodes = node.childNodes;
        for(const child of childNodes) {
            if (child.nodeName === name) {
                return child;
            }
        }
    }

    private childsByName(node: Node, name: string): Node[] {
        const matches: Node[] = [];
        const childNodes = node.childNodes;
        for(const child of childNodes) {
            if (child.nodeName === name) {
                matches.push(child);
            }
        }
        return matches;
    }

}
