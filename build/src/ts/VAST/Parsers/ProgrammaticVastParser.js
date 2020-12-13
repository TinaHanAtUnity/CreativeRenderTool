import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { Url } from 'Core/Utilities/Url';
import { VastMediaSelector } from 'VAST/Utilities/VastMediaSelector';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastParserStrict } from 'VAST/Utilities/VastParserStrict';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
export class ProgrammaticVastParser extends CampaignParser {
    constructor(core) {
        super(core.NativeBridge.getPlatform());
        this._deviceInfo = core.DeviceInfo;
        this._coreApi = core.Api;
        this._requestManager = core.RequestManager;
        this._coreConfig = core.Config;
        this._vastParserStrict = new VastParserStrict(undefined, undefined);
    }
    static setVastParserMaxDepth(depth) {
        ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH = depth;
    }
    parse(response, session) {
        if (ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH !== undefined) {
            this._vastParserStrict.setMaxWrapperDepth(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH);
        }
        return this.retrieveVast(response).then((vast) => {
            const warnings = this.getWarnings(vast);
            if (warnings.length > 0) {
                // report warnings with diagnostic
                SessionDiagnostics.trigger('programmatic_vast_parser_strict_warning', {
                    warnings: warnings
                }, session);
            }
            // if the vast campaign is accidentally a vpaid campaign parse it as such
            if (vast.isVPAIDCampaign()) {
                // throw appropriate campaign error as LOW level(warning level) to be caught and handled in campaign manager
                throw new CampaignError(ProgrammaticVastParser.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD_MESSAGE, CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.MEDIUM, ProgrammaticVastParser.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD, vast.getErrorURLTemplates(), undefined, response.getSeatId(), response.getCreativeId());
            }
            return this._deviceInfo.getConnectionType().then((connectionType) => {
                return this.parseVastToCampaign(vast, session, response, connectionType);
            });
        });
    }
    retrieveVast(response) {
        const decodedVast = decodeURIComponent(response.getContent()).trim();
        return this._vastParserStrict.retrieveVast(decodedVast, this._coreApi, this._requestManager, response.getAdvertiserBundleId());
    }
    parseVastToCampaign(vast, session, response, connectionType) {
        const cacheTTL = response.getCacheTTL();
        const baseCampaignParams = {
            id: this.getProgrammaticCampaignId(),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticVastParser.ContentType,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: undefined,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            isLoadEnabled: false
        };
        const vastImpressionUrls = [];
        for (const impUrl of vast.getImpressionUrls()) {
            if (Url.isValid(impUrl)) {
                vastImpressionUrls.push(Url.encodeUrlWithQueryParams(impUrl));
            }
        }
        let hasStaticEndscreenFlag = false;
        const staticPortraitUrl = vast.getStaticCompanionPortraitUrl();
        const staticLandscapeUrl = vast.getStaticCompanionLandscapeUrl();
        let staticPortraitAsset;
        let staticLandscapeAsset;
        if (staticPortraitUrl) {
            hasStaticEndscreenFlag = true;
            staticPortraitAsset = new Image(Url.encode(staticPortraitUrl), session);
        }
        if (staticLandscapeUrl) {
            hasStaticEndscreenFlag = true;
            staticLandscapeAsset = new Image(Url.encode(staticLandscapeUrl), session);
        }
        const hasIframeEndscreenFlag = !!vast.getIframeCompanionResourceUrl();
        const hasHtmlEndscreenFlag = !!vast.getHtmlCompanionResourceContent();
        const mediaVideo = VastMediaSelector.getOptimizedVastMediaFile(vast.getVideoMediaFiles(), connectionType);
        if (!mediaVideo) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_URL_NOT_FOUND, vast.getErrorURLTemplates(), undefined, response.getSeatId(), response.getCreativeId());
        }
        let mediaVideoUrl = mediaVideo.getFileURL();
        if (!mediaVideoUrl) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_URL_NOT_FOUND, vast.getErrorURLTemplates(), undefined, response.getSeatId(), response.getCreativeId());
        }
        if (this._platform === Platform.IOS && !mediaVideoUrl.match(/^https:\/\//)) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_UNSUPPORTED_IOS], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_UNSUPPORTED_IOS, vast.getErrorURLTemplates(), mediaVideoUrl, response.getSeatId(), response.getCreativeId());
        }
        if (!Url.isValid(mediaVideoUrl)) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_UNSUPPORTED], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_UNSUPPORTED, vast.getErrorURLTemplates(), mediaVideoUrl, response.getSeatId(), response.getCreativeId());
        }
        mediaVideoUrl = Url.encode(mediaVideoUrl);
        const vastCampaignParms = Object.assign({}, baseCampaignParams, { vast: vast, video: new Video(mediaVideoUrl, session, undefined, response.getCreativeId(), mediaVideo.getWidth(), mediaVideo.getHeight()), hasStaticEndscreen: hasStaticEndscreenFlag, hasIframeEndscreen: hasIframeEndscreenFlag, hasHtmlEndscreen: hasHtmlEndscreenFlag, staticPortrait: staticPortraitAsset, staticLandscape: staticLandscapeAsset, useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(), buyerId: response.getBuyerId() || undefined, appCategory: response.getCategory() || undefined, appSubcategory: response.getSubCategory() || undefined, advertiserDomain: response.getAdvertiserDomain() || undefined, advertiserCampaignId: response.getAdvertiserCampaignId() || undefined, advertiserBundleId: response.getAdvertiserBundleId() || undefined, impressionUrls: vastImpressionUrls, isMoatEnabled: response.isMoatEnabled() || undefined, isOMEnabled: false, omVendors: [] });
        const campaign = new VastCampaign(vastCampaignParms);
        return Promise.resolve(campaign);
    }
    getWarnings(vast) {
        let warnings = [];
        for (const vastAd of vast.getAds()) {
            warnings = warnings.concat(vastAd.getUnsupportedCompanionAds());
        }
        return warnings.map((warning) => {
            return `Unsupported companionAd : ${warning}`;
        });
    }
}
ProgrammaticVastParser.ContentType = CampaignContentTypes.ProgrammaticVast;
ProgrammaticVastParser.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD_MESSAGE = 'VAST ad contains media files meant for VPAID';
ProgrammaticVastParser.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD = 499;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljVmFzdFBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL1BhcnNlcnMvUHJvZ3JhbW1hdGljVmFzdFBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSWhELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFpQixZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUN2RSxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDekMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzdFLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFDM0YsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFHMUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFbkUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFHdEUsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGNBQWM7SUFrQnRELFlBQVksSUFBVztRQUNuQixLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFH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