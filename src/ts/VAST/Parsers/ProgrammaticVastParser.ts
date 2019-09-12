import { Image } from 'Ads/Models/Assets/Image';
import { Video } from 'Ads/Models/Assets/Video';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Platform } from 'Core/Constants/Platform';
import { Vast } from 'VAST/Models/Vast';
import { IVastCampaign, VastCampaign } from 'VAST/Models/VastCampaign';
import { Url } from 'Core/Utilities/Url';
import { VastMediaSelector } from 'VAST/Utilities/VastMediaSelector';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { ICore, ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VastParserStrict } from 'VAST/Utilities/VastParserStrict';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { CoreConfiguration} from 'Core/Models/CoreConfiguration';

export class ProgrammaticVastParser extends CampaignParser {

    public static ContentType = CampaignContentTypes.ProgrammaticVast;

    public static readonly MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD_MESSAGE: string = 'VAST ad contains media files meant for VPAID';
    public static readonly MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD: number = 499;

    public static setVastParserMaxDepth(depth: number): void {
        ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH = depth;
    }

    protected static VAST_PARSER_MAX_DEPTH: number;
    protected _coreApi: ICoreApi;
    protected _requestManager: RequestManager;
    protected _deviceInfo: DeviceInfo;
    protected _vastParserStrict: VastParserStrict;
    protected _coreConfig: CoreConfiguration;

    constructor(core: ICore) {
        super(core.NativeBridge.getPlatform());
        this._deviceInfo = core.DeviceInfo;
        this._coreApi = core.Api;
        this._requestManager = core.RequestManager;
        this._coreConfig = core.Config;
        this._vastParserStrict = new VastParserStrict(undefined, undefined, this._coreConfig);
    }

    public parse(response: AuctionResponse, session: Session): Promise<Campaign> {

        if (ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH !== undefined) {
            this._vastParserStrict.setMaxWrapperDepth(ProgrammaticVastParser.VAST_PARSER_MAX_DEPTH);
        }

        return this.retrieveVast(response).then((vast): Promise<Campaign> => {
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

    protected retrieveVast(response: AuctionResponse): Promise<Vast> {
        const decodedVast = decodeURIComponent(response.getContent()).trim();
        return this._vastParserStrict.retrieveVast(decodedVast, this._coreApi, this._requestManager, response.getAdvertiserBundleId());
    }

    protected parseVastToCampaign(vast: Vast, session: Session, response: AuctionResponse, connectionType?: string): Promise<Campaign> {
        const cacheTTL = response.getCacheTTL();

        const baseCampaignParams: ICampaign = {
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

        const vastImpressionUrls: string[] = [];
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
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_URL_NOT_FOUND], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH,  VastErrorCode.MEDIA_FILE_URL_NOT_FOUND, vast.getErrorURLTemplates(), undefined, response.getSeatId(), response.getCreativeId());
        }

        if (this._platform === Platform.IOS && !mediaVideoUrl.match(/^https:\/\//)) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_UNSUPPORTED_IOS], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_UNSUPPORTED_IOS, vast.getErrorURLTemplates(), mediaVideoUrl, response.getSeatId(), response.getCreativeId());
        }

        if (!Url.isValid(mediaVideoUrl)) {
            throw new CampaignError(VastErrorInfo.errorMap[VastErrorCode.MEDIA_FILE_UNSUPPORTED], CampaignContentTypes.ProgrammaticVast, CampaignErrorLevel.HIGH, VastErrorCode.MEDIA_FILE_UNSUPPORTED, vast.getErrorURLTemplates(), mediaVideoUrl, response.getSeatId(), response.getCreativeId());
        }

        mediaVideoUrl = Url.encode(mediaVideoUrl);

        const vastCampaignParms: IVastCampaign = {
            ... baseCampaignParams,
            vast: vast,
            video: new Video(mediaVideoUrl, session, undefined, response.getCreativeId(), mediaVideo.getWidth(), mediaVideo.getHeight()),
            hasStaticEndscreen: hasStaticEndscreenFlag,
            hasIframeEndscreen: hasIframeEndscreenFlag,
            hasHtmlEndscreen: hasHtmlEndscreenFlag,
            staticPortrait: staticPortraitAsset,
            staticLandscape: staticLandscapeAsset,
            useWebViewUserAgentForTracking: response.getUseWebViewUserAgentForTracking(),
            buyerId: response.getBuyerId() || undefined,
            appCategory: response.getCategory() || undefined,
            appSubcategory: response.getSubCategory() || undefined,
            advertiserDomain: response.getAdvertiserDomain() || undefined,
            advertiserCampaignId: response.getAdvertiserCampaignId() || undefined,
            advertiserBundleId: response.getAdvertiserBundleId() || undefined,
            impressionUrls: vastImpressionUrls,
            isMoatEnabled: response.isMoatEnabled() || undefined
        };

        const campaign = new VastCampaign(vastCampaignParms);

        return Promise.resolve(campaign);
    }

    private getWarnings(vast: Vast): string[] {
        let warnings: string[] = [];
        for (const vastAd of vast.getAds()) {
            warnings = warnings.concat(vastAd.getUnsupportedCompanionAds());
        }
        return warnings.map((warning) => {
            return `Unsupported companionAd : ${warning}`;
        });
    }
}
