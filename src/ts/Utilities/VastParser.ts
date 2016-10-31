import { Vast } from 'Models/Vast/Vast';
import { VastAd } from 'Models/Vast/VastAd';
import { VastCreative } from 'Models/Vast/VastCreative';
import { VastCreativeLinear } from 'Models/Vast/VastCreativeLinear';
import { VastMediaFile } from 'Models/Vast/VastMediaFile';
import { Request } from 'Utilities/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { DiagnosticError } from 'Errors/DiagnosticError';

export class VastParser {

    private static DEFAULT_MAX_WRAPPER_DEPTH = 8;

    private _domParser: DOMParser;
    private _maxWrapperDepth: number;
    private _rootWrapperVast: any;

    private static createDOMParser() {
        return new DOMParser();
    };

    constructor();
    constructor(domParser: DOMParser);
    constructor(domParser?: DOMParser, maxWrapperDepth: number = VastParser.DEFAULT_MAX_WRAPPER_DEPTH) {
        this._domParser = domParser || VastParser.createDOMParser();
        this._maxWrapperDepth = maxWrapperDepth;
    }

    public setMaxWrapperDepth(maxWrapperDepth: number) {
        this._maxWrapperDepth = maxWrapperDepth;
    }

    public parseVast(vast: string | null): Vast {
        if (!vast) {
            throw new Error('VAST data is missing');
        }

        const xml = (this._domParser).parseFromString(vast, 'text/xml');
        const ads: VastAd[] = [], errorURLTemplates: string[] = [];

        if (!xml || !xml.documentElement || xml.documentElement.nodeName !== 'VAST') {
            throw new Error('VAST xml data is missing');
        }

        const childNodes = xml.documentElement.childNodes;

        // collect error URLs before moving on to ads
        for (let i = 0; i < childNodes.length; i++) {
            const node = childNodes[i];

            if (node.nodeName === 'Error') {
                errorURLTemplates.push(this.parseNodeText(node));
            }
        }

        for (let i = 0; i < childNodes.length; i++) {
            const node = childNodes[i];
            if (ads.length === 0 && node.nodeName === 'Ad') {
                const ad = this.parseAdElement(node);
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

    public retrieveVast(vast: any, nativeBridge: NativeBridge, request: Request, parent?: Vast, depth: number = 0): Promise<Vast> {
        let parsedVast: Vast;

        if (depth === 0) {
            this._rootWrapperVast = vast;
        }

        try {
            parsedVast = this.parseVast(vast);
        } catch (e) {
            const error = new DiagnosticError(e, { vast: vast, wrapperDepth: depth });
            if (depth > 0) {
                /* tslint:disable:no-string-literal */
                error.diagnostic['rootWrapperVast'] = this._rootWrapperVast;
                /* tslint:enable */
            }
            throw error;
        }

        this.applyParentURLs(parsedVast, parent);

        const wrapperURL = parsedVast.getWrapperURL();
        if (!wrapperURL) {
            return Promise.resolve(parsedVast);
        } else if (depth >= this._maxWrapperDepth) {
            throw new Error('VAST wrapper depth exceeded');
        }

        nativeBridge.Sdk.logInfo('Unity Ads is requesting VAST ad unit from ' + wrapperURL);

        return request.get(wrapperURL, [], {retries: 5, retryDelay: 5000, followRedirects: true, retryWithConnectionEvents: false}).then(response => {
            return this.retrieveVast(response.response, nativeBridge, request, parsedVast, depth + 1);
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
    };

    private parseNodeText(node: any): string {
        let parsedText = node && (node.textContent || node.text);

        if (parsedText) {
            parsedText = parsedText.trim();
        }

        return parsedText;
    }

    private parseAdElement(adElement: any): VastAd | undefined {
        let ad: VastAd | undefined;
        const childNodes = adElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const adTypeElement = childNodes[i];
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

    private parseWrapperElement(wrapperElement: any): VastAd {
        return this.parseInLineElement(wrapperElement);
    }

    private parseInLineElement(inLineElement: any): VastAd {
        const ad = new VastAd();
        const childNodes = inLineElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const node = childNodes[i];
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
                    for (let j = 0; j < childCreatives.length; j++) {
                        const creativeElement = childCreatives[j];
                        const creativeChildren = creativeElement.childNodes;
                        for (let k = 0; k < creativeChildren.length; k++) {
                            const creativeTypeElement = creativeChildren[k];
                            let creative: VastCreative;
                            switch (creativeTypeElement.nodeName) {
                                case 'Linear':
                                    if (ad.getCreatives().length === 0) {
                                        creative = this.parseCreativeLinearElement(creativeTypeElement);
                                        if (creative) {
                                            ad.addCreative(creative);
                                        }
                                    }
                                    break;
                                default:
                                    break;
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
                    break;
            }
        }
        return ad;
    }

    private parseCreativeLinearElement(creativeElement: any): any {
        const creative = new VastCreativeLinear();

        creative.setDuration(this.parseDuration(this.parseNodeText(this.childByName(creativeElement, 'Duration'))));
        if (creative.getDuration() === -1 && creativeElement.parentNode.parentNode.parentNode.nodeName !== 'Wrapper') {
            return null;
        }

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
            creative.setVideoClickThroughURLTemplate(this.parseNodeText(this.childByName(videoClicksElement, 'ClickThrough')));
            const trackingVideoClickEventsElements = this.childsByName(videoClicksElement, 'ClickTracking');
            for (let i = 0; i < trackingVideoClickEventsElements.length; i++) {
                const trackingVideoClickEventsElement = trackingVideoClickEventsElements[i];
                const trackingVideoClickURLTemplate = this.parseNodeText(trackingVideoClickEventsElement);
                if (trackingVideoClickURLTemplate != null) {
                    creative.addVideoClickTrackingURLTemplate(trackingVideoClickURLTemplate);
                }
            }
        }

        const trackingEventsElements = this.childsByName(creativeElement, 'TrackingEvents');
        for (let i = 0; i < trackingEventsElements.length; i++) {
            const trackingEventsElement = trackingEventsElements[i];
            const trackingElements = this.childsByName(trackingEventsElement, 'Tracking');
            for (let j = 0; j < trackingElements.length; j++) {
                const trackingElement = trackingElements[j];
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
            const mediaFileElements = this.childsByName(mediaFilesElement, 'MediaFile');
            for (let i = 0; i < mediaFileElements.length; i++) {
                const mediaFileElement = mediaFileElements[i];
                const mediaFile = new VastMediaFile(
                    this.parseNodeText(mediaFileElement),
                    mediaFileElement.getAttribute('delivery'),
                    mediaFileElement.getAttribute('codec'),
                    mediaFileElement.getAttribute('type'),
                    parseInt(mediaFileElement.getAttribute('bitrate') || 0, 10),
                    parseInt(mediaFileElement.getAttribute('minBitrate') || 0, 10),
                    parseInt(mediaFileElement.getAttribute('maxBitrate') || 0, 10),
                    parseInt(mediaFileElement.getAttribute('width') || 0, 10),
                    parseInt(mediaFileElement.getAttribute('height') || 0, 10));
                creative.addMediaFile(mediaFile);
            }
        }

        return creative;
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

    private childByName(node: any, name: string): any {
        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const child = childNodes[i];
            if (child.nodeName === name) {
                return child;
            }
        }
    }

    private childsByName(node: any, name: string): any {
        const matches: Node[] = [];
        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            const child = childNodes[i];
            if (child.nodeName === name) {
                matches.push(child);
            }
        }
        return matches;
    }

}
