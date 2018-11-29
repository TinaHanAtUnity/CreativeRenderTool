import { DiagnosticError } from 'Core/Errors/DiagnosticError';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Vast } from 'VAST/Models/Vast';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCreativeCompanionAd } from 'VAST/Models/VastCreativeCompanionAd';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { Url } from 'Core/Utilities/Url';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { VastValidator } from 'VAST/Utilities/VastValidator';

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
    COMPANION_CLICK_THROUGH = 'CompanionClickThrough'
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

    private static createDOMParser() {
        return new DOMParser();
    }

    private _domParser: DOMParser;
    private _maxWrapperDepth: number;
    private _rootWrapperVast: any;

    constructor(domParser?: DOMParser, maxWrapperDepth: number = VastParserStrict.DEFAULT_MAX_WRAPPER_DEPTH) {
        this._domParser = domParser || VastParserStrict.createDOMParser();
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
        const parseErrorURLTemplates: string[] = [];

        // use the parsererror tag from DomParser to give accurate error messages
        const parseErrors = xml.getElementsByTagName('parsererror');
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

        if (!xml || !xml.documentElement || xml.documentElement.nodeName !== 'VAST') {
            throw new Error('VAST xml data is missing');
        }

        const documentElement = xml.documentElement;

        // collect error URLs before moving on to ads
        this.getChildrenNodesWithName(documentElement, VastNodeName.ERROR).map((element: HTMLElement) => {
            parseErrorURLTemplates.push(this.parseNodeText(element));
        });
        let errors: Error[] = [];
        // parse each Ad element
        this.getNodesWithName(documentElement, VastNodeName.AD).map((element: HTMLElement) => {
            if (ads.length <= 0) {
                const ad = this.parseAdElement(element);
                // ads.push(ad);
                const adErrors = VastValidator.validateVastAd(ad);
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

    private formatErrorMessage(errors: Error[]): Error {
        return new Error(`VAST parse encountered these errors while parsing:
            ${VastValidator.formatErrors(errors)}
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

    // recursively search for nodes with matching name
    private getNodesWithName(rootNode: HTMLElement, name: string): HTMLElement[] {
        let nodes: HTMLElement[] = [];
        if (rootNode.nodeName === name) {
            nodes.push(rootNode);
        }
        for (const node of rootNode.childNodes) {
            const childNodesWithName: HTMLElement[] = this.getNodesWithName(<HTMLElement>node, name);
            nodes = nodes.concat(childNodesWithName);
        }
        return nodes;
    }

    public retrieveVast(vast: any, core: ICoreApi, request: RequestManager, parent?: Vast, depth: number = 0): Promise<Vast> {
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

    private parseNodeText(node: HTMLElement): string {
        if (node.textContent) {
            return node.textContent.trim();
        } else {
            return '';
        }
    }

    private parseAdElement(adElement: HTMLElement): VastAd {
        // const vastAd = new VastAd();

        // use the first 'InLine' ad
        for (const element of this.getNodesWithName(adElement, VastNodeName.INLINE)) {
            const inlineAd = this.parseWrapperOrInLineElement(element);
            inlineAd.setId(adElement.getAttribute(VastAttributeNames.ID));
            return inlineAd;
        }
        // use the first 'Wrapper' ad if there is no 'InLine' ad
        for (const element of this.getNodesWithName(adElement, VastNodeName.WRAPPER)) {
            const wrapperAd = this.parseWrapperOrInLineElement(element);
            wrapperAd.setId(adElement.getAttribute(VastAttributeNames.ID));
            return wrapperAd;
        }

        // return undefined if there is no inline or wrapper ad
        return new VastAd();
    }

    private parseWrapperOrInLineElement(adElement: HTMLElement): VastAd {
        const vastAd = new VastAd();
        this.getNodesWithName(adElement, VastNodeName.VAST_AD_TAG_URI).map((element: HTMLElement) => {
            const url = this.parseNodeText(element);
            vastAd.addWrapperURL(url);
        });

        this.getNodesWithName(adElement, VastNodeName.ERROR).map((element: HTMLElement) => {
            const url = this.parseNodeText(element);
            vastAd.addErrorURLTemplate(url);
        });

        this.getNodesWithName(adElement, VastNodeName.IMPRESSION).map((element: HTMLElement) => {
            const url = this.parseNodeText(element);
            vastAd.addImpressionURLTemplate(url);
        });

        this.getNodesWithName(adElement, VastNodeName.LINEAR).map((element: HTMLElement) => {
            const creative = this.parseCreativeLinearElement(element);
            vastAd.addCreative(creative);
        });

        this.getNodesWithName(adElement, VastNodeName.COMPANION).map((element: HTMLElement) => {
            const companionAd = this.parseCreativeCompanionAdElement(element);
            vastAd.addCompanionAd(companionAd);
        });

        return vastAd;
    }

    private getIntAttribute(element: HTMLElement, attribute: string): number {
        const stringAttribute: string | null = element.getAttribute(attribute);
        return parseInt(stringAttribute || '0', 10);
    }

    private parseCreativeLinearElement(creativeElement: HTMLElement): VastCreativeLinear {
        const creative = new VastCreativeLinear();

        this.getNodesWithName(creativeElement, VastNodeName.DURATION).map((element: HTMLElement, index: number) => {
            if (index === 0) {
                const durationString = this.parseNodeText(element);
                creative.setDuration(this.parseDuration(durationString));
            }
        });

        const mediaDuration = creative.getDuration();
        const skipOffset = creativeElement.getAttribute(VastAttributeNames.SKIP_OFFSET);
        if (skipOffset == null) {
            creative.setSkipDelay(null);
        } else if (skipOffset.charAt(skipOffset.length - 1) === '%') {
            const percent = parseInt(skipOffset, 10);
            creative.setSkipDelay(creative.getDuration() * (percent / 100));
        } else {
            creative.setSkipDelay(this.parseDuration(skipOffset));
        }

        this.getNodesWithName(creativeElement, VastNodeName.CLICK_THROUGH).map((element: HTMLElement, index: number) => {
            if (index === 0) {
                const url = this.parseNodeText(element);
                creative.setVideoClickThroughURLTemplate(url);
            }
        });

        this.getNodesWithName(creativeElement, VastNodeName.CLICK_TRACKING).map((element: HTMLElement) => {
            const url = this.parseNodeText(element);
            creative.addVideoClickTrackingURLTemplate(url);
        });

        this.getNodesWithName(creativeElement, VastNodeName.TRACKING).map((element: HTMLElement) => {
            const url = this.parseNodeText(element);
            const eventName = element.getAttribute(VastAttributeNames.EVENT);
            if (eventName) {
                creative.addTrackingEvent(eventName, url);
            }
        });

        this.getNodesWithName(creativeElement, VastNodeName.MEDIA_FILE).map((element: HTMLElement) => {
            const bitrate = this.getIntAttribute(element, VastAttributeNames.BITRATE);
            const mediaFile = new VastMediaFile(
                this.parseNodeText(element),
                element.getAttribute(VastAttributeNames.DELIVERY),
                element.getAttribute(VastAttributeNames.CODEC),
                element.getAttribute(VastAttributeNames.TYPE),
                bitrate,
                this.getIntAttribute(element, VastAttributeNames.MIN_BITRATE),
                this.getIntAttribute(element, VastAttributeNames.MAX_BITRATE),
                this.getIntAttribute(element, VastAttributeNames.WIDTH),
                this.getIntAttribute(element, VastAttributeNames.HEIGHT),
                element.getAttribute(VastAttributeNames.API_FRAMEWORK),
                this.parseMediaFileSize(mediaDuration, bitrate)
            );
            creative.addMediaFile(mediaFile);
        });

        this.getNodesWithName(creativeElement, VastNodeName.AD_PARAMETERS).map((element: HTMLElement, index: number) => {
            if (index === 0) {
                const adParameters = this.parseNodeText(element);
                creative.setAdParameters(adParameters);
            }
        });

        return creative;
    }

    private parseCreativeCompanionAdElement(companionAdElement: HTMLElement): VastCreativeCompanionAd {
        const id = companionAdElement.getAttribute(VastAttributeNames.ID);
        const height = this.getIntAttribute(companionAdElement, VastAttributeNames.HEIGHT);
        const width = this.getIntAttribute(companionAdElement, VastAttributeNames.WIDTH);
        const companionAd = new VastCreativeCompanionAd(id, height, width);

        // Get tracking urls for companion ad
        this.getNodesWithName(companionAdElement, VastNodeName.TRACKING).map((element: HTMLElement) => {
            const url = this.parseNodeText(element);
            const eventName = element.getAttribute(VastAttributeNames.EVENT);
            if (eventName) {
                companionAd.addTrackingEvent(eventName, url);
            }
        });

        this.getNodesWithName(companionAdElement, VastNodeName.STATIC_RESOURCE).map((element: HTMLElement, index: number) => {
            if (index === 0) {
                const creativeType = element.getAttribute(VastAttributeNames.CREATIVE_TYPE);
                companionAd.setCreativeType(creativeType);
                companionAd.setStaticResourceURL(this.parseNodeText(element));
            }
        });
        this.getNodesWithName(companionAdElement, VastNodeName.COMPANION_CLICK_THROUGH).map((element: HTMLElement, index: number) => {
            if (index === 0) {
                companionAd.setCompanionClickThroughURLTemplate(this.parseNodeText(element));
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
