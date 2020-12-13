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
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { SDKMetrics, OMMetric } from 'Ads/Utilities/SDKMetrics';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';
import { OMID_P } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
var VastNodeName;
(function (VastNodeName) {
    VastNodeName["ERROR"] = "Error";
    VastNodeName["AD"] = "Ad";
    VastNodeName["WRAPPER"] = "Wrapper";
    VastNodeName["INLINE"] = "InLine";
    VastNodeName["VAST_AD_TAG_URI"] = "VASTAdTagURI";
    VastNodeName["IMPRESSION"] = "Impression";
    VastNodeName["LINEAR"] = "Linear";
    VastNodeName["COMPANION"] = "Companion";
    VastNodeName["DURATION"] = "Duration";
    VastNodeName["CLICK_THROUGH"] = "ClickThrough";
    VastNodeName["CLICK_TRACKING"] = "ClickTracking";
    VastNodeName["TRACKING"] = "Tracking";
    VastNodeName["MEDIA_FILE"] = "MediaFile";
    VastNodeName["AD_PARAMETERS"] = "AdParameters";
    VastNodeName["STATIC_RESOURCE"] = "StaticResource";
    VastNodeName["HTML_RESOURCE"] = "HTMLResource";
    VastNodeName["IFRAME_RESOURCE"] = "IFrameResource";
    VastNodeName["COMPANION_CLICK_THROUGH"] = "CompanionClickThrough";
    VastNodeName["COMPANION_CLICK_TRACKING"] = "CompanionClickTracking";
    VastNodeName["PARSE_ERROR"] = "parsererror";
    VastNodeName["VAST"] = "VAST";
    VastNodeName["EXTENSION"] = "Extension";
    VastNodeName["VERIFICATION"] = "Verification";
    VastNodeName["AD_VERIFICATIONS"] = "AdVerifications";
    VastNodeName["JS_RESOURCE"] = "JavaScriptResource";
    VastNodeName["EX_RESOURCE"] = "ExecutableResource";
    VastNodeName["VERIFICATION_PARAMETERS"] = "VerificationParameters";
})(VastNodeName || (VastNodeName = {}));
var VastAttributeNames;
(function (VastAttributeNames) {
    VastAttributeNames["ID"] = "id";
    VastAttributeNames["SKIP_OFFSET"] = "skipoffset";
    VastAttributeNames["EVENT"] = "event";
    VastAttributeNames["DELIVERY"] = "delivery";
    VastAttributeNames["CODEC"] = "codec";
    VastAttributeNames["TYPE"] = "type";
    VastAttributeNames["BITRATE"] = "bitrate";
    VastAttributeNames["MIN_BITRATE"] = "minBitrate";
    VastAttributeNames["MAX_BITRATE"] = "maxBitrate";
    VastAttributeNames["WIDTH"] = "width";
    VastAttributeNames["HEIGHT"] = "height";
    VastAttributeNames["API_FRAMEWORK"] = "apiFramework";
    VastAttributeNames["CREATIVE_TYPE"] = "creativeType";
    VastAttributeNames["BROWSER_OPTIONAL"] = "browserOptional";
    VastAttributeNames["VENDOR"] = "vendor";
})(VastAttributeNames || (VastAttributeNames = {}));
var VastAttributeValues;
(function (VastAttributeValues) {
    VastAttributeValues["VERIFICATION_NOT_EXECUTED"] = "verificationNotExecuted"; // for VAST 3.x and under
})(VastAttributeValues || (VastAttributeValues = {}));
var VastExtensionType;
(function (VastExtensionType) {
    VastExtensionType["AD_VERIFICATIONS"] = "AdVerifications";
})(VastExtensionType || (VastExtensionType = {}));
export class VastParserStrict {
    constructor(domParser, maxWrapperDepth = VastParserStrict.DEFAULT_MAX_WRAPPER_DEPTH) {
        this._domParser = domParser || new DOMParser();
        this._maxWrapperDepth = maxWrapperDepth;
        this._compiledCampaignErrors = [];
    }
    setMaxWrapperDepth(maxWrapperDepth) {
        this._maxWrapperDepth = maxWrapperDepth;
    }
    parseVast(vast, urlProtocol = 'https:') {
        if (!vast) {
            throw new CampaignError('VAST data is missing', CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.XML_PARSER_ERROR);
        }
        const xml = this._domParser.parseFromString(vast, 'text/xml');
        const ads = [];
        const parseErrorURLTemplates = [];
        this._compiledCampaignErrors = [];
        // use the parsererror tag from DomParser to give accurate error messages
        const parseErrors = xml.getElementsByTagName(VastNodeName.PARSE_ERROR);
        if (parseErrors.length > 0) {
            // then we have failed to parse the xml
            const parseMessages = [];
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
        this.getChildrenNodesWithName(documentElement, VastNodeName.ERROR).forEach((element) => {
            parseErrorURLTemplates.push(this.parseNodeText(element));
        });
        let isWarningLevel = true;
        // parse each Ad element
        this.getNodesWithName(documentElement, VastNodeName.AD).forEach((element) => {
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
    retrieveVast(vast, core, request, bundleId, isPublica = false, parent, depth = 0, urlProtocol = 'https:') {
        let parsedVast;
        try {
            parsedVast = this.parseVast(vast, urlProtocol);
        }
        catch (campaignError) {
            const errorData = {
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
    retrieveWrappedVast(wrapperURL, depth, parsedVast, core, request, isPublica, bundleId) {
        if (depth >= this._maxWrapperDepth) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED, parsedVast.getErrorURLTemplates(), wrapperURL, undefined, undefined);
        }
        core.Sdk.logDebug('Unity Ads is requesting VAST ad unit from ' + wrapperURL);
        const wrapperUrlProtocol = Url.getProtocol(wrapperURL);
        const headers = [];
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
    setIASURLHack(wrapperURL, bundleId) {
        let url = MacroUtil.replaceMacro(wrapperURL, { 'vast.adsafeprotected.com': 'vastpixel3.adsafeprotected.com', '%5BOMIDPARTNER%5D': OMID_P });
        const stringSplice = (str1, start, delCount, newSubStr) => str1.slice(0, start) + newSubStr + str1.slice(start + Math.abs(delCount));
        if (bundleId && /^https?:\/\/vastpixel3\.adsafeprotected\.com/.test(url) && url.includes('?')) {
            url = stringSplice(url, url.indexOf('?'), 1, `?bundleId=${bundleId}&`);
        }
        else if (bundleId && /^https?:\/\/vastpixel3\.adsafeprotected\.com/.test(url)) {
            url += `?bundleId=${bundleId}&`;
        }
        return url;
    }
    getVideoSizeInBytes(duration, kbitrate) {
        // returning file size in byte from bit
        return (duration * kbitrate * 1000) / 8;
    }
    formatErrorMessage(msg, errors) {
        const consolidatedCampaignError = new CampaignError(msg, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, VastErrorCode.XML_PARSER_ERROR);
        for (const e of errors) {
            consolidatedCampaignError.addSubCampaignError(e);
        }
        return consolidatedCampaignError;
    }
    // only searches direct children for nodes with matching name
    getChildrenNodesWithName(node, name) {
        const nodes = [];
        for (const child of node.childNodes) {
            if (child.nodeName === name) {
                nodes.push(child);
            }
        }
        return nodes;
    }
    // search for nodes with matching name
    getNodesWithName(rootNode, name) {
        const nodeList = rootNode.querySelectorAll(name);
        return Array.prototype.slice.call(nodeList);
    }
    getFirstNodeWithName(rootNode, name) {
        return rootNode.querySelector(name);
    }
    applyParentURLs(parsedVast, parent) {
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
                for (const eventName of Object.keys(TrackingEvent).map((event) => TrackingEvent[event])) {
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
    parseNodeText(node) {
        if (node.textContent) {
            return node.textContent.trim();
        }
        else {
            return '';
        }
    }
    parseAdElement(adElement, urlProtocol) {
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
    parseAdContent(adElement, urlProtocol) {
        const vastAd = new VastAd();
        this.getNodesWithName(adElement, VastNodeName.VAST_AD_TAG_URI).forEach((element) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (url) {
                vastAd.addWrapperURL(url);
            }
        });
        this.getNodesWithName(adElement, VastNodeName.ERROR).forEach((element) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (url) {
                vastAd.addErrorURLTemplate(url);
            }
        });
        this.getNodesWithName(adElement, VastNodeName.IMPRESSION).forEach((element) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (url) {
                vastAd.addImpressionURLTemplate(url);
            }
        });
        this.getNodesWithName(adElement, VastNodeName.LINEAR).forEach((element) => {
            const creative = this.parseCreativeLinearElement(element, urlProtocol);
            vastAd.addCreative(creative);
        });
        this.getNodesWithName(adElement, VastNodeName.COMPANION).forEach((element) => {
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
                }
                else {
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
                }
                else {
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
                }
                else {
                    vastAd.addUnsupportedCompanionAd(`reason: ${companionAdErrors.join(' ')} ${element.outerHTML}`);
                }
            }
        });
        // parsing ad verification in VAST 4.1
        this.getChildrenNodesWithName(adElement, VastNodeName.AD_VERIFICATIONS).forEach((element) => {
            const verifications = this.parseAdVerification(element, urlProtocol);
            verifications.forEach((verification) => {
                if (CustomFeatures.isIASVendor(verification.getVerificationVendor())) {
                    SDKMetrics.reportMetricEvent(OMMetric.IASVASTVerificationParsed);
                }
            });
            vastAd.addAdVerifications(verifications);
        });
        // parsing ad verification in VAST 3.0/2.0
        this.getNodesWithName(adElement, VastNodeName.EXTENSION).forEach((element) => {
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
    parseAdVerification(verificationElement, urlProtocol) {
        const vastAdVerifications = [];
        this.getNodesWithName(verificationElement, VastNodeName.VERIFICATION).forEach((element) => {
            const vastVerificationResources = [];
            const vendor = element.getAttribute(VastAttributeNames.VENDOR) || DEFAULT_VENDOR_KEY;
            this.getNodesWithName(element, VastNodeName.JS_RESOURCE).forEach((jsElement) => {
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
            this.getNodesWithName(element, VastNodeName.TRACKING).forEach((trackingElement) => {
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
    getIntAttribute(element, attribute) {
        const stringAttribute = element.getAttribute(attribute);
        return parseInt(stringAttribute || '0', 10);
    }
    parseCreativeLinearElement(creativeElement, urlProtocol) {
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
            }
            else {
                creative.setSkipDelay(this.parseDuration(skipOffset));
            }
        }
        else {
            creative.setSkipDelay(null);
        }
        const clickThroughElement = this.getFirstNodeWithName(creativeElement, VastNodeName.CLICK_THROUGH);
        if (clickThroughElement) {
            const url = this.parseVastUrl(this.parseNodeText(clickThroughElement), urlProtocol);
            if (url) {
                creative.setVideoClickThroughURLTemplate(url);
            }
        }
        this.getNodesWithName(creativeElement, VastNodeName.CLICK_TRACKING).forEach((element) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (url) {
                creative.addVideoClickTrackingURLTemplate(url);
            }
        });
        this.getNodesWithName(creativeElement, VastNodeName.TRACKING).forEach((element) => {
            const url = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            const eventName = element.getAttribute(VastAttributeNames.EVENT);
            if (eventName && url) {
                creative.addTrackingEvent(eventName, url);
            }
        });
        this.getNodesWithName(creativeElement, VastNodeName.MEDIA_FILE).forEach((element) => {
            const bitrate = this.getIntAttribute(element, VastAttributeNames.BITRATE);
            const mediaUrl = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (mediaUrl) {
                const mediaFile = new VastMediaFile(mediaUrl, element.getAttribute(VastAttributeNames.DELIVERY), element.getAttribute(VastAttributeNames.CODEC), element.getAttribute(VastAttributeNames.TYPE), bitrate, this.getIntAttribute(element, VastAttributeNames.MIN_BITRATE), this.getIntAttribute(element, VastAttributeNames.MAX_BITRATE), this.getIntAttribute(element, VastAttributeNames.WIDTH), this.getIntAttribute(element, VastAttributeNames.HEIGHT), element.getAttribute(VastAttributeNames.API_FRAMEWORK), this.getVideoSizeInBytes(mediaDuration, bitrate));
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
    parseCompanionAdStaticResourceElement(companionAdElement, urlProtocol) {
        const id = companionAdElement.getAttribute(VastAttributeNames.ID);
        const height = this.getIntAttribute(companionAdElement, VastAttributeNames.HEIGHT);
        const width = this.getIntAttribute(companionAdElement, VastAttributeNames.WIDTH);
        const companionAd = new VastCompanionAdStaticResource(id, height, width);
        // Get tracking urls for companion ad
        this.getNodesWithName(companionAdElement, VastNodeName.TRACKING).forEach((element) => {
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
        this.getNodesWithName(companionAdElement, VastNodeName.COMPANION_CLICK_TRACKING).forEach((element) => {
            const companionClickTrackingUrl = this.parseVastUrl(this.parseNodeText(element), urlProtocol);
            if (companionClickTrackingUrl) {
                companionAd.addCompanionClickTrackingURLTemplate(companionClickTrackingUrl);
            }
        });
        return companionAd;
    }
    parseCompanionAdIframeResourceElement(companionAdElement, urlProtocol) {
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
    parseCompanionAdHTMLResourceElement(companionAdElement, urlProtocol) {
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
    parseVastUrl(maybeUrl, urlProtocol) {
        let url = maybeUrl;
        // check if relative url ex: '//www.google.com/hello'
        if (Url.isRelativeProtocol(url)) {
            url = `${urlProtocol}${url}`;
        }
        // decode http%3A%2F%2F && https%3A%2F%2F then re-encode url
        url = Url.encodeUrlWithQueryParams(Url.decodeProtocol(url));
        if (Url.isValidUrlCharacters(url) && Url.isValidProtocol(url)) {
            return url;
        }
        else {
            return undefined;
        }
    }
    parseDuration(durationString) {
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
VastParserStrict.DEFAULT_MAX_WRAPPER_DEPTH = 8;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFBhcnNlclN0cmljdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL1V0aWxpdGllcy9WYXN0UGFyc2VyU3RyaWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUN4QyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDNUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLGFBQWEsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQzNGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUNsRSxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQztBQUNoRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDcEUsT0FBTyxFQUFFLHNDQUFzQyxFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDaEgsT0FBTyxFQUFFLHNDQUFzQyxFQUFFLE1BQU0sd0RBQXdELENBQUM7QUFDaEgsT0FBTyxFQUFFLG9DQUFvQyxFQUFFLE1BQU0sc0RBQXNELENBQUM7QUFDNUcsT0FBTyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzdFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzFGLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBQ3RGLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBQzFGLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDJDQUEyQyxDQUFDO0FBRS9FLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFFNUUsSUFBSyxZQTRCSjtBQTVCRCxXQUFLLFlBQVk7SUFDYiwrQkFBZSxDQUFBO0lBQ2YseUJBQVMsQ0FBQTtJQUNULG1DQUFtQixDQUFBO0lBQ25CLGlDQUFpQixDQUFBO0lBQ2pCLGdEQUFnQyxDQUFBO0lBQ2hDLHlDQUF5QixDQUFBO0lBQ3pCLGlDQUFpQixDQUFBO0lBQ2pCLHVDQUF1QixDQUFBO0lBQ3ZCLHFDQUFxQixDQUFBO0lBQ3JCLDhDQUE4QixDQUFBO0lBQzlCLGdEQUFnQyxDQUFBO0lBQ2hDLHFDQUFxQixDQUFBO0lBQ3JCLHdDQUF3QixDQUFBO0lBQ3hCLDhDQUE4QixDQUFBO0lBQzlCLGtEQUFrQyxDQUFBO0lBQ2xDLDhDQUE4QixDQUFBO0lBQzlCLGtEQUFrQyxDQUFBO0lBQ2xDLGlFQUFpRCxDQUFBO0lBQ2pELG1FQUFtRCxDQUFBO0lBQ25ELDJDQUEyQixDQUFBO0lBQzNCLDZCQUFhLENBQUE7SUFDYix1Q0FBdUIsQ0FBQTtJQUN2Qiw2Q0FBNkIsQ0FBQTtJQUM3QixvREFBb0MsQ0FBQTtJQUNwQyxrREFBa0MsQ0FBQTtJQUNsQyxrREFBa0MsQ0FBQTtJQUNsQyxrRUFBa0QsQ0FBQTtBQUN0RCxDQUFDLEVBNUJJLFlBQVksS0FBWixZQUFZLFFBNEJoQjtBQUVELElBQUssa0JBZ0JKO0FBaEJELFdBQUssa0JBQWtCO0lBQ25CLCtCQUFTLENBQUE7SUFDVCxnREFBMEIsQ0FBQTtJQUMxQixxQ0FBZSxDQUFBO0lBQ2YsMkNBQXFCLENBQUE7SUFDckIscUNBQWUsQ0FBQTtJQUNmLG1DQUFhLENBQUE7SUFDYix5Q0FBbUIsQ0FBQTtJQUNuQixnREFBMEIsQ0FBQTtJQUMxQixnREFBMEIsQ0FBQTtJQUMxQixxQ0FBZSxDQUFBO0lBQ2YsdUNBQWlCLENBQUE7SUFDakIsb0RBQThCLENBQUE7SUFDOUIsb0RBQThCLENBQUE7SUFDOUIsMERBQW9DLENBQUE7SUFDcEMsdUNBQWlCLENBQUE7QUFDckIsQ0FBQyxFQWhCSSxrQkFBa0IsS0FBbEIsa0JBQWtCLFFBZ0J0QjtBQUVELElBQUssbUJBRUo7QUFGRCxXQUFLLG1CQUFtQjtJQUNwQiw0RUFBcUQsQ0FBQSxDQUFDLHlCQUF5QjtBQUNuRixDQUFDLEVBRkksbUJBQW1CLEtBQW5CLG1CQUFtQixRQUV2QjtBQUVELElBQUssaUJBRUo7QUFGRCxXQUFLLGlCQUFpQjtJQUNsQix5REFBb0MsQ0FBQTtBQUN4QyxDQUFDLEVBRkksaUJBQWlCLEtBQWpCLGlCQUFpQixRQUVyQjtBQUVELE1BQU0sT0FBTyxnQkFBZ0I7SUFRekIsWUFBWSxTQUFxQixFQUFFLGtCQUEwQixnQkFBZ0IsQ0FBQyx5QkFBeUI7UUFDbkcsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLElBQUksSUFBSSxTQUFTLEVBQUUsQ0FBQztRQUMvQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1FBQ3hDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUVNLGtCQUFrQixDQUFDLGVBQXVCO1FBQzdDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7SUFDNUMsQ0FBQztJQUVNLFNBQVMsQ0FBQyxJQUFtQixFQUFFLGNBQXNCLFFBQVE7UUFDaEUsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNQLE1BQU0sSUFBSSxhQUFhLENBQUMsc0JBQXNCLEVBQUUsb0JBQW9CLENBQUMsZ0JBQWdCLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQ25KO1FBRUQsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlELE1BQU0sR0FBRyxHQUFhLEVBQUUsQ0FBQztRQUN6QixNQUFNLHNCQUFzQixHQUFhLEVBQUUsQ0FBQztRQUU1QyxJQUFJLENBQUMsdUJBQXVCLEdBQUcsRUFBRSxDQUFDO1FBRWxDLHlFQUF5RTtRQUN6RSxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsb0JBQW9CLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZFLElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDeEIsdUNBQXVDO1lBQ3ZDLE1BQU0sYUFBYSxHQUFhLEVBQUUsQ0FBQztZQUNuQyxLQUFLLE1BQU0sT0FBTyxJQUFJLFdBQVcsRUFBRTtnQkFDL0IsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFO29CQUNyQixhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDM0M7YUFDSjtZQUNELE1BQU0sSUFBSSxhQUFhLENBQUMsbUNBQW1DLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDOUw7UUFFRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDLFFBQVEsS0FBSyxZQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3BGLE1BQU0sSUFBSSxhQUFhLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDbkw7UUFFRCxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsZUFBZSxDQUFDO1FBRTVDLDZDQUE2QztRQUM3QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUU7WUFDaEcsc0JBQXNCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUM3RCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksY0FBYyxHQUFHLElBQUksQ0FBQztRQUMxQix3QkFBd0I7UUFDeEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBb0IsRUFBRSxFQUFFO1lBQ3JGLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQ2pCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNyRCxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDckQsS0FBSyxNQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7b0JBQzVCLElBQUksT0FBTyxDQUFDLFVBQVUsS0FBSyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7d0JBQy9DLGNBQWMsR0FBRyxLQUFLLENBQUM7cUJBQzFCO29CQUVELElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3hDLE9BQU8sQ0FBQyxpQkFBaUIsR0FBRyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQ0FBQztxQkFDeEY7aUJBQ0o7Z0JBRUQsSUFBSSxjQUFjLEVBQUU7b0JBQ2hCLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ2hCO2dCQUVELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ2hGO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCx3REFBd0Q7UUFDeEQsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNsQixNQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztTQUMzRjtRQUVELG1EQUFtRDtRQUNuRCxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQsc0NBQXNDO0lBQy9CLFlBQVksQ0FBQyxJQUFZLEVBQUUsSUFBYyxFQUFFLE9BQXVCLEVBQUUsUUFBaUIsRUFBRSxTQUFTLEdBQUcsS0FBSyxFQUFFLE1BQWEsRUFBRSxRQUFnQixDQUFDLEVBQUUsY0FBc0IsUUFBUTtRQUM3SyxJQUFJLFVBQWdCLENBQUM7UUFFckIsSUFBSTtZQUNBLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztTQUNsRDtRQUFDLE9BQU8sYUFBYSxFQUFFO1lBQ3BCLE1BQU0sU0FBUyxHQUFPO2dCQUNsQixJQUFJLEVBQUUsSUFBSTtnQkFDVixZQUFZLEVBQUUsS0FBSztnQkFDbkIsZUFBZSxFQUFFLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRTthQUMzQyxDQUFDO1lBQ0YsYUFBYSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7WUFFcEMsTUFBTSxhQUFhLENBQUM7U0FDdkI7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUN6QyxVQUFVLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV4QyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDOUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNiLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUN0QztRQUVELE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxVQUFrQixFQUFFLEtBQWEsRUFBRSxVQUFnQixFQUFFLElBQWMsRUFBRSxPQUF1QixFQUFFLFNBQW1CLEVBQUUsUUFBaUI7UUFFNUosSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ2hDLE1BQU0sSUFBSSxhQUFhLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsMkJBQTJCLENBQUMsRUFBRSxvQkFBb0IsQ0FBQyxnQkFBZ0IsRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsYUFBYSxDQUFDLDJCQUEyQixFQUFFLFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDOVE7UUFFRCxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyw0Q0FBNEMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUM3RSxNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdkQsTUFBTSxPQUFPLEdBQXVCLEVBQUUsQ0FBQztRQUV2QyxvRUFBb0U7UUFDcEUsSUFBSSxjQUFjLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ3pDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN0RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFlBQVksRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsRCxVQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDbkUsVUFBVSxHQUFHLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzVDLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDcEI7UUFFRCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2hKLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQy9ILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLGFBQWEsQ0FBQyxVQUFrQixFQUFFLFFBQWlCO1FBQ3ZELElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLEVBQUUsMEJBQTBCLEVBQUUsZ0NBQWdDLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUM1SSxNQUFNLFlBQVksR0FBRyxDQUFDLElBQVksRUFBRSxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxTQUFpQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRXJLLElBQUksUUFBUSxJQUFJLDhDQUE4QyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQzNGLEdBQUcsR0FBRyxZQUFZLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGFBQWEsUUFBUSxHQUFHLENBQUMsQ0FBQztTQUMxRTthQUFNLElBQUksUUFBUSxJQUFJLDhDQUE4QyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUM3RSxHQUFHLElBQUksYUFBYSxRQUFRLEdBQUcsQ0FBQztTQUNuQztRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVPLG1CQUFtQixDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7UUFDMUQsdUNBQXVDO1FBQ3ZDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRU8sa0JBQWtCLENBQUMsR0FBVyxFQUFFLE1BQXVCO1FBQzNELE1BQU0seUJBQXlCLEdBQUcsSUFBSSxhQUFhLENBQUMsR0FBRyxFQUFFLG9CQUFvQixDQUFDLGdCQUFnQixFQUFFLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMzSixLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sRUFBRTtZQUNwQix5QkFBeUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwRDtRQUNELE9BQU8seUJBQXlCLENBQUM7SUFDckMsQ0FBQztJQUVELDZEQUE2RDtJQUNyRCx3QkFBd0IsQ0FBQyxJQUFpQixFQUFFLElBQVk7UUFDNUQsTUFBTSxLQUFLLEdBQWtCLEVBQUUsQ0FBQztRQUNoQyxLQUFLLE1BQU0sS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakMsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtnQkFDekIsS0FBSyxDQUFDLElBQUksQ0FBYyxLQUFLLENBQUMsQ0FBQzthQUNsQztTQUNKO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELHNDQUFzQztJQUM5QixnQkFBZ0IsQ0FBQyxRQUFxQixFQUFFLElBQVk7UUFDeEQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELE9BQU8sS0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTyxvQkFBb0IsQ0FBQyxRQUFxQixFQUFFLElBQVk7UUFDNUQsT0FBTyxRQUFRLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFTyxlQUFlLENBQUMsVUFBZ0IsRUFBRSxNQUFhO1FBQ25ELElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzFCLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQyxJQUFJLEVBQUUsSUFBSSxRQUFRLEVBQUU7Z0JBQ2hCLEtBQUssTUFBTSxRQUFRLElBQUksRUFBRSxDQUFDLG9CQUFvQixFQUFFLEVBQUU7b0JBQzlDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDMUM7Z0JBQ0QsS0FBSyxNQUFNLGFBQWEsSUFBSSxFQUFFLENBQUMseUJBQXlCLEVBQUUsRUFBRTtvQkFDeEQsUUFBUSxDQUFDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDO2lCQUNwRDtnQkFDRCxLQUFLLE1BQU0sZ0JBQWdCLElBQUksRUFBRSxDQUFDLGlDQUFpQyxFQUFFLEVBQUU7b0JBQ25FLFFBQVEsQ0FBQyxnQ0FBZ0MsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2lCQUMvRDtnQkFDRCxLQUFLLE1BQU0sU0FBUyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQTZCLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ2pILEtBQUssTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxFQUFFO3dCQUN0RCxVQUFVLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3FCQUNsRDtpQkFDSjtnQkFFRCxNQUFNLGFBQWEsR0FBRyxFQUFFLENBQUM7Z0JBQ3pCLEtBQUssTUFBTSxlQUFlLElBQUksRUFBRSxDQUFDLGtCQUFrQixFQUFFLEVBQUU7b0JBQ25ELGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQ3ZDO2dCQUNELFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUM5QztTQUNKO0lBQ0wsQ0FBQztJQUVPLGFBQWEsQ0FBQyxJQUFpQjtRQUNuQyxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2xDO2FBQU07WUFDSCxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQUVPLGNBQWMsQ0FBQyxTQUFzQixFQUFFLFdBQW1CO1FBRTlELDRCQUE0QjtRQUM1QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsb0JBQW9CLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4SSxJQUFJLE9BQU8sRUFBRTtZQUNULE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzNELFFBQVEsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlELE9BQU8sUUFBUSxDQUFDO1NBQ25CO1FBRUQsdURBQXVEO1FBQ3ZELE9BQU8sSUFBSSxNQUFNLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRU8sY0FBYyxDQUFDLFNBQXNCLEVBQUUsV0FBbUI7UUFDOUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUM1QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUU7WUFDNUYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3hFLElBQUksR0FBRyxFQUFFO2dCQUNMLE1BQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDN0I7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQW9CLEVBQUUsRUFBRTtZQUNsRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDeEUsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25DO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUU7WUFDdkYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3hFLElBQUksR0FBRyxFQUFFO2dCQUNMLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4QztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBb0IsRUFBRSxFQUFFO1lBQ25GLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdkUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNqQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQW9CLEVBQUUsRUFBRTtZQUN0RixNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQy9GLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0YsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUUzRixJQUFJLHFCQUFxQixFQUFFO2dCQUN2QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMscUNBQXFDLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNyRixNQUFNLGlCQUFpQixHQUFHLElBQUksc0NBQXNDLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzlGLElBQUksY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDMUIsS0FBSyxNQUFNLE9BQU8sSUFBSSxpQkFBaUIsRUFBRTtvQkFDckMsSUFBSSxPQUFPLENBQUMsVUFBVSxLQUFLLGtCQUFrQixDQUFDLEdBQUcsRUFBRTt3QkFDL0MsSUFBSSxPQUFPLENBQUMsaUJBQWlCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDeEMsT0FBTyxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO3lCQUM3RDt3QkFDRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMzQyxjQUFjLEdBQUcsS0FBSyxDQUFDO3dCQUN2QixNQUFNO3FCQUNUO2lCQUNKO2dCQUNELElBQUksY0FBYyxFQUFFO29CQUNoQixNQUFNLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUM7aUJBQzVDO3FCQUFNO29CQUNILE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztpQkFDbkc7YUFDSjtZQUVELElBQUkscUJBQXFCLEVBQUU7Z0JBQ3ZCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3JGLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxzQ0FBc0MsQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztnQkFDOUYsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixLQUFLLE1BQU0sT0FBTyxJQUFJLGlCQUFpQixFQUFFO29CQUNyQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLEtBQUssa0JBQWtCLENBQUMsR0FBRyxFQUFFO3dCQUMvQyxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUN4QyxPQUFPLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7eUJBQzdEO3dCQUNELElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzNDLGNBQWMsR0FBRyxLQUFLLENBQUM7d0JBQ3ZCLE1BQU07cUJBQ1Q7aUJBQ0o7Z0JBQ0QsSUFBSSxjQUFjLEVBQUU7b0JBQ2hCLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztpQkFDNUM7cUJBQU07b0JBQ0gsTUFBTSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2lCQUNuRzthQUNKO1lBRUQsSUFBSSxtQkFBbUIsRUFBRTtnQkFDckIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDbkYsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLG9DQUFvQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUM1RixJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzFCLEtBQUssTUFBTSxPQUFPLElBQUksaUJBQWlCLEVBQUU7b0JBQ3JDLElBQUksT0FBTyxDQUFDLFVBQVUsS0FBSyxrQkFBa0IsQ0FBQyxHQUFHLEVBQUU7d0JBQy9DLElBQUksT0FBTyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7NEJBQ3hDLE9BQU8sQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsQ0FBQzt5QkFDN0Q7d0JBQ0QsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDM0MsY0FBYyxHQUFHLEtBQUssQ0FBQzt3QkFDdkIsTUFBTTtxQkFDVDtpQkFDSjtnQkFDRCxJQUFJLGNBQWMsRUFBRTtvQkFDaEIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO2lCQUMxQztxQkFBTTtvQkFDSCxNQUFNLENBQUMseUJBQXlCLENBQUMsV0FBVyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7aUJBQ25HO2FBQ0o7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILHNDQUFzQztRQUN0QyxJQUFJLENBQUMsd0JBQXdCLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQW9CLEVBQUUsRUFBRTtZQUNyRyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3JFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxjQUFjLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEVBQUU7b0JBQ2xFLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztpQkFDcEU7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztRQUVILDBDQUEwQztRQUMxQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUU7WUFDdEYsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxJQUFJLE9BQU8sSUFBSSxPQUFPLEtBQUssaUJBQWlCLENBQUMsZ0JBQWdCLEVBQUU7Z0JBQzNELE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ3JFLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUFZLEVBQUUsRUFBRTtvQkFDbkMsSUFBSSxjQUFjLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEVBQUU7d0JBQ2xFLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsQ0FBQztxQkFDcEU7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsTUFBTSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQzVDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRU8sbUJBQW1CLENBQUMsbUJBQWdDLEVBQUUsV0FBbUI7UUFDN0UsTUFBTSxtQkFBbUIsR0FBeUIsRUFBRSxDQUFDO1FBQ3JELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsRUFBRSxZQUFZLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBb0IsRUFBRSxFQUFFO1lBQ25HLE1BQU0seUJBQXlCLEdBQStCLEVBQUUsQ0FBQztZQUNqRSxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxJQUFJLGtCQUFrQixDQUFDO1lBQ3JGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQXNCLEVBQUUsRUFBRTtnQkFDeEYsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO2dCQUNsRixNQUFNLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDO2dCQUM5RSxNQUFNLGVBQWUsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztnQkFDL0csSUFBSSxXQUFXLElBQUksWUFBWSxFQUFFO29CQUM3QixNQUFNLHdCQUF3QixHQUFHLElBQUksd0JBQXdCLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUMsQ0FBQztvQkFDMUcseUJBQXlCLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7aUJBQzVEO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFFSCxNQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDcEcsSUFBSSxxQkFBcUIsQ0FBQztZQUMxQixJQUFJLGtCQUFrQixFQUFFO2dCQUNwQixxQkFBcUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUM7YUFDbEU7WUFFRCxNQUFNLGtCQUFrQixHQUFHLElBQUksa0JBQWtCLENBQUMsTUFBTSxFQUFFLHlCQUF5QixFQUFFLHFCQUFxQixDQUFDLENBQUM7WUFDNUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsZUFBNEIsRUFBRSxFQUFFO2dCQUMzRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7Z0JBQ2hGLE1BQU0sU0FBUyxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pFLElBQUksU0FBUyxJQUFJLFNBQVMsS0FBSyxtQkFBbUIsQ0FBQyx5QkFBeUIsSUFBSSxHQUFHLEVBQUU7b0JBQ2pGLGtCQUFrQixDQUFDLDRCQUE0QixDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUN4RDtZQUNMLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFBSSxrQkFBa0IsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLGtCQUFrQixDQUFDLHFCQUFxQixFQUFFLEVBQUU7Z0JBQzVGLG1CQUFtQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2FBQ2hEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLG1CQUFtQixDQUFDO0lBQy9CLENBQUM7SUFFTyxlQUFlLENBQUMsT0FBb0IsRUFBRSxTQUFpQjtRQUMzRCxNQUFNLGVBQWUsR0FBa0IsT0FBTyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN2RSxPQUFPLFFBQVEsQ0FBQyxlQUFlLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFTywwQkFBMEIsQ0FBQyxlQUE0QixFQUFFLFdBQW1CO1FBQ2hGLE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztRQUUxQyxNQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxRixJQUFJLGVBQWUsRUFBRTtZQUNqQixNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzNELFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1NBQzVEO1FBRUQsTUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdDLE1BQU0sVUFBVSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEYsSUFBSSxVQUFVLEVBQUU7WUFDWixJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7Z0JBQ2xELE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3pDLFFBQVEsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDbkU7aUJBQU07Z0JBQ0gsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7YUFDekQ7U0FDSjthQUFNO1lBQ0gsUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMvQjtRQUVELE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGVBQWUsRUFBRSxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkcsSUFBSSxtQkFBbUIsRUFBRTtZQUNyQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNwRixJQUFJLEdBQUcsRUFBRTtnQkFDTCxRQUFRLENBQUMsK0JBQStCLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDakQ7U0FDSjtRQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQW9CLEVBQUUsRUFBRTtZQUNqRyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDeEUsSUFBSSxHQUFHLEVBQUU7Z0JBQ0wsUUFBUSxDQUFDLGdDQUFnQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2xEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUU7WUFDM0YsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakUsSUFBSSxTQUFTLElBQUksR0FBRyxFQUFFO2dCQUNsQixRQUFRLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQzdDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUU7WUFDN0YsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDMUUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQzdFLElBQUksUUFBUSxFQUFFO2dCQUNWLE1BQU0sU0FBUyxHQUFHLElBQUksYUFBYSxDQUMvQixRQUFRLEVBQ1IsT0FBTyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsRUFDakQsT0FBTyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFDOUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFDN0MsT0FBTyxFQUNQLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxFQUM3RCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsRUFDN0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEVBQ3ZELElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUN4RCxPQUFPLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxFQUN0RCxJQUFJLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUNuRCxDQUFDO2dCQUNGLFFBQVEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDcEM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxlQUFlLEVBQUUsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9GLElBQUksZUFBZSxFQUFFO1lBQ2pCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDekQsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMxQztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7SUFFTyxxQ0FBcUMsQ0FBQyxrQkFBK0IsRUFBRSxXQUFtQjtRQUM5RixNQUFNLEVBQUUsR0FBRyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxrQkFBa0IsRUFBRSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sV0FBVyxHQUFHLElBQUksNkJBQTZCLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV6RSxxQ0FBcUM7UUFDckMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFvQixFQUFFLEVBQUU7WUFDOUYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakUsSUFBSSxHQUFHLElBQUksU0FBUyxFQUFFO2dCQUNsQixXQUFXLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQ2hEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDMUcsSUFBSSxxQkFBcUIsRUFBRTtZQUN2QixtREFBbUQ7WUFDbkQsTUFBTSxZQUFZLEdBQUcscUJBQXFCLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxJQUFJLHFCQUFxQixDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6SixXQUFXLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDcEcsSUFBSSxpQkFBaUIsRUFBRTtnQkFDbkIsV0FBVyxDQUFDLG9CQUFvQixDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDdkQ7U0FDSjtRQUVELE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixFQUFFLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBQ3pILElBQUksNEJBQTRCLEVBQUU7WUFDOUIsTUFBTSx3QkFBd0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsNEJBQTRCLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUNsSCxJQUFJLHdCQUF3QixFQUFFO2dCQUMxQixXQUFXLENBQUMsbUNBQW1DLENBQUMsd0JBQXdCLENBQUMsQ0FBQzthQUM3RTtTQUNKO1FBRUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQW9CLEVBQUUsRUFBRTtZQUM5RyxNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUM5RixJQUFJLHlCQUF5QixFQUFFO2dCQUMzQixXQUFXLENBQUMsb0NBQW9DLENBQUMseUJBQXlCLENBQUMsQ0FBQzthQUMvRTtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVPLHFDQUFxQyxDQUFDLGtCQUErQixFQUFFLFdBQW1CO1FBQzlGLE1BQU0sRUFBRSxHQUFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25GLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakYsTUFBTSxXQUFXLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXpFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDbkcsSUFBSSxjQUFjLEVBQUU7WUFDaEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3JGLElBQUksU0FBUyxFQUFFO2dCQUNYLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMvQztTQUNKO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVPLG1DQUFtQyxDQUFDLGtCQUErQixFQUFFLFdBQW1CO1FBQzVGLE1BQU0sRUFBRSxHQUFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ25GLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakYsTUFBTSxXQUFXLEdBQUcsSUFBSSwyQkFBMkIsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDL0YsSUFBSSxZQUFZLEVBQUU7WUFDZCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3JELElBQUksV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3hCLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQzthQUNuRDtTQUNKO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztJQUVPLFlBQVksQ0FBQyxRQUFnQixFQUFFLFdBQW1CO1FBQ3RELElBQUksR0FBRyxHQUFXLFFBQVEsQ0FBQztRQUMzQixxREFBcUQ7UUFDckQsSUFBSSxHQUFHLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDN0IsR0FBRyxHQUFHLEdBQUcsV0FBVyxHQUFHLEdBQUcsRUFBRSxDQUFDO1NBQ2hDO1FBQ0QsNERBQTREO1FBQzVELEdBQUcsR0FBRyxHQUFHLENBQUMsd0JBQXdCLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVELElBQUksR0FBRyxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDM0QsT0FBTyxHQUFHLENBQUM7U0FDZDthQUFNO1lBQ0gsT0FBTyxTQUFTLENBQUM7U0FDcEI7SUFDTCxDQUFDO0lBRU8sYUFBYSxDQUFDLGNBQXNCO1FBQ3hDLElBQUksQ0FBQyxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsRUFBRTtZQUMzQixPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2I7UUFFRCxNQUFNLGtCQUFrQixHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckQsSUFBSSxrQkFBa0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDYjtRQUVELE1BQU0sWUFBWSxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RCxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVDLElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDM0IsT0FBTyxJQUFJLFVBQVUsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakQ7UUFFRCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRXpELE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBRTVELElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxFQUFFO1lBQzNGLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDYjtRQUVELE9BQU8sS0FBSyxHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDckMsQ0FBQzs7QUFsbEJjLDBDQUF5QixHQUFHLENBQUMsQ0FBQyJ9