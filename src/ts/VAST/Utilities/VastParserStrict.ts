import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Vast } from 'VAST/Models/Vast';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCreativeStaticResourceCompanionAd } from 'VAST/Models/VastCreativeStaticResourceCompanionAd';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { Url } from 'Core/Utilities/Url';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { VastAdValidator } from 'VAST/Validators/VastAdValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { IVastCreativeCompanionAd } from 'VAST/Models/IVastCreativeCompanionAd';
import { Model } from 'Core/Models/Model';

enum VastNodeName {
    ERROR = 'Error',
    AD = 'Ad',
    WRAPPER = 'Wrapper',
    INLINE = 'InLine',
    VAST_AD_TAG_URI = 'VASTAdTagURI',
    IMPRESSION = 'Impression',
    LINEAR = 'Linear',
    COMPANION = 'Companion',
    DURATION = 'Duration',
    CLICK_THROUGH = 'ClickThrough',
    CLICK_TRACKING = 'ClickTracking',
    TRACKING = 'Tracking',
    MEDIA_FILE = 'MediaFile',
    AD_PARAMETERS = 'AdParameters',
    STATIC_RESOURCE = 'StaticResource',
    COMPANION_CLICK_THROUGH = 'CompanionClickThrough',
    COMPANION_CLICK_TRACKING = 'CompanionClickTracking',
    PARSE_ERROR = 'parsererror',
    VAST = 'VAST'
}

enum VastAttributeNames {
    ID = 'id',
    SKIP_OFFSET = 'skipoffset',
    EVENT = 'event',
    DELIVERY = 'delivery',
    CODEC = 'codec',
    TYPE = 'type',
    BITRATE = 'bitrate',
    MIN_BITRATE = 'minBitrate',
    MAX_BITRATE = 'maxBitrate',
    WIDTH = 'width',
    HEIGHT = 'height',
    API_FRAMEWORK = 'apiFramework',
    CREATIVE_TYPE = 'creativeType'
}

export class VastParserStrict {

    private static DEFAULT_MAX_WRAPPER_DEPTH = 8;

    private _domParser: DOMParser;
    private _maxWrapperDepth: number;
    private _rootWrapperVast: unknown;

    constructor(domParser?: DOMParser, maxWrapperDepth: number = VastParserStrict.DEFAULT_MAX_WRAPPER_DEPTH) {
        this._domParser = domParser || new DOMParser();
        this._maxWrapperDepth = maxWrapperDepth;
    }

    public setMaxWrapperDepth(maxWrapperDepth: number) {
        this._maxWrapperDepth = maxWrapperDepth;
    }

    public parseVast(vast: string | null, urlProtocol: string = 'https:'): Vast {
        if (!vast) {
            throw new Error('VAST data is missing');
        }

        const xml = this._domParser.parseFromString(vast, 'text/xml');
        const ads: VastAd[] = [];
        const parseErrorURLTemplates: string[] = [];

        // use the parsererror tag from DomParser to give accurate error messages
        const parseErrors = xml.getElementsByTagName(VastNodeName.PARSE_ERROR); // TODO move to enum
        if (parseErrors.length > 0) {
            // then we have failed to parse the xml
            const parseMessages: string[] = [];
            for(const element of parseErrors) {
                if (element.textContent) {
                    parseMessages.push(element.textContent);
                }
            }
            throw new Error(`VAST xml was not parseable:\n   ${parseMessages.join('\n    ')}`);
        }

        if (!xml || !xml.documentElement || xml.documentElement.nodeName !== VastNodeName.VAST) { // TODO move vast to enum
            throw new Error('VAST xml data is missing');
        }

        const documentElement = xml.documentElement;

        // collect error URLs before moving on to ads
        this.getChildrenNodesWithName(documentElement, VastNodeName.ERROR).forEach((element: HTMLElement) => {
            parseErrorURLTemplates.push(this.parseNodeText(element));
        });
        let errors: Error[] = [];
        // parse each Ad element
        this.getNodesWithName(documentElement, VastNodeName.AD).forEach((element: HTMLElement) => {
            if (ads.length <= 0) {
                const ad = this.parseAdElement(element, urlProtocol);
                const adErrors = new VastAdValidator(ad).getErrors();
                if (adErrors.length > 0) {
                    errors = errors.concat(adErrors);
                } else {
                    ads.push(ad);
                }
            }
        });

        if (errors.length > 0) {
            // Format all errors into a single error message
            throw this.formatErrorMessage(errors);
        }

        if (ads.length === 0) {
            throw new Error('VAST Ad tag is missing');
        }

        return new Vast(ads, parseErrorURLTemplates);
    }

    // default to https: for relative urls
    public retrieveVast(vast: string, core: ICoreApi, request: RequestManager, parent?: Vast, depth: number = 0, urlProtocol: string = 'https:'): Promise<Vast> {
        let parsedVast: Vast;

        if (depth === 0) {
            this._rootWrapperVast = vast;
        }

        try {
            parsedVast = this.parseVast(vast, urlProtocol);
        } catch (e) {
            let errorData: object;
            if (depth > 0) {
                errorData = {
                    vast: vast,
                    wrapperDepth: depth,
                    rootWrapperVast: this._rootWrapperVast
                };
            } else {
                errorData = {
                    vast: vast,
                    wrapperDepth: depth
                };
            }
            throw new DiagnosticError(e, errorData);
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
        const wrapperUrlProtocol = Url.getProtocol(wrapperURL);
        return request.get(encodedWrapperURL, [], {retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false}).then(response => {
            return this.retrieveVast(response.response, core, request, parsedVast, depth + 1, wrapperUrlProtocol);
        });
    }

    private getVideoSizeInBytes(duration: number, kbitrate: number): number {
        // returning file size in byte from bit
        return (duration * kbitrate * 1000) / 8;
    }

    private formatErrorMessage(errors: Error[]): Error {
        return new Error(`VAST parse encountered these errors while parsing:
            ${VastValidationUtilities.formatErrors(errors)}
        `);
    }

    // only searches direct children for nodes with matching name
    private getChildrenNodesWithName(node: HTMLElement, name: string): HTMLElement[] {
        const nodes: HTMLElement[] = [];
        for (const child of node.childNodes) {
            if (child.nodeName === name) {
                nodes.push(<HTMLElement>child);
            }
        }
        return nodes;
    }

    // search for nodes with matching name
    private getNodesWithName(rootNode: HTMLElement, name: string): HTMLElement[] {
        const nodeList = rootNode.querySelectorAll(name);
        return Array.prototype.slice.call(nodeList);
    }

    private getFirstNodeWithName(rootNode: HTMLElement, name: string): HTMLElement | null {
        return rootNode.querySelector(name);
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

    private parseNodeText(node: HTMLElement): string {
        if (node.textContent) {
            return node.textContent.trim();
        } else {
            return '';
        }
    }

    private parseAdElement(adElement: HTMLElement, urlProtocol: string): VastAd {

        // use the first 'InLine' ad
        const element = this.getFirstNodeWithName(adElement, VastNodeName.INLINE) || this.getFirstNodeWithName(adElement, VastNodeName.WRAPPER);
        if (element) {
            const parsedAd = this.parseAdContent(element, urlProtocol);
            parsedAd.setId(adElement.getAttribute(VastAttributeNames.ID));
            return parsedAd;
        }

        // return undefined if there is no inline or wrapper ad
        return new VastAd();
    }

    private parseAdContent(adElement: HTMLElement, urlProtocol: string): VastAd {
        const vastAd = new VastAd();
        this.getNodesWithName(adElement, VastNodeName.VAST_AD_TAG_URI).forEach((element: HTMLElement) => {
            const url = Url.decodeUrl(this.parseNodeText(element));
            if (url && url.length > 0) {
                vastAd.addWrapperURL(url);
            }
        });

        this.getNodesWithName(adElement, VastNodeName.ERROR).forEach((element: HTMLElement) => {
            const url = Url.decodeUrl(this.parseNodeText(element));
            if (url && url.length > 0) {
                vastAd.addErrorURLTemplate(url);
            }
        });

        this.getNodesWithName(adElement, VastNodeName.IMPRESSION).forEach((element: HTMLElement) => {
            const url = Url.decodeUrl(this.parseNodeText(element));
            // ignore empty urls and about:blank
            // about:blank needs to be ignored so that VPAID ads can be parsed
            if (url.length > 0 && url !== 'about:blank') {
                vastAd.addImpressionURLTemplate(url);
            }
        });

        this.getNodesWithName(adElement, VastNodeName.LINEAR).forEach((element: HTMLElement) => {
            const creative = this.parseCreativeLinearElement(element);
            vastAd.addCreative(creative);
        });

        this.getNodesWithName(adElement, VastNodeName.COMPANION).forEach((element: HTMLElement) => {
            const staticResourceElement = this.getFirstNodeWithName(element, VastNodeName.STATIC_RESOURCE);
            if (staticResourceElement) {
                const companionAd = this.parseCreativeStaticResourceCompanionAdElement(element, urlProtocol);
                vastAd.addCompanionAd(companionAd);
            } else {
                // ignore element as it is not of a type we support
                vastAd.addUnparseableCompanionAd(element.outerHTML);
            }
        });

        return vastAd;
    }

    private getIntAttribute(element: HTMLElement, attribute: string): number {
        const stringAttribute: string | null = element.getAttribute(attribute);
        return parseInt(stringAttribute || '0', 10);
    }

    private parseCreativeLinearElement(creativeElement: HTMLElement): VastCreativeLinear {
        const creative = new VastCreativeLinear();

        const durationElement = this.getFirstNodeWithName(creativeElement, VastNodeName.DURATION);
        if (durationElement) {
            const durationString = this.parseNodeText(durationElement);
            creative.setDuration(this.parseDuration(durationString));
        }

        const mediaDuration = creative.getDuration();
        const skipOffset = creativeElement.getAttribute(VastAttributeNames.SKIP_OFFSET);
        if (skipOffset) {
            if (skipOffset.charAt(skipOffset.length - 1) === '%') {
                const percent = parseInt(skipOffset, 10);
                creative.setSkipDelay(creative.getDuration() * (percent / 100));
            } else {
                creative.setSkipDelay(this.parseDuration(skipOffset));
            }
        } else {
            creative.setSkipDelay(null);
        }

        const clickThroughElement = this.getFirstNodeWithName(creativeElement, VastNodeName.CLICK_THROUGH);
        if (clickThroughElement) {
            const url = Url.decodeUrl(this.parseNodeText(clickThroughElement));
            if (url && url.length > 0) {
                creative.setVideoClickThroughURLTemplate(url);
            }
        }

        this.getNodesWithName(creativeElement, VastNodeName.CLICK_TRACKING).forEach((element: HTMLElement) => {
            const url = Url.decodeUrl(this.parseNodeText(element));
            if (url && url.length > 0) {
                creative.addVideoClickTrackingURLTemplate(url);
            }
        });

        this.getNodesWithName(creativeElement, VastNodeName.TRACKING).forEach((element: HTMLElement) => {
            const url = Url.decodeUrl(this.parseNodeText(element));
            const eventName = element.getAttribute(VastAttributeNames.EVENT);
            if (eventName && url && url.length > 0) {
                creative.addTrackingEvent(eventName, url);
            }
        });

        this.getNodesWithName(creativeElement, VastNodeName.MEDIA_FILE).forEach((element: HTMLElement) => {
            const bitrate = this.getIntAttribute(element, VastAttributeNames.BITRATE);
            const mediaFile = new VastMediaFile(
                Url.decodeUrl(this.parseNodeText(element)),
                element.getAttribute(VastAttributeNames.DELIVERY),
                element.getAttribute(VastAttributeNames.CODEC),
                element.getAttribute(VastAttributeNames.TYPE),
                bitrate,
                this.getIntAttribute(element, VastAttributeNames.MIN_BITRATE),
                this.getIntAttribute(element, VastAttributeNames.MAX_BITRATE),
                this.getIntAttribute(element, VastAttributeNames.WIDTH),
                this.getIntAttribute(element, VastAttributeNames.HEIGHT),
                element.getAttribute(VastAttributeNames.API_FRAMEWORK),
                this.getVideoSizeInBytes(mediaDuration, bitrate)
            );
            creative.addMediaFile(mediaFile);
        });

        const adParamsElement = this.getFirstNodeWithName(creativeElement, VastNodeName.AD_PARAMETERS);
        if (adParamsElement) {
            const adParameters = this.parseNodeText(adParamsElement);
            creative.setAdParameters(adParameters);
        }

        return creative;
    }

    private parseCreativeStaticResourceCompanionAdElement(companionAdElement: HTMLElement, urlProtocol: string): VastCreativeStaticResourceCompanionAd {
        const id = companionAdElement.getAttribute(VastAttributeNames.ID);
        const height = this.getIntAttribute(companionAdElement, VastAttributeNames.HEIGHT);
        const width = this.getIntAttribute(companionAdElement, VastAttributeNames.WIDTH);
        const companionAd = new VastCreativeStaticResourceCompanionAd(id, height, width);

        // Get tracking urls for companion ad
        this.getNodesWithName(companionAdElement, VastNodeName.TRACKING).forEach((element: HTMLElement) => {
            const url = Url.decodeUrl(this.parseNodeText(element));
            const eventName = element.getAttribute(VastAttributeNames.EVENT);
            if (eventName) {
                companionAd.addTrackingEvent(eventName, url);
            }
        });

        const staticResourceElement = this.getFirstNodeWithName(companionAdElement, VastNodeName.STATIC_RESOURCE);
        if (staticResourceElement) {
            const creativeType = staticResourceElement.getAttribute(VastAttributeNames.CREATIVE_TYPE);
            companionAd.setCreativeType(creativeType);
            let staticResourceUrl = Url.decodeUrl(this.parseNodeText(staticResourceElement));
            if (Url.isRelativeUrl(staticResourceUrl)) {
                staticResourceUrl = `${urlProtocol}${staticResourceUrl}`;
            }
            companionAd.setStaticResourceURL(staticResourceUrl);
        }

        const companionClickThroughElement = this.getFirstNodeWithName(companionAdElement, VastNodeName.COMPANION_CLICK_THROUGH);
        if (companionClickThroughElement) {
            const companionClickThroughUrl = Url.decodeUrl(this.parseNodeText(companionClickThroughElement));
            if (companionClickThroughUrl && companionClickThroughUrl.length > 0) {
                companionAd.setCompanionClickThroughURLTemplate(companionClickThroughUrl);
            }
        }

        this.getNodesWithName(companionAdElement, VastNodeName.COMPANION_CLICK_TRACKING).forEach((element: HTMLElement) => {
            const companionClickTrackingUrl = Url.decodeUrl(this.parseNodeText(element));
            if (companionClickTrackingUrl && companionClickTrackingUrl.length > 0) {
                companionAd.addCompanionClickTrackingURLTemplate(companionClickTrackingUrl);
            }
        });
        return companionAd;
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

}
