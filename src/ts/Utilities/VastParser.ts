import { Vast } from 'Models/Vast';
import { VastAd } from 'Models/VastAd';
import { VastCreative } from 'Models/VastCreative';
import { VastCreativeLinear } from 'Models/VastCreativeLinear';
import { VastMediaFile } from 'Models/VastMediaFile';
import { VastCreativeCompanion } from 'Models/VastCreativeCompanion';
import { VastCompanionAd } from 'Models/VastCompanionAd';

export class VastParser {

    private _domParser: DOMParser;

    constructor();
    constructor(domParser: DOMParser);
    constructor(domParser?: DOMParser) {
        this._domParser = domParser || new DOMParser();
    }

    public parseVast(vastString: string, gamerId: string, abGroup: number): Vast {
        let xml = (this._domParser).parseFromString(vastString, 'text/xml');
        let ads: VastAd[] = [], errorURLTemplates: string[] = [];

        if (xml == null) {
            return null;
        }

        if (xml.documentElement == null) {
            return null;
        }

        if (xml.documentElement.nodeName !== 'VAST') {
            return null;
        }

        let childNodes = xml.documentElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let node = childNodes[i];

            if (node.nodeName === 'Error') {
                errorURLTemplates.push(this.parseNodeText(node));
            } else if (ads.length === 0 && node.nodeName === 'Ad') { // ignore ads after the first one
                let ad = this.parseAdElement(node);
                if (ad != null) {
                    ads.push(ad);
                } else {
                    // TODO error handling
                    //VASTUtil.track(response.errorURLTemplates, {
                    //    ERRORCODE: 101
                    //});
                }
            }
        }

        return new Vast(ads, errorURLTemplates, gamerId, abGroup);
    }

    private parseNodeText(node: any): string {
        return node && (node.textContent || node.text);
    }

    private parseAdElement(adElement: any): VastAd {
        let adTypeElement, childNodes, ad: VastAd;
        childNodes = adElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            adTypeElement = childNodes[i];
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
        let ad, wrapperCreativeElement, wrapperURLElement;
        ad = this.parseInLineElement(wrapperElement);
        wrapperURLElement = this.childByName(wrapperElement, 'VASTAdTagURI');
        if (wrapperURLElement != null) {
            ad.nextWrapperURL = this.parseNodeText(wrapperURLElement);
        }
        wrapperCreativeElement = ad.creatives[0];
        if ((wrapperCreativeElement != null) && (wrapperCreativeElement.trackingEvents != null)) {
            ad.trackingEvents = wrapperCreativeElement.trackingEvents;
        }
        if (ad.nextWrapperURL != null) {
            return ad;
        }
    }

    private parseInLineElement(inLineElement: any): any {
        const parseCompanions = false;
        let ad = new VastAd();
        let childNodes = inLineElement.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let node = childNodes[i];
            switch (node.nodeName) {
                case 'Error':
                    ad.addErrorURLTemplate(this.parseNodeText(node));
                    break;
                case 'Impression':
                    ad.addImpressionURLTemplate(this.parseNodeText(node));
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
                                case 'CompanionAds':
                                    if (parseCompanions) {
                                        creative = this.parseCompanionAd(creativeTypeElement);
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

    private parseCompanionAd(creativeElement: any): any {
        let creative = new VastCreativeCompanion();

        let companionElements = this.childsByName(creativeElement, 'Companion');
        for (let i = 0; i < companionElements.length; i++) {
            let companionResource = companionElements[i];

            let companionAd = new VastCompanionAd(companionResource.getAttribute('id') || null,
                companionResource.getAttribute('width'), companionResource.getAttribute('height'));

            let htmlResourceElements = this.childsByName(companionResource, 'HTMLResource');
            for (let j = 0; j < htmlResourceElements.length; j++) {
                let htmlElement = htmlResourceElements[j];
                companionAd.setType(htmlElement.getAttribute('creativeType') || 'text/html');
                companionAd.setHTMLResource(this.parseNodeText(htmlElement));
            }

            let iframeResourceElements = this.childsByName(companionResource, 'IFrameResource');
            for (let j = 0; j < iframeResourceElements.length; j++) {
                let iframeElement = iframeResourceElements[j];
                companionAd.setType(iframeElement.getAttribute('creativeType') || 0);
                companionAd.setIFrameResource(this.parseNodeText(iframeElement));
            }

            let staticResourceElements = this.childsByName(companionResource, 'StaticResource');
            for (let j = 0; j < staticResourceElements.length; j++) {
                let staticElement = staticResourceElements[j];
                companionAd.setType(staticElement.getAttribute('creativeType') || 0);
                companionAd.setStaticResource(this.parseNodeText(staticElement));
            }

            let trackingEventsElements = this.childsByName(companionResource, 'TrackingEvents');
            for (let k = 0; k < trackingEventsElements.length; k++) {
                let trackingEventsElement = trackingEventsElements[k];
                let trackingElements = this.childsByName(trackingEventsElement, 'Tracking');
                for (let l = 0; l < trackingElements.length; l++) {
                    let trackingElement = trackingElements[l];
                    let eventName = trackingElement.getAttribute('event');
                    let trackingURLTemplate = this.parseNodeText(trackingElement);
                    if ((eventName != null) && (trackingURLTemplate != null)) {
                        companionAd.addTrackingEvent(eventName, trackingURLTemplate);
                    }
                }
            }

            companionAd.setCompanionClickThroughURLTemplate(this.parseNodeText(this.childByName(companionResource, 'CompanionClickThrough')));

            creative.addVariation(companionAd);
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
        let matches = [];
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
