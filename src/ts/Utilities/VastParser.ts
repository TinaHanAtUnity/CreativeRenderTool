import { Vast } from 'Models/Vast';
import { VastAd } from 'Models/VastAd';
import { VastCreative } from 'Models/VastCreative';
import { VastCreativeLinear } from 'Models/VastCreativeLinear';
import { VastMediaFile } from 'Models/VastMediaFile';
import { Request } from 'Utilities/Request';
import * as xmldom from 'xmldom';

export class VastParser {

    private static DEFAULT_MAX_WRAPPER_DEPTH = 2;

    private _domParser: DOMParser;
    private _maxWrapperDepth: number;

    private static createDOMParser() {
        return new xmldom.DOMParser();
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

    public parseVast(vast: any): Vast {
        if (!vast) {
            throw new Error('VAST data is missing');
        }

        let xml = (this._domParser).parseFromString(decodeURIComponent(vast.data).trim(), 'text/xml');
        let ads: VastAd[] = [], errorURLTemplates: string[] = [];

        if (xml == null) {
            throw new Error('VAST xml data is missing');
        }

        if (xml.documentElement == null) {
            throw new Error('VAST xml data is missing');
        }

        if (xml.documentElement.nodeName !== 'VAST') {
            throw new Error(`VAST xml is invalid - document element must be VAST but was ${xml.documentElement.nodeName}`);
        }

        let childNodes = xml.documentElement.childNodes;

        // collect error URLs before moving on to ads
        for (let i = 0; i < childNodes.length; i++) {
            let node = childNodes[i];

            if (node.nodeName === 'Error') {
                errorURLTemplates.push(this.parseNodeText(node));
            }
        }

        for (let i = 0; i < childNodes.length; i++) {
            let node = childNodes[i];
            if (ads.length === 0 && node.nodeName === 'Ad') {
                let ad = this.parseAdElement(node);
                if (ad != null) {
                    ads.push(ad);
                }
            }
        }

        return new Vast(ads, errorURLTemplates, vast.tracking);
    }

    public retrieveVast(vast: any, request: Request, parent?: Vast, depth: number = 0): Promise<Vast> {
        let parsedVast = this.parseVast(vast);

        let wrapperURL = parsedVast.getWrapperURL();
        if (!wrapperURL || depth === this._maxWrapperDepth) {
            this.applyParentURLs(parsedVast, parent);
            return Promise.resolve(parsedVast);
        }

        return request.get(wrapperURL, [], {retries: 5, retryDelay: 5000, followRedirects: false, retryWithConnectionEvents: false}).then(response => {
            return this.retrieveVast({data: response.response, tracking: {}}, request, parsedVast, depth + 1);
        });
    }

    private applyParentURLs(parsedVast: Vast, parent: Vast) {
        if (parent) {
            for (let errorUrl of parent.getAd().getErrorURLTemplates()) {
                parsedVast.getAd().addErrorURLTemplate(errorUrl);
            }
            for (let impressionUrl of parent.getAd().getImpressionURLTemplates()) {
                parsedVast.getAd().addImpressionURLTemplate(impressionUrl);
            }
            for (let eventName of ['creativeView', 'start', 'firstQuartile', 'midpoint', 'thirdQuartile', 'complete', 'mute', 'unmute']) {
                for (let url of parent.getTrackingEventUrls(eventName)) {
                    parsedVast.addTrackingEventUrl(eventName, url);
                }
            }
        }
    };

    private parseNodeText(node: any): string {
        return node && (node.textContent || node.text);
    }

    private parseAdElement(adElement: any): VastAd {
        let ad: VastAd;
        let childNodes = adElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let adTypeElement = childNodes[i];
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
        let ad = new VastAd();
        let childNodes = inLineElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let node = childNodes[i];
            let url = this.parseNodeText(node);
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
                    let childCreatives = this.childsByName(node, 'Creative');
                    for (let j = 0; j < childCreatives.length; j++) {
                        let creativeElement = childCreatives[j];
                        let creativeChildren = creativeElement.childNodes;
                        for (let k = 0; k < creativeChildren.length; k++) {
                            let creativeTypeElement = creativeChildren[k];
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
                        ad.addWrapperURL(url.trim());
                    }
                    break;
                default:
                    break;
            }
        }
        return ad;
    }

    private parseCreativeLinearElement(creativeElement: any): any {
        let creative = new VastCreativeLinear();

        creative.setDuration(this.parseDuration(this.parseNodeText(this.childByName(creativeElement, 'Duration'))));
        if (creative.getDuration() === -1 && creativeElement.parentNode.parentNode.parentNode.nodeName !== 'Wrapper') {
            return null;
        }

        let skipOffset = creativeElement.getAttribute('skipoffset');
        if (skipOffset == null) {
            creative.setSkipDelay(null);
        } else if (skipOffset.charAt(skipOffset.length - 1) === '%') {
            let percent = parseInt(skipOffset, 10);
            creative.setSkipDelay(creative.getDuration() * (percent / 100));
        } else {
            creative.setSkipDelay(this.parseDuration(skipOffset));
        }

        let videoClicksElement = this.childByName(creativeElement, 'VideoClicks');
        if (videoClicksElement != null) {
            creative.setVideoClickThroughURLTemplate(this.parseNodeText(this.childByName(videoClicksElement, 'ClickThrough')));
            creative.setVideoClickTrackingURLTemplate(this.parseNodeText(this.childByName(videoClicksElement, 'ClickTracking')));
        }

        let trackingEventsElements = this.childsByName(creativeElement, 'TrackingEvents');
        for (let i = 0; i < trackingEventsElements.length; i++) {
            let trackingEventsElement = trackingEventsElements[i];
            let trackingElements = this.childsByName(trackingEventsElement, 'Tracking');
            for (let j = 0; j < trackingElements.length; j++) {
                let trackingElement = trackingElements[j];
                let eventName = trackingElement.getAttribute('event');
                let trackingURLTemplate = this.parseNodeText(trackingElement);
                if ((eventName != null) && (trackingURLTemplate != null)) {
                    creative.addTrackingEvent(eventName, trackingURLTemplate);
                }
            }
        }

        let mediaFilesElements = this.childsByName(creativeElement, 'MediaFiles');
        if (mediaFilesElements.length > 0) {
            let mediaFilesElement = mediaFilesElements[0]; // we're only interested in the first file
            let mediaFileElements = this.childsByName(mediaFilesElement, 'MediaFile');
            if (mediaFileElements.length > 0) {
                let mediaFileElement = mediaFileElements[0];
                let mediaFile = new VastMediaFile(
                    this.parseNodeText(mediaFileElement).trim(),
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

        let durationComponents = durationString.split(':');
        if (durationComponents.length !== 3) {
            return -1;
        }

        let secondsAndMS = durationComponents[2].split('.');
        let seconds = parseInt(secondsAndMS[0], 10);
        if (secondsAndMS.length === 2) {
            seconds += parseFloat('0.' + secondsAndMS[1]);
        }

        let minutes = parseInt(durationComponents[1], 10) * 60;

        let hours = parseInt(durationComponents[0], 10) * 60 * 60;

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || (minutes > 60 * 60) || (seconds > 60)) {
            return -1;
        }

        return hours + minutes + seconds;
    }

    private childByName(node: any, name: string): any {
        let childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let child = childNodes[i];
            if (child.nodeName === name) {
                return child;
            }
        }
    }

    private childsByName(node: any, name: string): any {
        let matches: Node[] = [];
        let childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let child = childNodes[i];
            if (child.nodeName === name) {
                matches.push(child);
            }
        }
        return matches;
    }

}
