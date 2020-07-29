import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Vast } from 'VAST/Models/Vast';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { Url } from 'Core/Utilities/Url';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { VastAdValidator } from 'VAST/Validators/VastAdValidator';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { VastCompanionAdStaticResourceValidator } from 'VAST/Validators/VastCompanionAdStaticResourceValidator';
import { VastCompanionAdIframeResourceValidator } from 'VAST/Validators/VastCompanionAdIframeResourceValidator';
import { VastCompanionAdHTMLResourceValidator } from 'VAST/Validators/VastCompanionAdHTMLResourceValidator';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastCompanionAdHTMLResource } from 'VAST/Models/VastCompanionAdHTMLResource';
import { VastCompanionAdIframeResource } from 'VAST/Models/VastCompanionAdIframeResource';
import { DEFAULT_VENDOR_KEY } from 'Ads/Views/OpenMeasurement/OpenMeasurement';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SDKMetrics, OMMetric, VideoLengthMetric } from 'Ads/Utilities/SDKMetrics';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
import { OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';

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
    HTML_RESOURCE = 'HTMLResource',
    IFRAME_RESOURCE = 'IFrameResource',
    COMPANION_CLICK_THROUGH = 'CompanionClickThrough',
    COMPANION_CLICK_TRACKING = 'CompanionClickTracking',
    PARSE_ERROR = 'parsererror',
    VAST = 'VAST',
    EXTENSION = 'Extension',
    VERIFICATION = 'Verification',
    AD_VERIFICATIONS = 'AdVerifications', // for VAST 4.1
    JS_RESOURCE = 'JavaScriptResource',
    EX_RESOURCE = 'ExecutableResource',
    VERIFICATION_PARAMETERS = 'VerificationParameters'
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
    CREATIVE_TYPE = 'creativeType',
    BROWSER_OPTIONAL = 'browserOptional',
    VENDOR = 'vendor'
}

enum VastAttributeValues {
    VERIFICATION_NOT_EXECUTED = 'verificationNotExecuted' // for VAST 3.x and under
}

enum VastExtensionType {
    AD_VERIFICATIONS = 'AdVerifications'
}

export class VastParserStrict {

    private static DEFAULT_MAX_WRAPPER_DEPTH = 8;

    private _domParser: DOMParser;
    private _maxWrapperDepth: number;
    private _compiledCampaignErrors: CampaignError[];

    constructor(domParser?: DOMParser, maxWrapperDepth: number = VastParserStrict.DEFAULT_MAX_WRAPPER_DEPTH) {
        this._domParser = domParser || new DOMParser();
        this._maxWrapperDepth = maxWrapperDepth;
        this._compiledCampaignErrors = [];
    }

    public setMaxWrapperDepth(maxWrapperDepth: number) {
        this._maxWrapperDepth = maxWrapperDepth;
    }

    public parseVast(vast: string | null, urlProtocol: string = 'https:'): Vast {
        if (!vast) {
            throw new CampaignError('VAST data is missing', CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.XML_PARSER_ERROR);
        }

        const xml = this._domParser.parseFromString(vast, 'text/xml');
        const ads: VastAd[] = [];
        const parseErrorURLTemplates: string[] = [];

        this._compiledCampaignErrors = [];

        // use the parsererror tag from DomParser to give accurate error messages
        const parseErrors = xml.getElementsByTagName(VastNodeName.PARSE_ERROR);
        if (parseErrors.length > 0) {
            // then we have failed to parse the xml
            const parseMessages: string[] = [];
            for (const element of parseErrors) {
                if (element.textContent) {
                    parseMessages.push(element.textContent);
                }
            }
            throw new CampaignError(`VAST xml was not parseable:\n   ${parseMessages.join('\n    ')}`, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.XML_PARSER_ERROR);
        }

        if (!xml || !xml.documentElement || xml.documentElement.nodeName !== VastNodeName.VAST) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.XML_PARSER_ERROR], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.XML_PARSER_ERROR);
        }

        const documentElement = xml.documentElement;

        // collect error URLs before moving on to ads
        this.getChildrenNodesWithName(documentElement, VastNodeName.ERROR).forEach((element: HTMLElement) => {
            parseErrorURLTemplates.push(this.parseNodeText(element));
        });
        let isWarningLevel = true;
        // parse each Ad element
        this.getNodesWithName(documentElement, VastNodeName.AD).forEach((element: HTMLElement) => {
            if (ads.length <= 0) {
                const ad = this.parseAdElement(element, urlProtocol);
                const adErrors = new VastAdValidator(ad).getErrors();
                for (const adError of adErrors) {
                    if (adError.errorLevel !== CampaignErrorLevel.LOW) {
                        isWarningLevel = false;
                    }

                    if (adError.errorTrackingUrls.length === 0) {
                        adError.errorTrackingUrls = parseErrorURLTemplates.concat(ad.getErrorURLTemplates());
                    }
                }

                if (isWarningLevel) {
                    ads.push(ad);
                }

                this._compiledCampaignErrors = this._compiledCampaignErrors.concat(adErrors);
            }
        });

        // throw campaign error when it fails to get any vast ad
        if (ads.length === 0) {
            throw this.formatErrorMessage('Failed to parse VAST XML', this._compiledCampaignErrors);
        }

        // return vast ads with generated non-severe errors
        return new Vast(ads, parseErrorURLTemplates, this._compiledCampaignErrors);
    }

    // default to https: for relative urls
    public retrieveVast(vast: string, core: ICoreApi, request: RequestManager, bundleId?: string, isPublica = false, parent?: Vast, depth: number = 0, urlProtocol: string = 'https:'): Promise<Vast> {
        let parsedVast: Vast;

        try {
            parsedVast = this.parseVast(vast, urlProtocol);
        } catch (campaignError) {
            const errorData: {} = {
                vast: vast,
                wrapperDepth: depth,
                rootWrapperVast: depth === 0 ? vast : ''
            };
            campaignError.errorData = errorData;

            throw campaignError;
        }

        this.applyParentURLs(parsedVast, parent);
        parsedVast.setIsPublicaTag(!!isPublica);

        const wrapperURL = parsedVast.getWrapperURL();
        if (!wrapperURL) {
            return Promise.resolve(parsedVast);
        }

        return this.retrieveWrappedVast(wrapperURL, depth, parsedVast, core, request, isPublica, bundleId);
    }

    private retrieveWrappedVast(wrapperURL: string, depth: number, parsedVast: Vast, core: ICoreApi, request: RequestManager, isPublica?: boolean, bundleId?: string): Promise<Vast> {

        if (depth >= this._maxWrapperDepth) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED, parsedVast.getErrorURLTemplates(), wrapperURL, undefined, undefined);
        }

        core.Sdk.logDebug('Unity Ads is requesting VAST ad unit from ' + wrapperURL);
        const wrapperUrlProtocol = Url.getProtocol(wrapperURL);

        const headers: [string, string][] = [];

        // For IAS tags to return vast instead of vpaid for Open Measurement
        if (CustomFeatures.isIASVastTag(wrapperURL)) {
            wrapperURL = this.setIASURLHack(wrapperURL, bundleId);
            headers.push(['X-Device-Type', 'unity']);
            headers.push(['User-Agent', navigator.userAgent]);
            SDKMetrics.reportMetricEvent(OMMetric.IASNestedVastTagHackApplied);
            wrapperURL = decodeURIComponent(wrapperURL);
            isPublica = true;
        }

        return request.get(wrapperURL, headers, { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false }).then(response => {
            return this.retrieveVast(response.response, core, request, bundleId, isPublica, parsedVast, depth + 1, wrapperUrlProtocol);
        });
    }

    private setIASURLHack(wrapperURL: string, bundleId?: string) {
        let url = MacroUtil.replaceMacro(wrapperURL, { 'vast.adsafeprotected.com': 'vastpixel3.adsafeprotected.com', '%5BOMIDPARTNER%5D': OMID_P });
        const stringSplice = (str1: string, start: number, delCount: number, newSubStr: string) => str1.slice(0, start) + newSubStr + str1.slice(start + Math.abs(delCount));

        if (bundleId && /^https?:\/\/vastpixel3\.adsafeprotected\.com/.test(url) && url.includes('?')) {
            url = stringSplice(url, url.indexOf('?'), 1, `?bundleId=${bundleId}&`);
        } else if (bundleId && /^https?:\/\/vastpixel3\.adsafeprotected\.com/.test(url)) {
            url += `?bundleId=${bundleId}&`;
        }

        return url;
    }

    private getVideoSizeInBytes(duration: number, kbitrate: number): number {
        // returning file size in byte from bit
        return (duration * kbitrate * 1000) / 8;
    }

    private formatErrorMessage(msg: string, errors: CampaignError[]): CampaignError {
        const consolidatedCampaignError = new CampaignError(msg, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.XML_PARSER_ERROR);
        for (const e of errors) {
            consolidatedCampaignError.addSubCampaignError(e);
        }
        return consolidatedCampaignError;
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
            if (ad && parsedAd) {
                for (const errorUrl of ad.getErrorURLTemplates()) {
                    parsedAd.addErrorURLTemplate(errorUrl);
                }
                for (const impressionUrl of ad.getImpressionURLTemplates()) {
                    parsedAd.addImpressionURLTemplate(impressionUrl);
                }
                for (const clickTrackingUrl of ad.getVideoClickTrackingURLTemplates()) {
                    parsedAd.addVideoClickTrackingURLTemplate(clickTrackingUrl);
                }
                for (const eventName of Object.keys(TrackingEvent).map((event) => TrackingEvent[<keyof typeof TrackingEvent>event])) {
                    for (const url of parent.getTrackingEventUrls(eventName)) {
                        parsedVast.addTrackingEventUrl(eventName, url);
                    }
                }

                const verifications = [];
                for (const adVerifications of ad.getAdVerifications()) {
                    verifications.push(adVerifications);
                }
                parsedAd.addAdVerifications(verifications);
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
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (url) {
                vastAd.addWrapperURL(url);
            }
        });

        this.getNodesWithName(adElement, VastNodeName.ERROR).forEach((element: HTMLElement) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (url) {
                vastAd.addErrorURLTemplate(url);
            }
        });

        this.getNodesWithName(adElement, VastNodeName.IMPRESSION).forEach((element: HTMLElement) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (url) {
                vastAd.addImpressionURLTemplate(url);
            }
        });

        this.getNodesWithName(adElement, VastNodeName.LINEAR).forEach((element: HTMLElement) => {
            const creative = this.parseCreativeLinearElement(element, urlProtocol);
            vastAd.addCreative(creative);
        });

        this.getNodesWithName(adElement, VastNodeName.COMPANION).forEach((element: HTMLElement) => {
            const staticResourceElement = this.getFirstNodeWithName(element, VastNodeName.STATIC_RESOURCE);
            const iframeResourceElement = this.getFirstNodeWithName(element, VastNodeName.IFRAME_RESOURCE);
            const htmlResourceElement = this.getFirstNodeWithName(element, VastNodeName.HTML_RESOURCE);

            if (staticResourceElement) {
                const companionAd = this.parseCompanionAdStaticResourceElement(element, urlProtocol);
                const companionAdErrors = new VastCompanionAdStaticResourceValidator(companionAd).getErrors();
                let isWarningLevel = true;
                for (const adError of companionAdErrors) {
                    if (adError.errorLevel !== CampaignErrorLevel.LOW) {
                        if (adError.errorTrackingUrls.length === 0) {
                            adError.errorTrackingUrls = vastAd.getErrorURLTemplates();
                        }
                        this._compiledCampaignErrors.push(adError);
                        isWarningLevel = false;
                        break;
                    }
                }
                if (isWarningLevel) {
                    vastAd.addStaticCompanionAd(companionAd);
                } else {
                    vastAd.addUnsupportedCompanionAd(`reason: ${companionAdErrors.join(' ')} ${element.outerHTML}`);
                }
            }

            if (iframeResourceElement) {
                const companionAd = this.parseCompanionAdIframeResourceElement(element, urlProtocol);
                const companionAdErrors = new VastCompanionAdIframeResourceValidator(companionAd).getErrors();
                let isWarningLevel = true;
                for (const adError of companionAdErrors) {
                    if (adError.errorLevel !== CampaignErrorLevel.LOW) {
                        if (adError.errorTrackingUrls.length === 0) {
                            adError.errorTrackingUrls = vastAd.getErrorURLTemplates();
                        }
                        this._compiledCampaignErrors.push(adError);
                        isWarningLevel = false;
                        break;
                    }
                }
                if (isWarningLevel) {
                    vastAd.addIframeCompanionAd(companionAd);
                } else {
                    vastAd.addUnsupportedCompanionAd(`reason: ${companionAdErrors.join(' ')} ${element.outerHTML}`);
                }
            }

            if (htmlResourceElement) {
                const companionAd = this.parseCompanionAdHTMLResourceElement(element, urlProtocol);
                const companionAdErrors = new VastCompanionAdHTMLResourceValidator(companionAd).getErrors();
                let isWarningLevel = true;
                for (const adError of companionAdErrors) {
                    if (adError.errorLevel !== CampaignErrorLevel.LOW) {
                        if (adError.errorTrackingUrls.length === 0) {
                            adError.errorTrackingUrls = vastAd.getErrorURLTemplates();
                        }
                        this._compiledCampaignErrors.push(adError);
                        isWarningLevel = false;
                        break;
                    }
                }
                if (isWarningLevel) {
                    vastAd.addHtmlCompanionAd(companionAd);
                } else {
                    vastAd.addUnsupportedCompanionAd(`reason: ${companionAdErrors.join(' ')} ${element.outerHTML}`);
                }
            }
        });

        // parsing ad verification in VAST 4.1
        this.getChildrenNodesWithName(adElement, VastNodeName.AD_VERIFICATIONS).forEach((element: HTMLElement) => {
            const verifications = this.parseAdVerification(element, urlProtocol);
            verifications.forEach((verification) => {
                if (CustomFeatures.isIASVendor(verification.getVerificationVendor())) {
                    SDKMetrics.reportMetricEvent(OMMetric.IASVASTVerificationParsed);
                }
            });
            vastAd.addAdVerifications(verifications);
        });

        // parsing ad verification in VAST 3.0/2.0
        this.getNodesWithName(adElement, VastNodeName.EXTENSION).forEach((element: HTMLElement) => {
            const extType = element.getAttribute(VastAttributeNames.TYPE);
            if (extType && extType === VastExtensionType.AD_VERIFICATIONS) {
                const verifications = this.parseAdVerification(element, urlProtocol);
                verifications.forEach((verification) => {
                    if (CustomFeatures.isIASVendor(verification.getVerificationVendor())) {
                        SDKMetrics.reportMetricEvent(OMMetric.IASVASTVerificationParsed);
                    }
                });

                vastAd.addAdVerifications(verifications);
            }
        });

        return vastAd;
    }

    private parseAdVerification(verificationElement: HTMLElement, urlProtocol: string): VastAdVerification[] {
        const vastAdVerifications: VastAdVerification[] = [];
        this.getNodesWithName(verificationElement, VastNodeName.VERIFICATION).forEach((element: HTMLElement) => {
            const vastVerificationResources: VastVerificationResource[] = [];
            const vendor = element.getAttribute(VastAttributeNames.VENDOR) || DEFAULT_VENDOR_KEY;
            this.getNodesWithName(element, VastNodeName.JS_RESOURCE).forEach((jsElement: HTMLElement) => {
                const resourceUrl = this.parseVastUrl(this.parseNodeText(jsElement), urlProtocol);
                const apiFramework = jsElement.getAttribute(VastAttributeNames.API_FRAMEWORK);
                const browserOptional = jsElement.getAttribute(VastAttributeNames.BROWSER_OPTIONAL) === 'false' ? false : true;
                if (resourceUrl && apiFramework) {
                    const vastVerificationResource = new VastVerificationResource(resourceUrl, apiFramework, browserOptional);
                    vastVerificationResources.push(vastVerificationResource);
                }
            });

            const verificationParams = this.getFirstNodeWithName(element, VastNodeName.VERIFICATION_PARAMETERS);
            let verificationParamText;
            if (verificationParams) {
                verificationParamText = this.parseNodeText(verificationParams);
            }

            const vastAdVerification = new VastAdVerification(vendor, vastVerificationResources, verificationParamText);
            this.getNodesWithName(element, VastNodeName.TRACKING).forEach((trackingElement: HTMLElement) => {
                const url = this.parseVastUrl(this.parseNodeText(trackingElement), urlProtocol);
                const eventName = trackingElement.getAttribute(VastAttributeNames.EVENT);
                if (eventName && eventName === VastAttributeValues.VERIFICATION_NOT_EXECUTED && url) {
                    vastAdVerification.setVerificationTrackingEvent(url);
                }
            });

            if (vastAdVerification.getVerficationResources() && vastAdVerification.getVerificationVendor()) {
                vastAdVerifications.push(vastAdVerification);
            }
        });

        return vastAdVerifications;
    }

    private getIntAttribute(element: HTMLElement, attribute: string): number {
        const stringAttribute: string | null = element.getAttribute(attribute);
        return parseInt(stringAttribute || '0', 10);
    }

    private parseCreativeLinearElement(creativeElement: HTMLElement, urlProtocol: string): VastCreativeLinear {
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
            const url = this.parseVastUrl(this.parseNodeText(clickThroughElement), urlProtocol);
            if (url) {
                creative.setVideoClickThroughURLTemplate(url);
            }
        }

        this.getNodesWithName(creativeElement, VastNodeName.CLICK_TRACKING).forEach((element: HTMLElement) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (url) {
                creative.addVideoClickTrackingURLTemplate(url);
            }
        });

        this.getNodesWithName(creativeElement, VastNodeName.TRACKING).forEach((element: HTMLElement) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            const eventName = element.getAttribute(VastAttributeNames.EVENT);
            if (eventName && url) {
                creative.addTrackingEvent(eventName, url);
            }
        });

        this.getNodesWithName(creativeElement, VastNodeName.MEDIA_FILE).forEach((element: HTMLElement) => {
            const bitrate = this.getIntAttribute(element, VastAttributeNames.BITRATE);
            const mediaUrl = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (mediaUrl) {
                const mediaFile = new VastMediaFile(
                    mediaUrl,
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
            }
        });

        const adParamsElement = this.getFirstNodeWithName(creativeElement, VastNodeName.AD_PARAMETERS);
        if (adParamsElement) {
            const adParameters = this.parseNodeText(adParamsElement);
            creative.setAdParameters(adParameters);
        }

        return creative;
    }

    private parseCompanionAdStaticResourceElement(companionAdElement: HTMLElement, urlProtocol: string): VastCompanionAdStaticResource {
        const id = companionAdElement.getAttribute(VastAttributeNames.ID);
        const height = this.getIntAttribute(companionAdElement, VastAttributeNames.HEIGHT);
        const width = this.getIntAttribute(companionAdElement, VastAttributeNames.WIDTH);
        const companionAd = new VastCompanionAdStaticResource(id, height, width);

        // Get tracking urls for companion ad
        this.getNodesWithName(companionAdElement, VastNodeName.TRACKING).forEach((element: HTMLElement) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            const eventName = element.getAttribute(VastAttributeNames.EVENT);
            if (url && eventName) {
                companionAd.addTrackingEvent(eventName, url);
            }
        });

        const staticResourceElement = this.getFirstNodeWithName(companionAdElement, VastNodeName.STATIC_RESOURCE);
        if (staticResourceElement) {
            // if 'creativeType' attribute not found try 'type'
            const creativeType = staticResourceElement.getAttribute(VastAttributeNames.CREATIVE_TYPE) || staticResourceElement.getAttribute(VastAttributeNames.TYPE);
            companionAd.setCreativeType(creativeType);
            const staticResourceUrl = this.parseVastUrl(this.parseNodeText(staticResourceElement), urlProtocol);
            if (staticResourceUrl) {
                companionAd.setStaticResourceURL(staticResourceUrl);
            }
        }

        const companionClickThroughElement = this.getFirstNodeWithName(companionAdElement, VastNodeName.COMPANION_CLICK_THROUGH);
        if (companionClickThroughElement) {
            const companionClickThroughUrl = this.parseVastUrl(this.parseNodeText(companionClickThroughElement), urlProtocol);
            if (companionClickThroughUrl) {
                companionAd.setCompanionClickThroughURLTemplate(companionClickThroughUrl);
            }
        }

        this.getNodesWithName(companionAdElement, VastNodeName.COMPANION_CLICK_TRACKING).forEach((element: HTMLElement) => {
            const companionClickTrackingUrl = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (companionClickTrackingUrl) {
                companionAd.addCompanionClickTrackingURLTemplate(companionClickTrackingUrl);
            }
        });
        return companionAd;
    }

    private parseCompanionAdIframeResourceElement(companionAdElement: HTMLElement, urlProtocol: string): VastCompanionAdIframeResource {
        const id = companionAdElement.getAttribute(VastAttributeNames.ID);
        const height = this.getIntAttribute(companionAdElement, VastAttributeNames.HEIGHT);
        const width = this.getIntAttribute(companionAdElement, VastAttributeNames.WIDTH);
        const companionAd = new VastCompanionAdIframeResource(id, height, width);

        const iframeResource = this.getFirstNodeWithName(companionAdElement, VastNodeName.IFRAME_RESOURCE);
        if (iframeResource) {
            const iframeUrl = this.parseVastUrl(this.parseNodeText(iframeResource), urlProtocol);
            if (iframeUrl) {
                companionAd.setIframeResourceURL(iframeUrl);
            }
        }
        return companionAd;
    }

    private parseCompanionAdHTMLResourceElement(companionAdElement: HTMLElement, urlProtocol: string): VastCompanionAdHTMLResource {
        const id = companionAdElement.getAttribute(VastAttributeNames.ID);
        const height = this.getIntAttribute(companionAdElement, VastAttributeNames.HEIGHT);
        const width = this.getIntAttribute(companionAdElement, VastAttributeNames.WIDTH);
        const companionAd = new VastCompanionAdHTMLResource(id, height, width);

        const htmlResource = this.getFirstNodeWithName(companionAdElement, VastNodeName.HTML_RESOURCE);
        if (htmlResource) {
            const htmlContent = this.parseNodeText(htmlResource);
            if (htmlContent.length > 0) {
                companionAd.setHtmlResourceContent(htmlContent);
            }
        }
        return companionAd;
    }

    private parseVastUrl(maybeUrl: string, urlProtocol: string): string | undefined {
        let url: string = maybeUrl;
        // check if relative url ex: '//www.google.com/hello'
        if (Url.isRelativeProtocol(url)) {
            url = `${urlProtocol}${url}`;
        }
        // decode http%3A%2F%2F && https%3A%2F%2F then re-encode url
        url = Url.encodeUrlWithQueryParams(Url.decodeProtocol(url));
        if (Url.isValidUrlCharacters(url) && Url.isValidProtocol(url)) {
            return url;
        } else {
            return undefined;
        }
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
